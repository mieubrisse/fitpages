import { useState } from "react";
import DatabaseViewer from "./components/DatabaseViewer";
import WorkoutLogPage from "./pages/WorkoutLogPage";
import "./App.css";

function App() {
  const [screen, setScreen] = useState("home");

  /*
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date();
    return d.toISOString().slice(0, 10);
  });

  const [viewMonth, setViewMonth] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d.toISOString().slice(0, 10);
  });
  const [workoutDays, setWorkoutDays] = useState([]);

  useEffect(() => {
    async function fetchWorkoutDays() {
      const SQL = await initSqlJs({ locateFile: (file) => `https://sql.js.org/dist/${file}` });
      const response = await fetch("/FitNotes_Backup.fitnotes");
      const arrayBuffer = await response.arrayBuffer();
      const db = new SQL.Database(new Uint8Array(arrayBuffer));
      const [start, end] = getMonthRange(viewMonth);
      const query = `SELECT DISTINCT date FROM training_log WHERE date >= ? AND date <= ? ORDER BY date`;
      const result = db.exec(query, [start, end]);
      console.log("SQL result for workout days:", result);
      if (result.length > 0) {
        setWorkoutDays(result[0].values.map((row) => row[0]));
      } else {
        setWorkoutDays([]);
      }
    }
    fetchWorkoutDays();
  }, [viewMonth]);

  // When the selected date changes, update the view month if needed
  useEffect(() => {
    const d = new Date(selectedDate);
    d.setDate(1);
    const monthStr = d.toISOString().slice(0, 10);
    // Only update viewMonth if selectedDate is outside the current viewMonth
    if (monthStr !== viewMonth) {
      setViewMonth(monthStr);
    }
  }, [selectedDate, viewMonth]);
  */

  return (
    <div className="App min-h-screen bg-gray-900">
      <main className="bg-gray-900">
        {screen === "home" && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
            <button
              className="px-8 py-4 bg-blue-600 text-white rounded-lg text-2xl font-semibold shadow hover:bg-blue-500 transition-colors"
              onClick={() => setScreen("explorer")}
            >
              Table Explorer
            </button>
            <button
              className="px-8 py-4 bg-purple-600 text-white rounded-lg text-2xl font-semibold shadow hover:bg-purple-500 transition-colors"
              onClick={() => setScreen("workoutLogNew")}
            >
              Workout Log
            </button>
          </div>
        )}
        {screen === "explorer" && (
          <div>
            <button
              className="m-4 px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600"
              onClick={() => setScreen("home")}
            >
              ← Back to Home
            </button>
            <DatabaseViewer />
          </div>
        )}
        {screen === "workoutLogNew" && <WorkoutLogPage onBack={() => setScreen("home")} />}
      </main>
    </div>
  );
}

export default App;
