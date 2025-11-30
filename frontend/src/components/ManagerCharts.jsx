import { useEffect, useState } from "react";
import {
  PieChart, Pie, Cell, Tooltip as ReTooltip, ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Legend
} from "recharts";

const COLORS = ["#10B981", "#F59E0B", "#EF4444"]; // green, amber, red

export default function ManagerCharts() {
  const [data, setData] = useState({ daily: [], statusTotals: {} });
  const token = localStorage.getItem("token");

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch("http://localhost:5000/api/attendance/analytics/monthly", {
          headers: { Authorization: `Bearer ${token}` }
        });
        const json = await res.json();
        if (!mounted) return;
        setData(json);
      } catch (err) {
        console.error("charts fetch error", err);
      }
    })();
    return () => (mounted = false);
  }, [token]);

  const { daily = [], statusTotals = {} } = data;

  const pieData = [
    { name: "Present", value: statusTotals.present || 0 },
    { name: "Late", value: statusTotals.late || 0 },
    { name: "Absent", value: statusTotals.absent || 0 },
  ];

  // format line data: date + present
  const lineData = daily.map(d => ({ date: d.date.slice(5), present: d.present || 0 }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white rounded shadow p-4">
        <h3 className="font-semibold mb-2">Month status breakdown</h3>
        <div style={{ width: "100%", height: 260 }}>
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={70}
                innerRadius={40}
                label
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <ReTooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded shadow p-4">
        <h3 className="font-semibold mb-2">Daily present (this month)</h3>
        <div style={{ width: "100%", height: 260 }}>
          <ResponsiveContainer>
            <LineChart data={lineData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis allowDecimals={false} />
              <ReTooltip />
              <Legend />
              <Line type="monotone" dataKey="present" stroke="#10B981" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
