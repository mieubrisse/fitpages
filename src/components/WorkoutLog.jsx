import { useEffect, useState } from "react";
import initSqlJs from "sql.js";

const WorkoutLog = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const SQL = await initSqlJs({
          locateFile: (file) => `https://sql.js.org/dist/${file}`,
        });
        const response = await fetch("/FitNotes_Backup.fitnotes");
        const arrayBuffer = await response.arrayBuffer();
        const db = new SQL.Database(new Uint8Array(arrayBuffer));

        // Query: select 20 most recent from training_log, then join exercise and Comment
        const query = `
          SELECT 
            t.date,
            e.name AS exercise_name,
            t.reps,
            t.metric_weight,
            c.comment AS comment
          FROM (
            SELECT * FROM training_log
            ORDER BY date DESC
            LIMIT 20
          ) t
          LEFT JOIN exercise e ON t.exercise_id = e._id
          LEFT JOIN Comment c ON c.owner_id = t._id
          ORDER BY t.date DESC;
        `;
        const result = db.exec(query);
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
    };
    loadData();
  }, []);

  if (loading) {
    return <div className="p-4 text-gray-300">Loading workout log...</div>;
  }
  if (error) {
    return <div className="p-4 text-red-400">Error: {error}</div>;
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4 text-white">Recent Workouts</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse border border-gray-600">
          <thead>
            <tr className="bg-gray-700">
              <th className="border border-gray-600 px-3 py-2 text-left text-gray-200">Date</th>
              <th className="border border-gray-600 px-3 py-2 text-left text-gray-200">Exercise</th>
              <th className="border border-gray-600 px-3 py-2 text-left text-gray-200">Reps</th>
              <th className="border border-gray-600 px-3 py-2 text-left text-gray-200">Weight</th>
              <th className="border border-gray-600 px-3 py-2 text-left text-gray-200">Comment</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-gray-400 text-center py-4">
                  No data
                </td>
              </tr>
            ) : (
              rows.map((row, idx) => (
                <tr key={idx} className="hover:bg-gray-700">
                  <td className="border border-gray-600 px-3 py-2 text-gray-300 font-mono">
                    {row.date}
                  </td>
                  <td className="border border-gray-600 px-3 py-2 text-blue-300">
                    {row.exercise_name}
                  </td>
                  <td className="border border-gray-600 px-3 py-2 text-gray-300">{row.reps}</td>
                  <td className="border border-gray-600 px-3 py-2 text-gray-300">
                    {row.metric_weight}
                  </td>
                  <td className="border border-gray-600 px-3 py-2 text-gray-300">
                    {row.comment || <span className="text-gray-500">-</span>}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default WorkoutLog;
