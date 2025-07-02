import { useState, useRef, useEffect } from "react";
import { Box, Paper, Typography, Divider } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { StaticDatePicker } from "@mui/x-date-pickers/StaticDatePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { format, parseISO } from "date-fns";
import { PickersDay } from "@mui/x-date-pickers/PickersDay";
import { enUS, pt } from "date-fns/locale";

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

export default function LogCalendar({
  selectedDate,
  onDateSelect,
  calendarMonth,
  onMonthChange,
  workoutDays,
  db,
  i18nMap,
  language,
}) {
  const [hoveredDay, setHoveredDay] = useState(null);
  const [previewExercises, setPreviewExercises] = useState([]);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState(null);
  const calendarBoxRef = useRef(null);

  // Select locale for date-fns
  const locale = language && language.toLowerCase() === "pt" ? pt : enUS;

  // Internationalized preview message
  const noExercisesMsg =
    language && language.toLowerCase() === "pt"
      ? "Sem exercícios neste dia"
      : "No exercises for this day";

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
        SELECT e._id AS exercise_id
        FROM training_log t
        LEFT JOIN exercise e ON t.exercise_id = e._id
        WHERE t.date = ?
        GROUP BY e._id
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

  // Helper to get the display name for an exercise
  function getDisplayName(exerciseId) {
    if (
      language &&
      language.toLowerCase() !== "en" &&
      i18nMap &&
      i18nMap[exerciseId] &&
      i18nMap[exerciseId][language.toLowerCase()]
    ) {
      return i18nMap[exerciseId][language.toLowerCase()];
    }
    // Fallback to English if available
    if (i18nMap && i18nMap[exerciseId] && i18nMap[exerciseId]["en"]) {
      return i18nMap[exerciseId]["en"];
    }
    // Fallback to ID if no name is available
    return String(exerciseId);
  }

  return (
    <Box
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
      ref={calendarBoxRef}
    >
      <Box sx={{ minHeight: 0 }}>
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={locale}>
          <StaticDatePicker
            calendarMonth={calendarMonth}
            value={parseISO(selectedDate)}
            onChange={onDateSelect}
            onMonthChange={onMonthChange}
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
                    {idx < previewExercises.length - 1 && <Divider sx={{ my: 1, width: "100%" }} />}
                  </>
                ))}
              </Box>
            ) : (
              <Box sx={{ color: "text.secondary" }}>{noExercisesMsg}</Box>
            )
          ) : null}
        </Box>
      </Paper>
    </Box>
  );
}
