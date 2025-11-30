const router = require("express").Router();
const { protect } = require("../middleware/authMiddleware");
 
const { 
  checkIn,
  checkOut,
  myHistory,
  todayStatus,
  getAllAttendance,
  exportCSV,
  todayTeamStatus,
  getMySummary,
  getMonthlyAnalytics,
  getMonthHeatmap
} = require("../controllers/attendanceController");

// Employee Routes
router.post("/checkin", protect, checkIn);
router.post("/checkout", protect, checkOut);
router.get("/my-history", protect, myHistory);
router.get("/today", protect, todayStatus);


 

// Monthly Summary (EMPLOYEE)
router.get("/my-summary", protect, getMySummary);

// Manager Routes
router.get("/all", protect, getAllAttendance);
router.get("/export", protect, exportCSV);
router.get("/today-status", protect, todayTeamStatus);


// after other manager routes
router.get("/analytics/monthly", protect, getMonthlyAnalytics);

router.get("/month-heatmap", protect, getMonthHeatmap);
module.exports = router;
