import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import MonthlySummary from "../components/MonthlySummary";
import HeatmapCalendar from "../components/HeatmapCalendar";

export default function EmployeeDashboard() {
  const [status, setStatus] = useState(null);
  const token = localStorage.getItem("token");

  // Fetch today's status
  const loadStatus = async () => {
    const res = await fetch("http://localhost:5000/api/attendance/today", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();
    setStatus(data);
  };

  const checkIn = async () => {
    const res = await fetch("http://localhost:5000/api/attendance/checkin", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();
    alert(data.message);
    loadStatus();
  };

  const checkOut = async () => {
    const res = await fetch("http://localhost:5000/api/attendance/checkout", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();
    alert(data.message);
    loadStatus();
  };

  useEffect(() => {
    loadStatus();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar title="Employee Dashboard" />

      <div className="p-10">
        <h1 className="text-3xl font-bold mb-5">Employee Dashboard</h1>

        {/* responsive grid: attendance card on top and summary below on small screens,
            side-by-side on md+ screens — this will not remove your existing card */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* LEFT: Today's Attendance (your existing card) */}
          <div className="bg-white shadow p-6 rounded">
            <h2 className="text-xl mb-3 font-semibold">Today's Attendance</h2>

            {status === null ? (
              <p>Loading...</p>
            ) : status?.checkInTime ? (
              <p className="mb-2">
                Checked In: <b>{new Date(status.checkInTime).toLocaleTimeString()}</b>
              </p>
            ) : (
              <p className="mb-2">You haven’t checked in today.</p>
            )}

            {status?.checkOutTime && (
              <p className="mb-2">
                Checked Out: <b>{new Date(status.checkOutTime).toLocaleTimeString()}</b>
              </p>
            )}

            <div className="mt-4 space-y-2">
              {!status?.checkInTime && (
                <button
                  onClick={checkIn}
                  className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
                >
                  Check In
                </button>
              )}

              {status?.checkInTime && !status?.checkOutTime && (
                <button
                  onClick={checkOut}
                  className="w-full bg-red-500 text-white py-2 rounded hover:bg-red-600"
                >
                  Check Out
                </button>
              )}
            </div>
                       {/* Heatmap under today's attendance */}
                    <div className="bg-white shadow p-6 rounded mt-6">
                            <HeatmapCalendar date={new Date()} />
                     </div>
            
          </div>


 


          {/* RIGHT: Monthly summary (safe component) */}
          <div>
            <MonthlySummary />
          </div>
        </div>

        {/* keep any additional content below unchanged */}
      </div>
    </div>
  );

}
