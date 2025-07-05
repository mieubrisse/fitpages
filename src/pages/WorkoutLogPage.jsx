import { useState, useEffect } from "react";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { StaticDatePicker } from "@mui/x-date-pickers/StaticDatePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { format, parseISO } from "date-fns";
import { PickersDay } from "@mui/x-date-pickers/PickersDay";
import {
  Box,
  Button,
  Container,
  Paper,
  AppBar,
  Toolbar,
  TextField,
  Autocomplete,
  Divider,
  Typography,
  Select,
  MenuItem,
  FormControl,
  CircularProgress,
} from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import DailyLog from "../components/DailyLog";
import ExerciseHistoryPopout from "../components/ExerciseHistoryPopout";
import CalendarPanel from "../components/CalendarPanel";
import TopBannerBar from "../components/TopBannerBar";
import { useDatabase } from "../hooks/useDatabase";

function formatDateLocal(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Helper to title-case a string (Unicode-aware, handles accents)
function toTitleCase(str) {
  return str.replace(
    /([^\s]+)/gu,
    (word) => word.charAt(0).toLocaleUpperCase() + word.slice(1).toLocaleLowerCase()
  );
}

export default function WorkoutLogPage() {
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date();
    return formatDateLocal(d);
  });
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const d = new Date();
    return parseISO(formatDateLocal(new Date(d.getFullYear(), d.getMonth(), 1)));
  });
  const [workoutDays, setWorkoutDays] = useState([]);
  const [exerciseIds, setExerciseIds] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const [searchSelected, setSearchSelected] = useState(null);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem("fitpages_language") || "EN";
  });
  const [i18nMap, setI18nMap] = useState({});

  const { db, loading, error } = useDatabase();

  useEffect(() => {
    localStorage.setItem("fitpages_language", language);
  }, [language]);

  // Fetch workout days for the past 6 months
  useEffect(() => {
    if (!db) return;

    // Calculate 6 months ago from today
    const today = new Date();
    const sixMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 6, 1);
    const startDate = formatDateLocal(sixMonthsAgo);
    const endDate = formatDateLocal(today);

    // Query for the past 6 months
    const query = `SELECT DISTINCT date FROM training_log WHERE date >= ? AND date <= ? ORDER BY date`;
    const result = db.exec(query, [startDate, endDate]);

    if (result.length > 0) {
      const days = result[0].values.map((row) => row[0]);
      setWorkoutDays(days);
    } else {
      setWorkoutDays([]);
    }
  }, [db]);

  // Fetch all exercise IDs and i18n map on mount
  useEffect(() => {
    if (!db) return;

    // Fetch all exercises: _id, name, notes
    const result = db.exec("SELECT _id, name, notes FROM exercise ORDER BY _id");
    if (result.length > 0) {
      setExerciseIds(result[0].values.map((row) => row[0]));
    }
    // Parse i18n lines from exercise notes and always set English name
    const i18n = {};
    if (result.length > 0) {
      result[0].values.forEach(([id, name, notes]) => {
        if (!i18n[id]) i18n[id] = {};
        let foundEn = false;
        if (notes) {
          const lines = notes.split(/\r?\n/);
          for (const line of lines) {
            const match = line.match(/^\s*i18n\/(\w+)[:]*[\s]+(.+)/i);
            if (match) {
              const lang = match[1].toLowerCase();
              const value = toTitleCase(match[2].trim());
              i18n[id][lang] = value;
              if (lang === "en") foundEn = true;
            }
          }
        }
        // Always set English name as fallback
        if (!foundEn && name) {
          i18n[id]["en"] = toTitleCase(name.trim());
        }
      });
    }
    setI18nMap(i18n);
  }, [db]);

  // Show loading state
  if (loading) {
    return (
      <Container
        maxWidth="xl"
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          bgcolor: "background.default",
        }}
      >
        <CircularProgress size={64} thickness={5} />
      </Container>
    );
  }

  // Show error state
  if (error) {
    return (
      <Container
        maxWidth="xl"
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          bgcolor: "background.default",
        }}
      >
        <Typography variant="h6" color="error">
          Error loading database: {error.message}
        </Typography>
      </Container>
    );
  }

  function selectDate(dateOrString) {
    let dateObj;
    if (typeof dateOrString === "string") {
      dateObj = parseISO(dateOrString);
    } else {
      dateObj = dateOrString;
    }
    if (!dateObj) return;
    const newDateStr = format(dateObj, "yyyy-MM-dd");
    setSelectedDate(newDateStr);
    setCalendarMonth(new Date(dateObj.getFullYear(), dateObj.getMonth(), 1));
  }

  const handleMonthChange = (newDate) => {
    if (newDate) {
      // Get the current selected day
      const day = Number(selectedDate.split("-")[2]);
      // newDate is the first of the new month
      const newYear = newDate.getFullYear();
      const newMonth = newDate.getMonth();
      // Find the last day of the new month
      const lastDayOfNewMonth = new Date(newYear, newMonth + 1, 0).getDate();
      // Use the same day if possible, otherwise snap to last day
      const newDay = Math.min(day, lastDayOfNewMonth);
      const newSelectedDate = `${newYear}-${String(newMonth + 1).padStart(2, "0")}-${String(
        newDay
      ).padStart(2, "0")}`;
      setSelectedDate(newSelectedDate);
      setCalendarMonth(new Date(newYear, newMonth, 1));
    }
  };

  // When an exercise is selected in the search bar
  const handleSearchSelect = (event, value) => {
    if (value) {
      setSelectedExercise(value);
      setSearchValue("");
      setSearchSelected(null);
    }
  };

  // Handler to close the exercise drawer
  const handleCloseExercise = () => {
    setSelectedExercise(null);
  };

  return (
    <Container
      maxWidth="xl"
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "stretch",
        justifyContent: "flex-start",
        width: "100%",
        height: "100vh",
        minHeight: 0,
        bgcolor: "background.default",
        p: 0,
        overflow: "hidden",
      }}
    >
      <TopBannerBar
        language={language}
        setLanguage={setLanguage}
        exerciseIds={exerciseIds}
        searchSelected={searchSelected}
        searchValue={searchValue}
        setSearchValue={setSearchValue}
        handleSearchSelect={handleSearchSelect}
        i18nMap={i18nMap}
      />
      <Divider />
      {/* Main Content with unified padding */}
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          height: "100%",
          p: { xs: 2, md: 3 },
          boxSizing: "border-box",
          width: "100%",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            alignItems: { xs: "stretch", md: "flex-start" },
            justifyContent: { xs: "flex-start", md: "center" },
            width: "100%",
            flex: 1,
            minHeight: 0,
            height: "100%",
            overflow: "hidden",
          }}
        >
          <CalendarPanel
            selectedDate={selectedDate}
            onDateSelect={selectDate}
            calendarMonth={calendarMonth}
            onMonthChange={handleMonthChange}
            workoutDays={workoutDays}
            db={db}
            i18nMap={i18nMap}
            language={language}
          />
          <Box
            sx={{
              flexGrow: 1,
              flex: { xs: 1, md: 3 },
              width: "100%",
              height: "100%",
              minHeight: 0,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Paper
              elevation={24}
              sx={{
                bgcolor: "background.paper",
                borderRadius: 4,
                p: 0,
                boxShadow: 8,
                display: "flex",
                flexDirection: "column",
                height: "100%",
                minHeight: 0,
              }}
            >
              <Box sx={{ flex: 1, overflow: "auto", minHeight: 0 }}>
                <DailyLog
                  selectedDate={selectedDate}
                  onDateSelect={selectDate}
                  language={language}
                  i18nMap={i18nMap}
                />
              </Box>
            </Paper>
          </Box>
        </Box>
        {/* Exercise History Popout */}
        {selectedExercise && db && (
          <ExerciseHistoryPopout
            exerciseId={selectedExercise}
            onClose={handleCloseExercise}
            db={db}
            language={language}
            i18nMap={i18nMap}
            onDateSelect={selectDate}
          />
        )}
      </Box>
    </Container>
  );
}
