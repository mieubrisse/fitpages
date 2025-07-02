import { useState, useEffect, useRef } from "react";
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
  InputLabel,
} from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import DailyLog from "../components/DailyLog";
import initSqlJs from "sql.js";
import ExerciseHistoryPopout from "../components/ExerciseHistoryPopout";

function formatDateLocal(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Custom day component that highlights workout days and the selected day
function CustomDay({ workoutDays, selectedDate, ...props }) {
  const dateStr = format(props.day, "yyyy-MM-dd");
  const hasWorkout = workoutDays.includes(dateStr);
  const isSelected = dateStr === selectedDate;

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
        ...(isSelected && {
          backgroundColor: (theme) => theme.palette.primary.main,
          color: (theme) => theme.palette.primary.contrastText,
          fontWeight: "bold",
          borderRadius: "50%",
          boxShadow: 3,
          "&:hover": {
            backgroundColor: (theme) => theme.palette.primary.dark,
            color: (theme) => theme.palette.primary.contrastText,
          },
        }),
      }}
    />
  );
}

// Helper to title-case a string
function toTitleCase(str) {
  return str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
}

export default function WorkoutLogPage({ onBack }) {
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date();
    return formatDateLocal(d);
  });
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const d = new Date();
    return parseISO(formatDateLocal(new Date(d.getFullYear(), d.getMonth(), 1)));
  });
  const [workoutDays, setWorkoutDays] = useState([]);
  const [exerciseNames, setExerciseNames] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const [searchSelected, setSearchSelected] = useState(null);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [db, setDb] = useState(null);
  const [hoveredDay, setHoveredDay] = useState(null);
  const [previewExercises, setPreviewExercises] = useState([]);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState(null);
  const calendarBoxRef = useRef(null);
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem("fitpages_language") || "EN";
  });
  const [i18nMap, setI18nMap] = useState({});

  useEffect(() => {
    localStorage.setItem("fitpages_language", language);
  }, [language]);

  // Fetch workout days for the past 6 months
  useEffect(() => {
    async function fetchWorkoutDays() {
      const SQL = await initSqlJs({ locateFile: (file) => `https://sql.js.org/dist/${file}` });
      const response = await fetch("/FitNotes_Backup.fitnotes");
      const arrayBuffer = await response.arrayBuffer();
      const db = new SQL.Database(new Uint8Array(arrayBuffer));

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
    }
    fetchWorkoutDays();
  }, []); // Only run once on mount

  // Fetch all exercise names, DB, and i18n map on mount
  useEffect(() => {
    async function fetchExerciseNamesAndDb() {
      const SQL = await initSqlJs({ locateFile: (file) => `https://sql.js.org/dist/${file}` });
      const response = await fetch("/FitNotes_Backup.fitnotes");
      const arrayBuffer = await response.arrayBuffer();
      const dbInstance = new SQL.Database(new Uint8Array(arrayBuffer));
      setDb(dbInstance);
      const result = dbInstance.exec("SELECT name FROM exercise ORDER BY name");
      if (result.length > 0) {
        setExerciseNames(result[0].values.map((row) => row[0]));
      }
      // Parse i18n lines from exercise notes
      const i18n = {};
      const notesResult = dbInstance.exec("SELECT name, notes FROM exercise");
      if (notesResult.length > 0) {
        notesResult[0].values.forEach(([name, notes]) => {
          if (!notes) return;
          const lines = notes.split(/\r?\n/);
          for (const line of lines) {
            const match = line.match(/^\s*i18n\/(\w+)[\s:]+(.+)/i);
            if (match) {
              const lang = match[1].toLowerCase();
              const value = toTitleCase(match[2].trim());
              if (!i18n[name]) i18n[name] = {};
              i18n[name][lang] = value;
            }
          }
        });
      }
      setI18nMap(i18n);
    }
    fetchExerciseNamesAndDb();
  }, []);

  // Fetch exercises for hovered day
  useEffect(() => {
    if (!db || !hoveredDay || !workoutDays.includes(hoveredDay)) {
      setPreviewExercises([]);
      setPreviewLoading(false);
      setPreviewError(null);
      return;
    }
    setPreviewLoading(true);
    setPreviewError(null);
    try {
      const query = `
        SELECT e.name AS exercise_name
        FROM training_log t
        LEFT JOIN exercise e ON t.exercise_id = e._id
        WHERE t.date = ?
        GROUP BY e.name
        ORDER BY MIN(t._id) ASC;
      `;
      const result = db.exec(query, [hoveredDay]);
      if (result.length > 0) {
        setPreviewExercises(result[0].values.map((row) => row[0]));
      } else {
        setPreviewExercises([]);
      }
      setPreviewLoading(false);
    } catch {
      setPreviewError("Error loading exercises");
      setPreviewLoading(false);
    }
  }, [db, hoveredDay, workoutDays]);

  const handleDateChange = (newDate) => {
    if (newDate) {
      setSelectedDate(format(newDate, "yyyy-MM-dd"));
      // Update calendar month to show the month of the selected date
      setCalendarMonth(new Date(newDate.getFullYear(), newDate.getMonth(), 1));
    }
  };

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

  const handleDateSelect = (newDateStr) => {
    setSelectedDate(newDateStr);
    // Update calendar month to show the month of the selected date
    const [year, month] = newDateStr.split("-").map(Number);
    setCalendarMonth(new Date(year, month - 1, 1));
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

  // Helper to get the display name for an exercise
  function getDisplayName(exerciseName) {
    if (
      language &&
      language.toLowerCase() !== "en" &&
      i18nMap[exerciseName] &&
      i18nMap[exerciseName][language.toLowerCase()]
    ) {
      return i18nMap[exerciseName][language.toLowerCase()];
    }
    return exerciseName;
  }

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
      {/* Top Bar */}
      <AppBar position="static" color="transparent" elevation={0} sx={{ mb: 0, p: 0 }}>
        <Toolbar sx={{ display: "flex", justifyContent: "space-between", px: 0 }}>
          <Button
            variant="contained"
            startIcon={<ArrowBack />}
            onClick={onBack}
            sx={{
              bgcolor: "background.paper",
              color: "text.primary",
              "&:hover": {
                bgcolor: "primary.main",
                color: "primary.contrastText",
              },
              ml: 2,
            }}
          >
            Back to Home
          </Button>
          <Autocomplete
            freeSolo
            options={exerciseNames}
            value={searchSelected}
            inputValue={searchValue}
            onInputChange={(_, newInputValue) => setSearchValue(newInputValue)}
            onChange={handleSearchSelect}
            sx={{ width: 630, mr: { md: 4, xs: 2 } }}
            renderInput={(params) => (
              <TextField {...params} label="Search exercises" variant="outlined" size="small" />
            )}
          />
          <FormControl sx={{ minWidth: 100, ml: 2 }} size="small">
            <InputLabel id="language-select-label">Language</InputLabel>
            <Select
              labelId="language-select-label"
              id="language-select"
              value={language}
              label="Language"
              onChange={(e) => setLanguage(e.target.value)}
            >
              <MenuItem value="EN">🇬🇧 EN</MenuItem>
              <MenuItem value="PT">🇵🇹 PT</MenuItem>
            </Select>
          </FormControl>
        </Toolbar>
      </AppBar>
      <Divider />
      {/* Main Content with unified padding */}
      <Box
        sx={{ flex: 1, minHeight: 0, height: "100%", p: 3, boxSizing: "border-box", width: "100%" }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            alignItems: "flex-start",
            justifyContent: "center",
            width: "100%",
            flex: 1,
            minHeight: 0,
            height: "100%",
            overflow: "hidden",
          }}
        >
          <Box
            ref={calendarBoxRef}
            sx={{
              mr: { md: 2, xs: 0 },
              flexShrink: 0,
              pt: 2,
              pb: 0,
              display: "flex",
              flexDirection: "column",
              height: "100%",
              minHeight: 0,
              maxHeight: "100%",
              overflow: "hidden",
              flex: 1,
            }}
          >
            <Box sx={{ minHeight: 0 }}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <StaticDatePicker
                  calendarMonth={calendarMonth}
                  value={parseISO(selectedDate)}
                  onChange={handleDateChange}
                  onMonthChange={handleMonthChange}
                  showDaysOutsideCurrentMonth={true}
                  shouldDisableDate={(date) => {
                    const today = new Date();
                    today.setHours(23, 59, 59, 999); // End of today
                    return date > today;
                  }}
                  reduceAnimations={true}
                  slots={{
                    toolbar: () => null,
                    day: (props) => (
                      <CustomDay
                        {...props}
                        workoutDays={workoutDays}
                        selectedDate={selectedDate}
                        onMouseEnter={() => setHoveredDay(format(props.day, "yyyy-MM-dd"))}
                        onMouseLeave={() => setHoveredDay(null)}
                      />
                    ),
                    actionBar: () => null,
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
            </Box>
            <Paper
              elevation={8}
              sx={{
                flex: 1,
                bgcolor: "background.paper",
                borderRadius: 4,
                p: 2,
                display: { xs: "none", md: "flex" },
                flexDirection: "column",
                alignItems: "flex-start",
                justifyContent: "flex-start",
                overflow: "hidden",
                minHeight: 0,
              }}
            >
              <Box sx={{ flex: 1, width: "100%", overflow: "auto", minHeight: 0 }}>
                {hoveredDay && workoutDays.includes(hoveredDay) ? (
                  previewLoading ? (
                    <Box sx={{ color: "text.secondary" }}>Loading...</Box>
                  ) : previewError ? (
                    <Box sx={{ color: "error.main" }}>{previewError}</Box>
                  ) : previewExercises.length > 0 ? (
                    <Box component="ul" sx={{ m: 0, p: 0, listStyle: "none", width: "100%" }}>
                      {previewExercises.map((ex, idx) => (
                        <>
                          <li key={ex} style={{ marginBottom: 0, width: "100%" }}>
                            <Typography
                              variant="body1"
                              sx={{
                                color: "text.primary",
                                textOverflow: "ellipsis",
                                overflow: "hidden",
                                whiteSpace: "nowrap",
                                width: "100%",
                                fontSize: "1.1rem",
                              }}
                              title={getDisplayName(ex)}
                            >
                              {getDisplayName(ex)}
                            </Typography>
                          </li>
                          {idx < previewExercises.length - 1 && (
                            <Divider sx={{ my: 1, width: "100%" }} />
                          )}
                        </>
                      ))}
                    </Box>
                  ) : (
                    <Box sx={{ color: "text.secondary" }}>No exercises for this day</Box>
                  )
                ) : null}
              </Box>
            </Paper>
          </Box>
          <Box
            sx={{
              flexGrow: 1,
              flex: 3,
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
                  onDateSelect={handleDateSelect}
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
            exerciseName={selectedExercise}
            onClose={handleCloseExercise}
            db={db}
            language={language}
            i18nMap={i18nMap}
          />
        )}
      </Box>
    </Container>
  );
}
