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
import MobileCalendarModal from "../components/MobileCalendarModal";
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
  const [exerciseIds, setExerciseIds] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const [searchSelected, setSearchSelected] = useState(null);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem("fitpages_language") || "EN";
  });
  const [i18nMap, setI18nMap] = useState({});
  const [mobileCalendarOpen, setMobileCalendarOpen] = useState(false);
  const [dateToExercise, setDateToExercise] = useState({});
  const [exerciseToDate, setExerciseToDate] = useState({});
  const [dateToWorkoutComment, setDateToWorkoutComment] = useState({});

  // Programming state - moved from DailyLog.jsx
  const PROGRAMMING_KEY = "fitpages_dateToProgramming";
  const [dateToProgramming, setDateToProgramming] = useState(() => {
    try {
      const stored = localStorage.getItem(PROGRAMMING_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  const { db, loading, error } = useDatabase();

  useEffect(() => {
    localStorage.setItem("fitpages_language", language);
  }, [language]);

  // Sync dateToProgramming to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(PROGRAMMING_KEY, JSON.stringify(dateToProgramming));
    } catch (error) {
      console.error("Failed to save programming to localStorage:", error);
    }
  }, [dateToProgramming]);

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

  // Load dateToExercise data structure with the most recent 3 months of data
  useEffect(() => {
    if (!db) return;

    try {
      // Query for all training data (no date filter)
      const query = `
        SELECT 
          t.date,
          t.exercise_id,
          t.reps,
          t.metric_weight,
          c.comment AS comment,
          t._id
        FROM training_log t
        LEFT JOIN Comment c ON c.owner_id = t._id
        ORDER BY t.date ASC, t._id ASC;
      `;
      const result = db.exec(query);

      if (result.length > 0) {
        const data = result[0].values.map((row) => ({
          date: row[0],
          exercise_id: row[1],
          reps: row[2],
          metric_weight: row[3],
          comment: row[4] ?? "",
          id: row[5],
        }));

        // Build the dateToExercise data structure
        const dateToExerciseMap = {};
        // Build the exerciseToDate data structure in parallel
        const exerciseToDateMap = {};

        data.forEach((item) => {
          const date = item.date;
          const exerciseId = item.exercise_id;

          // Build dateToExercise structure
          if (!dateToExerciseMap[date]) {
            dateToExerciseMap[date] = {
              exerciseOrdering: [],
              exerciseDetails: {},
            };
          }

          // Add exercise to ordering if it's the first time we see it for this date
          if (!dateToExerciseMap[date].exerciseOrdering.includes(exerciseId)) {
            dateToExerciseMap[date].exerciseOrdering.push(exerciseId);
          }

          // Add set to exercise details
          if (!dateToExerciseMap[date].exerciseDetails[exerciseId]) {
            dateToExerciseMap[date].exerciseDetails[exerciseId] = [];
          }

          dateToExerciseMap[date].exerciseDetails[exerciseId].push({
            weight: item.metric_weight,
            reps: item.reps,
            comment: item.comment,
          });

          // Build exerciseToDate structure
          if (!exerciseToDateMap[exerciseId]) {
            exerciseToDateMap[exerciseId] = {
              dates: [],
              exerciseData: {},
            };
          }

          // Add date to dates array if it's the first time we see it for this exercise
          if (!exerciseToDateMap[exerciseId].dates.includes(date)) {
            exerciseToDateMap[exerciseId].dates.push(date);
          }

          // Add set to exercise data
          if (!exerciseToDateMap[exerciseId].exerciseData[date]) {
            exerciseToDateMap[exerciseId].exerciseData[date] = [];
          }

          exerciseToDateMap[exerciseId].exerciseData[date].push({
            weight: item.metric_weight,
            reps: item.reps,
            comment: item.comment,
          });
        });

        // Sort dates in descending order (newest first) for each exercise
        Object.keys(exerciseToDateMap).forEach((exerciseId) => {
          exerciseToDateMap[exerciseId].dates.sort((a, b) => new Date(b) - new Date(a));
        });

        setDateToExercise(dateToExerciseMap);
        setExerciseToDate(exerciseToDateMap);
        console.log("dateToExercise data structure loaded:", dateToExerciseMap);
        console.log("exerciseToDate data structure loaded:", exerciseToDateMap);
        console.log(
          "Sample exerciseToDate entry:",
          Object.keys(exerciseToDateMap)[0]
            ? exerciseToDateMap[Object.keys(exerciseToDateMap)[0]]
            : "No data"
        );
      } else {
        setDateToExercise({});
        setExerciseToDate({});
        console.log("dateToExercise data structure loaded: {}");
        console.log("exerciseToDate data structure loaded: {}");
      }
    } catch (err) {
      console.error("Error loading dateToExercise data:", err);
      setDateToExercise({});
      setExerciseToDate({});
    }
  }, [db]);

  // Fetch all workout comments and build dateToWorkoutComment mapping
  useEffect(() => {
    if (!db) return;
    try {
      const result = db.exec(`SELECT date, comment FROM WorkoutComment ORDER BY date ASC;`);
      if (result.length > 0) {
        const data = result[0].values;
        const mapping = {};
        data.forEach(([date, comment]) => {
          if (date && comment) {
            mapping[date] = comment;
          }
        });
        setDateToWorkoutComment(mapping);
      } else {
        setDateToWorkoutComment({});
      }
    } catch (err) {
      console.error("Error loading WorkoutComment data:", err);
      setDateToWorkoutComment({});
    }
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
            i18nMap={i18nMap}
            language={language}
            dateToExercise={dateToExercise}
            dateToProgramming={dateToProgramming}
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
                  onCalendarOpen={() => setMobileCalendarOpen(true)}
                  dateToExercise={dateToExercise}
                  exerciseToDate={exerciseToDate}
                  db={db}
                  workoutComment={dateToWorkoutComment[selectedDate] || ""}
                  dateToProgramming={dateToProgramming}
                  setDateToProgramming={setDateToProgramming}
                />
              </Box>
            </Paper>
          </Box>
        </Box>
        {/* Exercise History Popout */}
        {selectedExercise && exerciseToDate && Object.keys(exerciseToDate).length > 0 && (
          <ExerciseHistoryPopout
            exerciseId={selectedExercise}
            onClose={handleCloseExercise}
            language={language}
            i18nMap={i18nMap}
            onDateSelect={selectDate}
            exerciseToDate={exerciseToDate}
          />
        )}

        {/* Mobile Calendar Modal */}
        <MobileCalendarModal
          open={mobileCalendarOpen}
          onClose={() => setMobileCalendarOpen(false)}
          selectedDate={selectedDate}
          onDateSelect={selectDate}
          calendarMonth={calendarMonth}
          onMonthChange={handleMonthChange}
          language={language}
          dateToExercise={dateToExercise}
          dateToProgramming={dateToProgramming}
        />
      </Box>
    </Container>
  );
}
