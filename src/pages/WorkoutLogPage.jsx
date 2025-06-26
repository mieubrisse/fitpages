import { useState, useEffect } from "react";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { StaticDatePicker } from "@mui/x-date-pickers/StaticDatePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { format, parseISO } from "date-fns";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { PickersDay } from "@mui/x-date-pickers/PickersDay";
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
  // Parse the date string explicitly to avoid timezone issues
  const [year, month, day] = dateStr.split("-").map(Number);
  const date = new Date(year, month - 1, day); // month - 1 because getMonth() is 0-indexed
  const monthIndex = date.getMonth(); // 0-indexed: 0=Jan, 1=Feb, ..., 5=Jun, etc.
  const first = new Date(year, monthIndex, 1);
  const last = new Date(year, monthIndex + 1, 0);
  return [formatDateLocal(first), formatDateLocal(last)];
}

// Custom day component that highlights workout days
function CustomDay({ workoutDays, ...props }) {
  const dateStr = format(props.day, "yyyy-MM-dd");
  const hasWorkout = workoutDays.includes(dateStr);

  return (
    <PickersDay
      {...props}
      sx={{
        ...(hasWorkout && {
          backgroundColor: "#4b5563", // lighter gray for workout days
          color: "white",
          "&:hover": {
            backgroundColor: "#6b7280",
          },
        }),
      }}
    />
  );
}

export default function WorkoutLogPage({ onBack }) {
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date();
    return formatDateLocal(d);
  });
  const [workoutDays, setWorkoutDays] = useState([]);

  // Fetch workout days for the current month of selectedDate
  useEffect(() => {
    async function fetchWorkoutDays() {
      console.log("Fetching workout days for selectedDate:", selectedDate);
      const SQL = await initSqlJs({ locateFile: (file) => `https://sql.js.org/dist/${file}` });
      const response = await fetch("/FitNotes_Backup.fitnotes");
      const arrayBuffer = await response.arrayBuffer();
      const db = new SQL.Database(new Uint8Array(arrayBuffer));

      // Get the month range for the currently selected date
      const [start, end] = getMonthRange(selectedDate);
      console.log("Month range:", start, "to", end);
      const query = `SELECT DISTINCT date FROM training_log WHERE date >= ? AND date <= ? ORDER BY date`;
      const result = db.exec(query, [start, end]);
      console.log("SQL result:", result);
      if (result.length > 0) {
        const days = result[0].values.map((row) => row[0]);
        console.log("Setting workoutDays to:", days);
        setWorkoutDays(days);
      } else {
        console.log("Setting workoutDays to empty array");
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
      const newMonthStr = format(newDate, "yyyy-MM");
      const currentMonthStr = selectedDate.substring(0, 7); // Get YYYY-MM from selectedDate

      // Only update selectedDate if we're actually changing to a different month
      if (newMonthStr !== currentMonthStr) {
        const firstDayOfMonth = format(newDate, "yyyy-MM-01");
        setSelectedDate(firstDayOfMonth);
      }
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
              slots={{
                day: (props) => <CustomDay {...props} workoutDays={workoutDays} />,
              }}
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
