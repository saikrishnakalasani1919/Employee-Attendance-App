const Attendance = require("../models/Attendance");
const User = require("../models/User");
const mongoose = require("mongoose");

// ------------------------- UTILS -------------------------
function getTodayDate() {
  return new Date().toISOString().split("T")[0];
}

// ------------------------- CHECK-IN -------------------------
exports.checkIn = async (req, res) => {
  try {
    const userId = req.user.id;
    const date = getTodayDate();

    const existing = await Attendance.findOne({ userId, date });

    if (existing?.checkInTime) {
      return res.status(400).json({ message: "Already checked in today" });
    }

    const now = new Date();
    const attendance = existing || new Attendance({ userId, date });

    attendance.checkInTime = now;

    const lateCutoff = new Date();
    lateCutoff.setHours(9, 30, 0, 0);

    attendance.status = now > lateCutoff ? "late" : "present";

    await attendance.save();
    res.json({ message: "Checked in", attendance });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ------------------------- CHECK-OUT -------------------------
exports.checkOut = async (req, res) => {
  try {
    const userId = req.user.id;
    const date = getTodayDate();

    const attendance = await Attendance.findOne({ userId, date });

    if (!attendance?.checkInTime) {
      return res.status(400).json({ message: "You must check in first" });
    }

    if (attendance.checkOutTime) {
      return res.status(400).json({ message: "Already checked out" });
    }

    attendance.checkOutTime = new Date();
    attendance.totalHours =
      ((attendance.checkOutTime - attendance.checkInTime) / (1000 * 60 * 60)).toFixed(2);

    await attendance.save();
    res.json({ message: "Checked out", attendance });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ------------------------- MY HISTORY -------------------------
exports.myHistory = async (req, res) => {
  const userId = req.user.id;
  const records = await Attendance.find({ userId }).sort({ date: -1 });
  res.json(records);
};

// ------------------------- TODAY STATUS -------------------------
exports.todayStatus = async (req, res) => {
  const userId = req.user.id;
  const date = getTodayDate();
  const record = await Attendance.findOne({ userId, date });
  res.json(record || { status: "not-checked-in" });
};


// ------------------------- MANAGER: ALL ATTENDANCE -------------------------
// exports.getAllAttendance = async (req, res) => {
//     try {
//       const { employeeId, date, status } = req.query;
  
//       let query = {};
  
//       // Match by employeeId → get userId first
//       // if (employeeId) {
//       //   query.userId = employeeId; // In frontend we will use _id
//       // }

//       if (employeeId) {
//         query.$or = [
//           { userId: employeeId },                 // MongoDB id
//           { "userId.employeeId": employeeId }     // EmployeeID (EMP001)
//         ];
//       }
      
  
//       if (date) {
//         query.date = date; // yyyy-mm-dd
//       }
  
//       if (status) {
//         query.status = status;
//       }
  
//       const records = await Attendance.find(query)
//         .populate("userId", "name email employeeId department")
//         .sort({ date: -1 });
  
//       res.json(records);
//     } catch (err) {
//       res.status(500).json({ error: err.message });
//     }
//   };
 // ------------------------- MANAGER: ALL ATTENDANCE -------------------------
 exports.getAllAttendance = async (req, res) => {
  try {
    const { employeeId, date, status } = req.query;

    let query = {};

    // Employee filter (SAFE)
    if (employeeId) {
      let user = null;

      // 1. If it's a valid ObjectId, try findById
      if (mongoose.Types.ObjectId.isValid(employeeId)) {
        user = await User.findById(employeeId);
      }

      // 2. If not found, try custom employeeId
      if (!user) {
        user = await User.findOne({ employeeId });
      }

      // 3. If still not found, return EMPTY ARRAY (never crash)
      if (!user) return res.json([]);

      query.userId = user._id;
    }

    if (date) query.date = date;
    if (status) query.status = status;

    const records = await Attendance.find(query)
      .populate("userId", "name email employeeId department")
      .sort({ date: -1 });

    res.json(records);
  } catch (err) {
    console.error("Attendance Error:", err);
    res.json([]); // SAFE: frontend never crashes
  }
};




// =============================
// Monthly analytics for manager
// GET /api/attendance/analytics/monthly
// =============================
exports.getMonthlyAnalytics = async (req, res) => {
  try {
    // current month range
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth(); // 0-indexed
    const monthStart = new Date(year, month, 1);
    const monthEnd = new Date(year, month + 1, 1);

    // aggregate by date and status
    const agg = await Attendance.aggregate([
      {
        $match: {
          date: {
            $gte: monthStart.toISOString().slice(0, 10),
            $lt: monthEnd.toISOString().slice(0, 10)
          }
        }
      },
      {
        $group: {
          _id: { date: "$date", status: "$status" },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.date": 1 } }
    ]);

    // pivot into daily array and totals
    const dailyMap = {}; // date -> { present:0, late:0, absent:0, "half-day":0 }
    const totals = { present: 0, late: 0, absent: 0, "half-day": 0 };

    agg.forEach((r) => {
      const date = r._id.date;
      const status = r._id.status;
      if (!dailyMap[date]) dailyMap[date] = { date, present: 0, late: 0, absent: 0, "half-day": 0 };
      dailyMap[date][status] = (dailyMap[date][status] || 0) + r.count;
      totals[status] = (totals[status] || 0) + r.count;
    });

    // produce ordered daily array for the whole month (fill missing days with zeros)
    const daily = [];
    for (let d = new Date(monthStart); d < monthEnd; d.setDate(d.getDate() + 1)) {
      const iso = d.toISOString().slice(0, 10);
      daily.push(dailyMap[iso] || { date: iso, present: 0, late: 0, absent: 0, "half-day": 0 });
    }

    return res.json({
      daily,
      statusTotals: totals
    });
  } catch (err) {
    console.error("getMonthlyAnalytics error:", err);
    return res.status(500).json({ error: err.message });
  }
};


  // ------------------------- MANAGER: EXPORT CSV -------------------------
  exports.exportCSV = async (req, res) => {
    try {
      const records = await Attendance.find({})
        .populate("userId", "name email employeeId department");
  
      let rows = [
        "employeeId,name,email,department,date,checkIn,checkOut,status,totalHours",
      ];
  
      records.forEach((rec) => {
        rows.push(
          `${rec.userId.employeeId},${rec.userId.name},${rec.userId.email},${rec.userId.department},${rec.date},${rec.checkInTime || ""},${rec.checkOutTime || ""},${rec.status},${rec.totalHours}`
        );
      });
  
      res.header("Content-Type", "text/csv");
      res.attachment("attendance_report.csv");
      res.send(rows.join("\n"));
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };
  // ---------------------- MANAGER: TODAY TEAM STATUS -------------------------
  exports.todayTeamStatus = async (req, res) => {
    try {
      const today = new Date().toISOString().split("T")[0];
      const records = await Attendance.find({ date: today })
        .populate("userId", "name employeeId department email");
  
      res.json(records);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };
  


  // =============================
//  Monthly Summary for Employee
// =============================
 

exports.getMySummary = async (req, res) => {
  try {
    const userId = req.user.id;

    // Today's date details
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth(); // 0 = January

    // Month start and end
    const monthStart = new Date(year, month, 1);
    const monthEnd = new Date(year, month + 1, 1);

    // Load all attendance of this user this month
    const records = await Attendance.find({
      userId: new mongoose.Types.ObjectId(userId),
      date: {
        $gte: monthStart.toISOString().slice(0, 10),
        $lte: monthEnd.toISOString().slice(0, 10)
      }
    }).sort({ date: -1 });

    // Default summary
    const summary = {
      present: 0,
      absent: 0,
      late: 0,
      "half-day": 0,
      totalHours: 0
    };

    for (const rec of records) {
      if (rec.status === "present") summary.present++;
      if (rec.status === "absent") summary.absent++;
      if (rec.status === "late") summary.late++;
      if (rec.status === "half-day") summary["half-day"]++;

      summary.totalHours += Number(rec.totalHours || 0);
    }

    const recent = await Attendance.find({
      userId: new mongoose.Types.ObjectId(userId)
    })
      .sort({ date: -1 })
      .limit(7);

    return res.json({
      summary,
      recent
    });

  } catch (err) {
    return res.status(500).json({
      error: err.message
    });
  }
};




// ------------------------- MONTH HEATMAP -------------------------
// =============================
// Month Heatmap for Employee
// =============================
exports.getMonthHeatmap = async (req, res) => {
  try {
    const userId = req.user.id;
    const { year, month } = req.query;

    if (!year || !month) {
      return res.status(400).json({ error: "year and month required" });
    }

    const monthStr = month.toString().padStart(2, "0");

    // Load all attendance records for that month
    const records = await Attendance.find({
      userId,
      date: { $regex: `^${year}-${monthStr}` }
    }).select("date status");

    return res.json(records);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
