// frontend/src/components/MonthlySummary.jsx
import { useState, useEffect } from "react";
import { PieChart, Pie, Cell, Legend } from "recharts";

export default function MonthlySummary() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState({
    present: 0,
    absent: 0,
    late: 0,
    "half-day": 0,
    totalHours: 0,
  });
  const [recent, setRecent] = useState([]);

  const token = localStorage.getItem("token");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch("http://localhost:5000/api/attendance/my-summary", {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });

        if (!res.ok) {
          const text = await res.text().catch(() => "");
          throw new Error(`Server ${res.status} ${text}`);
        }

        const data = await res.json();
        if (cancelled) return;

        if (data?.summary) {
          setSummary({
            present: data.summary.present || 0,
            absent: data.summary.absent || 0,
            late: data.summary.late || 0,
            "half-day": data.summary["half-day"] || 0,
            totalHours: Number(data.summary.totalHours || 0).toFixed(2),
          });

          setRecent(Array.isArray(data.recent) ? data.recent : []);
        } else {
          setSummary((s) => ({ ...s }));
          setRecent([]);
        }
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => (cancelled = true);
  }, [token]);

  // ⭐ MOVED HERE (outside useEffect)
  const chartData = [
    { name: "Present", value: summary.present },
    { name: "Late", value: summary.late },
    { name: "Absent", value: summary.absent },
    { name: "Half-day", value: summary["half-day"] },
  ];

  const COLORS = ["#4ade80", "#facc15", "#f87171", "#fb923c"];

  if (loading) {
    return (
      <div className="bg-white shadow p-6 rounded">
        <h3 className="text-lg font-semibold mb-2">This Month</h3>
        <p>Loading summary…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white shadow p-6 rounded">
        <h3 className="text-lg font-semibold mb-2">This Month</h3>
        <div className="text-red-600">Summary not available: {error}</div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow p-6 rounded">
      <h3 className="text-lg font-semibold mb-4">This Month</h3>

      {/* Donut Chart */}
      <div className="flex justify-center mb-6">
        <PieChart width={260} height={260}>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={4}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={index} fill={COLORS[index]} />
            ))}
          </Pie>
          <Legend />
        </PieChart>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 mb-4">
        <div className="bg-green-50 rounded p-3 text-center">
          <div className="text-sm text-green-700">Present</div>
          <div className="text-xl font-bold">{summary.present}</div>
        </div>

        <div className="bg-red-50 rounded p-3 text-center">
          <div className="text-sm text-red-700">Absent</div>
          <div className="text-xl font-bold">{summary.absent}</div>
        </div>

        <div className="bg-yellow-50 rounded p-3 text-center">
          <div className="text-sm text-yellow-800">Late</div>
          <div className="text-xl font-bold">{summary.late}</div>
        </div>

        <div className="bg-orange-50 rounded p-3 text-center">
          <div className="text-sm text-orange-800">Half-day</div>
          <div className="text-xl font-bold">{summary["half-day"]}</div>
        </div>
      </div>

      {/* Total Hours */}
      <div className="mb-4 font-semibold">
        Total hours: <span className="font-bold">{summary.totalHours}</span>
      </div>

      {/* Recent Table */}
      <div>
        <div className="font-semibold mb-2">Recent (7 days)</div>
        <div className="space-y-2 text-sm">
          {recent.length === 0 ? (
            <div className="text-gray-500">No recent records</div>
          ) : (
            recent.map((r) => (
              <div key={r._id} className="flex justify-between items-center">
                <div>{r.date} •</div>

                <div className="text-gray-600">
                  {(r.checkInTime && new Date(r.checkInTime).toLocaleTimeString()) || "-"}{" "}
                  / {(r.checkOutTime && new Date(r.checkOutTime).toLocaleTimeString()) || "-"}
                </div>

                <div className="capitalize" style={{ minWidth: 80 }}>
                  {r.status || "-"}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
