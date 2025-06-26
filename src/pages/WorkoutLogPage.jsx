import { useState, useEffect } from "react";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { StaticDatePicker } from "@mui/x-date-pickers/StaticDatePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { format, parseISO } from "date-fns";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { PickersDay } from "@mui/x-date-pickers/PickersDay";
import { Box, Button, Container, Paper } from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import DailyLog from "../components/DailyLog";
import initSqlJs from "sql.js";

// Create a Material-compliant dark theme
const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#1976d2", // Material default blue
    },
    background: {
      default: "#121212", // Material dark background
      paper: "#1e1e1e", // Material dark surface
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
          backgroundColor: (theme) => theme.palette.action.selected,
          color: (theme) => theme.palette.text.primary,
          "&:hover": {
            backgroundColor: (theme) => theme.palette.action.hover,
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

  // Fetch workout days for the current month of selectedDate plus adjacent months
  useEffect(() => {
    async function fetchWorkoutDays() {
      const SQL = await initSqlJs({ locateFile: (file) => `https://sql.js.org/dist/${file}` });
      const response = await fetch("/FitNotes_Backup.fitnotes");
      const arrayBuffer = await response.arrayBuffer();
      const db = new SQL.Database(new Uint8Array(arrayBuffer));

      // Get the month range for the currently selected date
      const [currentStart, currentEnd] = getMonthRange(selectedDate);

      // Calculate previous month range
      const [year, month] = selectedDate.split("-").map(Number);
      const prevMonth = month === 1 ? 12 : month - 1;
      const prevYear = month === 1 ? year - 1 : year;
      const prevMonthStr = `${prevYear}-${String(prevMonth).padStart(2, "0")}-01`;
      const [prevStart, prevEnd] = getMonthRange(prevMonthStr);

      // Calculate next month range
      const nextMonth = month === 12 ? 1 : month + 1;
      const nextYear = month === 12 ? year + 1 : year;
      const nextMonthStr = `${nextYear}-${String(nextMonth).padStart(2, "0")}-01`;
      const [nextStart, nextEnd] = getMonthRange(nextMonthStr);

      // Query for all three months
      const query = `SELECT DISTINCT date FROM training_log WHERE (date >= ? AND date <= ?) OR (date >= ? AND date <= ?) OR (date >= ? AND date <= ?) ORDER BY date`;
      const result = db.exec(query, [
        prevStart,
        prevEnd,
        currentStart,
        currentEnd,
        nextStart,
        nextEnd,
      ]);

      if (result.length > 0) {
        const days = result[0].values.map((row) => row[0]);
        setWorkoutDays(days);
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
      <Container
        maxWidth="xl"
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          alignItems: "flex-start",
          justifyContent: "center",
          width: "100%",
          minHeight: "100vh",
          bgcolor: "background.default",
        }}
      >
        <Box
          sx={{
            mr: { md: 4 },
            flexShrink: 0,
            mt: 2,
          }}
        >
          <Paper elevation={8} sx={{ bgcolor: "background.paper", p: 2 }}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <StaticDatePicker
                displayStaticWrapperAs="desktop"
                openTo="day"
                value={parseISO(selectedDate)}
                onChange={handleDateChange}
                onMonthChange={handleMonthChange}
                showDaysOutsideCurrentMonth={true}
                shouldDisableDate={(date) => {
                  const today = new Date();
                  today.setHours(23, 59, 59, 999); // End of today
                  return date > today;
                }}
                slots={{
                  day: (props) => <CustomDay {...props} workoutDays={workoutDays} />,
                }}
                sx={{
                  backgroundColor: "background.paper",
                  color: "text.primary",
                  "& .MuiPickersDay-root": {
                    color: "text.primary",
                    "&.Mui-selected": {
                      backgroundColor: "primary.main",
                      color: "primary.contrastText",
                    },
                    "&.MuiPickersDay-today": {
                      borderColor: "primary.main",
                    },
                  },
                  "& .MuiPickersCalendarHeader-root": {
                    color: "text.primary",
                  },
                  "& .MuiPickersDay-root.MuiPickersDay-dayOutsideMonth": {
                    opacity: 0.3,
                    color: "text.secondary",
                  },
                }}
              />
            </LocalizationProvider>
          </Paper>
        </Box>
        <Box
          sx={{
            flexGrow: 1,
            width: "100%",
          }}
        >
          <Button
            variant="contained"
            startIcon={<ArrowBack />}
            onClick={onBack}
            sx={{
              m: 2,
              bgcolor: "background.paper",
              color: "text.primary",
              "&:hover": {
                bgcolor: "primary.main",
                color: "primary.contrastText",
              },
            }}
          >
            Back to Home
          </Button>
          <DailyLog selectedDate={selectedDate} onDateSelect={setSelectedDate} />
        </Box>
      </Container>
    </ThemeProvider>
  );
}
