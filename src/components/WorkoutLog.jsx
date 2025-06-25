import { useEffect, useState } from "react";
import initSqlJs from "sql.js";

// Format a Date object as YYYY-MM-DD in local time
function formatDateLocal(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
// Parse a YYYY-MM-DD string as a local Date object
function parseDateLocal(str) {
  const [year, month, day] = str.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export default function WorkoutLog({ selectedDate, onDateSelect }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [db, setDb] = useState(null);

  // Load DB only once
  useEffect(() => {
    const loadDb = async () => {
      try {
        const SQL = await initSqlJs({
          locateFile: (file) => `https://sql.js.org/dist/${file}`,
        });
        const response = await fetch("/FitNotes_Backup.fitnotes");
        const arrayBuffer = await response.arrayBuffer();
        const dbInstance = new SQL.Database(new Uint8Array(arrayBuffer));
        setDb(dbInstance);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    loadDb();
  }, []);

  // Query for the selected date
  useEffect(() => {
    if (!db) return;
    setLoading(true);
    try {
      const query = `
        SELECT 
          t.date,
          e.name AS exercise_name,
          t.reps,
          t.metric_weight,
          c.comment AS comment
        FROM training_log t
        LEFT JOIN exercise e ON t.exercise_id = e._id
        LEFT JOIN Comment c ON c.owner_id = t._id
        WHERE t.date = ?
        ORDER BY t.date DESC;
      `;
      const result = db.exec(query, [selectedDate]);
      if (result.length > 0) {
        setRows(
          result[0].values.map((row) => {
            return {
              date: row[0],
              exercise_name: row[1],
              reps: row[2],
              metric_weight: row[3],
              comment: row[4],
            };
          })
        );
      } else {
        setRows([]);
      }
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }, [db, selectedDate]);

  // Navigation handlers
  const goToPrevDay = () => {
    const prev = parseDateLocal(selectedDate);
    prev.setDate(prev.getDate() - 1);
    onDateSelect(formatDateLocal(prev));
  };
  const goToNextDay = () => {
    const next = parseDateLocal(selectedDate);
    next.setDate(next.getDate() + 1);
    onDateSelect(formatDateLocal(next));
  };
  const today = formatDateLocal(new Date());
  const isToday = selectedDate === today;

  if (loading) {
    return <div className="p-4 text-gray-300">Loading workout log...</div>;
  }
  if (error) {
    return <div className="p-4 text-red-400">Error: {error}</div>;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-start bg-gradient-to-br from-gray-900 via-gray-950 to-blue-950 px-2">
      <div className="w-full max-w-3xl bg-gray-800/90 backdrop-blur-md rounded-2xl shadow-2xl border border-blue-900 mt-8">
        <div className="flex flex-col sm:flex-row sm:items-center mb-4 gap-4 justify-between px-8 pt-8">
          <div className="flex items-center gap-2">
            <button
              className="px-3 py-1 bg-blue-700 text-white rounded-full shadow hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
              onClick={goToPrevDay}
              aria-label="Previous day"
            >
              &#8592;
            </button>
            <button
              className={`text-xl font-bold mx-2 px-3 py-1 rounded-full transition-colors border-2 border-blue-700 ${
                isToday
                  ? "bg-blue-700 text-white cursor-default"
                  : "bg-white/20 text-blue-900 hover:bg-blue-700 hover:text-white cursor-pointer"
              }`}
              onClick={() => {
                if (!isToday) onDateSelect(today);
              }}
              disabled={isToday}
              title={isToday ? "Today" : "Go to today"}
            >
              {selectedDate}
            </button>
            <button
              className={`px-3 py-1 bg-blue-700 text-white rounded-full shadow hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 transition ${
                isToday ? "opacity-50 cursor-not-allowed" : ""
              }`}
              onClick={goToNextDay}
              aria-label="Next day"
              disabled={isToday}
            >
              &#8594;
            </button>
          </div>
          <h2 className="text-2xl font-bold text-blue-100 mt-2 sm:mt-0 drop-shadow">
            Workouts for {selectedDate}
          </h2>
        </div>
        <div className="rounded-2xl overflow-hidden border border-blue-900 bg-gray-900/90 shadow-inner mx-8 mb-8">
          <div className="overflow-x-auto">
            <div className="overflow-y-auto max-h-[55vh] custom-scrollbar">
              <table className="min-w-full table-fixed border-separate border-spacing-0">
                <thead className="sticky top-0 z-10 bg-gray-900/95">
                  <tr>
                    <th className="px-6 py-3 font-semibold text-lg border-b border-blue-900 text-blue-200">
                      Exercise
                    </th>
                    <th className="px-6 py-3 font-semibold text-lg border-b border-blue-900 text-blue-200 text-center">
                      Reps
                    </th>
                    <th className="px-6 py-3 font-semibold text-lg border-b border-blue-900 text-blue-200">
                      Weight
                    </th>
                    <th className="px-6 py-3 font-semibold text-lg border-b border-blue-900 text-blue-200 text-center">
                      Comment
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rows.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-blue-300 text-center py-8 text-lg">
                        No data
                      </td>
                    </tr>
                  ) : (
                    rows.map((row, idx) => (
                      <tr key={idx} className="hover:bg-blue-900/40 transition">
                        <td className="px-6 py-3 border-b border-blue-900 text-blue-300 font-medium text-base align-middle text-center">
                          {row.exercise_name}
                        </td>
                        <td className="px-6 py-3 border-b border-blue-900 text-blue-100 text-base text-center align-middle">
                          {row.reps}
                        </td>
                        <td className="px-6 py-3 border-b border-blue-900 text-blue-100 text-base text-center align-middle">
                          {row.metric_weight}
                        </td>
                        <td className="px-6 py-3 border-b border-blue-900 text-blue-200 text-base text-center align-middle">
                          {row.comment || <span className="text-blue-500">-</span>}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #3b82f6;
          border-radius: 4px;
        }
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #3b82f6 #1e293b;
        }
      `}</style>
    </div>
  );
}
