import { useState } from "react";
import DatabaseViewer from "./components/DatabaseViewer";
import WorkoutLog from "./components/WorkoutLog";
import "./App.css";

function App() {
  const [screen, setScreen] = useState("home");

  return (
    <div className="App min-h-screen bg-gray-900">
      <header className="bg-gray-800 text-white p-4 border-b border-gray-700">
        <h1 className="text-3xl font-bold text-blue-400">FitPages</h1>
        <p className="text-gray-300">FitNotes Data Viewer</p>
      </header>
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
              className="px-8 py-4 bg-green-600 text-white rounded-lg text-2xl font-semibold shadow hover:bg-green-500 transition-colors"
              onClick={() => setScreen("workoutLog")}
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
        {screen === "workoutLog" && (
          <div>
            <button
              className="m-4 px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600"
              onClick={() => setScreen("home")}
            >
              ← Back to Home
            </button>
            <WorkoutLog />
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
