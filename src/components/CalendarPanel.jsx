import { useState, useRef, useEffect } from "react";
import { Box, Paper, Typography, Divider } from "@mui/material";
import WorkoutCalendar from "./WorkoutCalendar";

export default function CalendarPanel({
  selectedDate,
  onDateSelect,
  calendarMonth,
  onMonthChange,
  workoutDays,
  i18nMap,
  language,
  dateToExercise,
}) {
  const [hoveredDay, setHoveredDay] = useState(null);
  const [previewExercises, setPreviewExercises] = useState([]);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState(null);
  const calendarBoxRef = useRef(null);

  useEffect(() => {
    if (!hoveredDay || !dateToExercise || !dateToExercise[hoveredDay]) {
      setPreviewExercises([]);
      setPreviewLoading(false);
      setPreviewError(null);
      return;
    }
    setPreviewLoading(true);
    setPreviewError(null);

    try {
      // Use the dateToExercise data structure instead of querying the database
      const dayData = dateToExercise[hoveredDay];
      if (dayData && dayData.exerciseOrdering) {
        setPreviewExercises(dayData.exerciseOrdering);
      } else {
        setPreviewExercises([]);
      }
      setPreviewLoading(false);
    } catch {
      setPreviewError("Error loading exercises");
      setPreviewLoading(false);
    }
  }, [hoveredDay, dateToExercise]);

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
        display: { xs: "none", md: "flex" },
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
        <WorkoutCalendar
          selectedDate={selectedDate}
          onDateSelect={onDateSelect}
          calendarMonth={calendarMonth}
          onMonthChange={onMonthChange}
          workoutDays={workoutDays}
          language={language}
          showHoverPreview={true}
          onDayHover={setHoveredDay}
        />
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
          {hoveredDay &&
          dateToExercise &&
          dateToExercise[hoveredDay] &&
          previewExercises.length > 0 ? (
            previewLoading ? (
              <Box sx={{ color: "text.secondary" }}>Loading...</Box>
            ) : previewError ? (
              <Box sx={{ color: "error.main" }}>{previewError}</Box>
            ) : (
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
            )
          ) : null}
        </Box>
      </Paper>
    </Box>
  );
}
