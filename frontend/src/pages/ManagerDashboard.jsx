import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import ManagerCharts from "../components/ManagerCharts";
import { useRef } from "react";

export default function ManagerDashboard() {
  const [records, setRecords] = useState([]);

  // 👉 Input filters (user typing)
  const [tempFilters, setTempFilters] = useState({
    employeeId: "",
    date: "",
    status: "",
  });

  // 👉 Actual filters applied
  const [filters, setFilters] = useState({});

  const [summary, setSummary] = useState({
    present: 0,
    late: 0,
    absent: 0,
    halfday: 0,
    total: 0,
  });

  const token = localStorage.getItem("token");

  // ------------------------ LOAD DATA ------------------------
  const loadData = async () => {
    const query = new URLSearchParams(
      Object.fromEntries(
        Object.entries(filters).filter(([_, v]) => v !== "" && v !== undefined)
      )
    ).toString();

    const res = await fetch(`http://localhost:5000/api/attendance/all?${query}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();
    setRecords(data);
  };

  // ------------------------ LOAD SUMMARY ------------------------
  const loadSummary = async () => {
    const res = await fetch("http://localhost:5000/api/attendance/today-status", {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();

    setSummary({
      present: data.filter((d) => d.status === "present").length,
      late: data.filter((d) => d.status === "late").length,
      absent: data.filter((d) => d.status === "absent").length,
      halfday: data.filter((d) => d.status === "half-day").length,
      total: data.length,
    });
  };

  // Load data when filters change
  useEffect(() => {
    loadData();
  }, [filters]);

  useEffect(() => {
    loadSummary();
  }, []);

  // ------------------------ HANDLERS ------------------------
  const onFilterChange = (e) => {
    setTempFilters({ ...tempFilters, [e.target.name]: e.target.value });
  };

  const applyFilters = () => {
    setFilters(tempFilters); // applies filters
  };

  const resetFilters = () => {
    setTempFilters({ employeeId: "", date: "", status: "" });
    setFilters({}); // clears filters → reloads instantly
  };

  const exportCSV = async () => {
    const res = await fetch("http://localhost:5000/api/attendance/export", {
      headers: { Authorization: `Bearer ${token}` },
    });

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "attendance.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar title="Manager Dashboard" />
      <div className="p-10">

        <h1 className="text-3xl font-bold mb-5">Manager Dashboard</h1>

        {/* SUMMARY CARDS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-6">
          <div className="bg-green-100 p-4 rounded shadow text-center">
            <h3 className="font-bold text-green-700">Present</h3>
            <p className="text-2xl font-bold">{summary.present}</p>
          </div>

          <div className="bg-yellow-100 p-4 rounded shadow text-center">
            <h3 className="font-bold text-yellow-700">Late</h3>
            <p className="text-2xl font-bold">{summary.late}</p>
          </div>

          <div className="bg-red-100 p-4 rounded shadow text-center">
            <h3 className="font-bold text-red-700">Absent</h3>
            <p className="text-2xl font-bold">{summary.absent}</p>
          </div>

          <div className="bg-blue-100 p-4 rounded shadow text-center">
            <h3 className="font-bold text-blue-700">Total Employees</h3>
            <p className="text-2xl font-bold">{summary.total}</p>
          </div>
        </div>

 


        {/* CHARTS */}
<div className="mb-6">
  <ManagerCharts />
</div>


        {/* FILTERS */}
        <div className="bg-white rounded shadow p-4 mb-6 w-full max-w-3xl">
          <h2 className="text-xl font-semibold mb-4">Filters</h2>

          <div className="flex gap-4 mb-4 flex-wrap">
            <input
              name="employeeId"
              placeholder="Employee ID"
              value={tempFilters.employeeId}
              className="p-2 border rounded"
              onChange={onFilterChange}
            />

            <input
              type="date"
              name="date"
              value={tempFilters.date}
              className="p-2 border rounded"
              onChange={onFilterChange}
            />

            <select
              name="status"
              value={tempFilters.status}
              className="p-2 border rounded"
              onChange={onFilterChange}
            >
              <option value="">Status</option>
              <option value="present">Present</option>
              <option value="late">Late</option>
              <option value="absent">Absent</option>
              <option value="half-day">Half Day</option>
            </select>

            <button
              onClick={applyFilters}
              className="bg-blue-500 text-white px-4 rounded hover:bg-blue-600"
            >
              Apply
            </button>

            <button
              onClick={resetFilters}
              className="bg-gray-400 text-white px-4 rounded hover:bg-gray-500"
            >
              Reset
            </button>

            <button
              onClick={exportCSV}
              className="bg-green-500 text-white px-4 rounded hover:bg-green-600"
            >
              Export CSV
            </button>

             

          </div>
        </div>

        {/* TABLE */}
        <div className="bg-white rounded shadow p-4 w-full overflow-x-auto">
          <h2 className="text-xl font-semibold mb-4">Attendance Records</h2>

          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-200 text-left">
                <th className="p-2 border">Employee ID</th>
                <th className="p-2 border">Name</th>
                <th className="p-2 border">Department</th>
                <th className="p-2 border">Date</th>
                <th className="p-2 border">Check In</th>
                <th className="p-2 border">Check Out</th>
                <th className="p-2 border">Status</th>
                <th className="p-2 border">Hours</th>
              </tr>
            </thead>

            <tbody>
              {records.length === 0 ? (
                <tr>
                  <td className="p-4 text-center" colSpan="8">
                    No records found
                  </td>
                </tr>
              ) :
              
              (
               
                records.map((rec) => (
                  <tr key={rec._id} className="hover:bg-gray-50">
                    <td className="p-2 border">{rec.userId?.employeeId}</td>
                    <td className="p-2 border">{rec.userId?.name}</td>
                    <td className="p-2 border">{rec.userId?.department}</td>
                    <td className="p-2 border">{rec.date}</td>
                    <td className="p-2 border">
                      {rec.checkInTime
                        ? new Date(rec.checkInTime).toLocaleTimeString()
                        : "-"}
                    </td>
                    <td className="p-2 border">
                      {rec.checkOutTime
                        ? new Date(rec.checkOutTime).toLocaleTimeString()
                        : "-"}
                    </td>
                    <td className="p-2 border capitalize">{rec.status}</td>
                    <td className="p-2 border">{rec.totalHours}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}
