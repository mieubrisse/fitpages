import { useState, useEffect } from "react";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { StaticDatePicker } from "@mui/x-date-pickers/StaticDatePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { format, parseISO } from "date-fns";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import WorkoutLog from "../components/WorkoutLog";
import initSqlJs from "sql.js";

// Create a dark theme
const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#3b82f6",
    },
  },
});

function formatDateLocal(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getMonthRange(dateStr) {
  const date = new Date(dateStr);
  const year = date.getFullYear();
  const month = date.getMonth();
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  return [formatDateLocal(first), formatDateLocal(last)];
}

export default function WorkoutLogPage({ onBack }) {
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date();
    return d.toISOString().slice(0, 10);
  });
  const [workoutDays, setWorkoutDays] = useState([]);

  // Fetch workout days for the current month of selectedDate
  useEffect(() => {
    async function fetchWorkoutDays() {
      const SQL = await initSqlJs({ locateFile: (file) => `https://sql.js.org/dist/${file}` });
      const response = await fetch("/FitNotes_Backup.fitnotes");
      const arrayBuffer = await response.arrayBuffer();
      const db = new SQL.Database(new Uint8Array(arrayBuffer));

      // Get the month range for the currently selected date
      const [start, end] = getMonthRange(selectedDate);
      const query = `SELECT DISTINCT date FROM training_log WHERE date >= ? AND date <= ? ORDER BY date`;
      const result = db.exec(query, [start, end]);
      if (result.length > 0) {
        setWorkoutDays(result[0].values.map((row) => row[0]));
      } else {
        setWorkoutDays([]);
      }
    }
    fetchWorkoutDays();
  }, [selectedDate]);

  const handleDateChange = (newDate) => {
    if (newDate) {
      setSelectedDate(format(newDate, "yyyy-MM-dd"));
    }
  };

  const handleMonthChange = (newDate) => {
    if (newDate) {
      // When the month changes in the StaticDatePicker, update our selectedDate
      // to the first day of that month so we fetch the correct workout days
      const firstDayOfMonth = format(newDate, "yyyy-MM-01");
      setSelectedDate(firstDayOfMonth);
    }
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <div className="flex flex-col md:flex-row items-start justify-center w-full">
        <div className="md:mr-8 flex-shrink-0">
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <StaticDatePicker
              displayStaticWrapperAs="desktop"
              openTo="day"
              value={parseISO(selectedDate)}
              onChange={handleDateChange}
              onMonthChange={handleMonthChange}
              sx={{
                backgroundColor: "#1f2937",
                color: "white",
                "& .MuiPickersDay-root": {
                  color: "white",
                  "&.Mui-selected": {
                    backgroundColor: "#3b82f6",
                    color: "white",
                  },
                  "&.MuiPickersDay-today": {
                    borderColor: "#3b82f6",
                  },
                },
                "& .MuiPickersCalendarHeader-root": {
                  color: "white",
                },
                "& .MuiPickersDay-root.Mui-disabled": {
                  color: "#6b7280",
                },
              }}
              shouldDisableDate={(date) => {
                const dateStr = format(date, "yyyy-MM-dd");
                return !workoutDays.includes(dateStr);
              }}
            />
          </LocalizationProvider>
        </div>
        <div className="flex-grow w-full">
          <button
            className="m-4 px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600"
            onClick={onBack}
          >
            ← Back to Home
          </button>
          <WorkoutLog selectedDate={selectedDate} onDateSelect={setSelectedDate} />
        </div>
      </div>
    </ThemeProvider>
  );
}
