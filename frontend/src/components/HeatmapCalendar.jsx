import { useEffect, useState } from "react";

export default function HeatmapCalendar({ date }) {
  const [days, setDays] = useState([]);
  const token = localStorage.getItem("token");
  const daysArray = Array.isArray(days) ? days : [];

  const year = date.getFullYear();
  const month = date.getMonth() + 1;

  // Load data
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(
          `http://localhost:5000/api/attendance/month-heatmap?year=${year}&month=${month}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const data = await res.json();
        setDays(data);
      } catch (err) {
        console.error("Heatmap error:", err);
      }
    }

    load();
  }, [month]);

  // Prepare month days
  const totalDays = new Date(year, month, 0).getDate();

  const mapped = [...Array(totalDays)].map((_, i) => {
    const d = String(i + 1).padStart(2, "0");
    const dateStr = `${year}-${String(month).padStart(2, "0")}-${d}`;

    const rec = daysArray.find((x) => x.date === dateStr);
    const status = rec ? rec.status : "none";

    const colors = {
      present: "#4ade80",
      late: "#facc15",
      absent: "#f87171",
      "half-day": "#fb923c",
      none: "#e5e7eb",
    };

    return {
      date: dateStr,
      color: colors[status],
    };
  });

  return (
    <div>
      <h3 className="font-semibold mb-2">This Month Heatmap</h3>

      <div className="grid grid-cols-7 gap-1">
        {mapped.map((d) => (
          <div
            key={d.date}
            className="w-6 h-6 rounded"
            style={{ background: d.color }}
            title={d.date}
          />
        ))}
      </div>

      <p className="text-sm text-gray-500 mt-2">
        Green = Present, Yellow = Late, Red = Absent
      </p>
    </div>
  );
}
