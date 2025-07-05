import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Button,
  Box,
  Container,
  Stack,
  Typography,
} from "@mui/material";
import { ChevronLeft, ChevronRight, CalendarToday } from "@mui/icons-material";
import { format, parseISO } from "date-fns";
import ExerciseHistoryPopout from "./ExerciseHistoryPopout";
import { enUS, pt } from "date-fns/locale";
import { useDatabase } from "../hooks/useDatabase";

// Format a Date object as YYYY-MM-DD in local time
function formatDateLocal(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
// Parse a YYYY-MM-DD string as a local Date object
function parseDateLocal(str) {
  const [year, month, day] = str.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export default function DailyLog({
  selectedDate,
  onDateSelect,
  language = "EN",
  i18nMap,
  onCalendarOpen,
}) {
  const [rows, setRows] = useState([]);
  const [selectedExercise, setSelectedExercise] = useState(null);

  const { db, loading, error } = useDatabase();

  // Select locale for date-fns
  const locale = language && language.toLowerCase() === "pt" ? pt : enUS;

  // Translation map
  const t = {
    today: language && language.toLowerCase() === "pt" ? "hoje" : "Today",
    loading:
      language && language.toLowerCase() === "pt"
        ? "Carregando registro de treino..."
        : "Loading workout log...",
    error: language && language.toLowerCase() === "pt" ? "Erro: " : "Error: ",
    noData: language && language.toLowerCase() === "pt" ? "Sem dados" : "No data",
    set: language && language.toLowerCase() === "pt" ? "Série" : "Set",
    weight: language && language.toLowerCase() === "pt" ? "Peso" : "Weight",
    reps: language && language.toLowerCase() === "pt" ? "Reps" : "Reps",
    comment: language && language.toLowerCase() === "pt" ? "Comentário" : "Comment",
  };

  // Query for the selected date
  useEffect(() => {
    if (!db) return;

    try {
      const query = `
        SELECT 
          t.date,
          e._id AS exercise_id,
          t.reps,
          t.metric_weight,
          c.comment AS comment,
          t._id
        FROM training_log t
        LEFT JOIN exercise e ON t.exercise_id = e._id
        LEFT JOIN Comment c ON c.owner_id = t._id
        WHERE t.date = ?
        ORDER BY t._id ASC;
      `;
      const result = db.exec(query, [selectedDate]);
      if (result.length > 0) {
        const data = result[0].values.map((row) => {
          return {
            date: row[0],
            exercise_id: row[1],
            reps: row[2],
            metric_weight: row[3],
            comment: row[4] ?? "",
            id: row[5],
          };
        });

        // Track first appearance of each exercise
        const exerciseFirstAppearance = new Map();
        data.forEach((item, index) => {
          if (!exerciseFirstAppearance.has(item.exercise_id)) {
            exerciseFirstAppearance.set(item.exercise_id, index);
          }
        });

        // Group by exercise id
        const groupedData = data.reduce((acc, item) => {
          if (!acc[item.exercise_id]) {
            acc[item.exercise_id] = [];
          }
          acc[item.exercise_id].push(item);
          return acc;
        }, {});

        // Convert to array and sort by first appearance order
        const sortedData = Object.entries(groupedData)
          .sort(([exerciseA], [exerciseB]) => {
            const firstA = exerciseFirstAppearance.get(Number(exerciseA));
            const firstB = exerciseFirstAppearance.get(Number(exerciseB));
            return firstA - firstB;
          })
          .map(([exerciseId, items]) => ({ exerciseId, items }));

        setRows(sortedData);
      } else {
        setRows([]);
      }
    } catch (err) {
      console.error("Error querying database:", err);
    }
  }, [selectedDate, db]);

  // Navigation handlers
  const goToPrevDay = () => {
    const prev = parseDateLocal(selectedDate);
    prev.setDate(prev.getDate() - 1);
    const newDate = formatDateLocal(prev);
    onDateSelect(newDate);
  };
  const goToNextDay = () => {
    const next = parseDateLocal(selectedDate);
    next.setDate(next.getDate() + 1);
    const newDate = formatDateLocal(next);
    onDateSelect(newDate);
  };
  const today = formatDateLocal(new Date());
  const isToday = selectedDate === today;

  const handleExerciseClick = (exerciseId) => {
    setSelectedExercise(exerciseId);
  };

  const handleCloseExercise = () => {
    setSelectedExercise(null);
  };

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
    return String(exerciseId);
  }

  if (loading) {
    return <Box sx={{ p: 2, color: "grey.300" }}>{t.loading}</Box>;
  }
  if (error) {
    return (
      <Box sx={{ p: 2, color: "error.main" }}>
        {t.error}
        {error}
      </Box>
    );
  }

  return (
    <Container
      maxWidth="lg"
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        bgcolor: "background.default",
        px: { xs: 0, md: 1 },
        minHeight: 0,
      }}
    >
      <Paper
        elevation={24}
        sx={{
          width: "100%",
          maxWidth: "lg",
          bgcolor: "background.paper",
          borderRadius: 4,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          flex: "1 1 auto",
          height: "100%",
          minHeight: 0,
        }}
      >
        <Box
          sx={{
            px: { xs: 1, md: 3 },
            pt: 3,
            pb: 0,
            flexShrink: 0,
            borderBottom: 1,
            borderColor: "divider",
          }}
        >
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="center"
            spacing={{ xs: 0.25, md: 2 }}
            mb={1}
          >
            <IconButton
              aria-label="Calendar"
              size="large"
              sx={{ display: { xs: "flex", md: "none" } }}
              onClick={onCalendarOpen}
            >
              <CalendarToday />
            </IconButton>
            <IconButton onClick={goToPrevDay} aria-label="Previous day" size="large">
              <ChevronLeft />
            </IconButton>
            <Typography
              variant="h3"
              sx={{
                textAlign: "center",
                color: "text.primary",
                width: { xs: "184px", md: 320 },
                minWidth: { xs: "184px", md: 320 },
                maxWidth: { xs: "184px", md: 320 },
                display: "inline-block",
                fontSize: { xs: "2rem", md: "3rem" },
                ...(!isToday && {
                  cursor: "pointer",
                  "&:hover": {
                    color: "primary.main",
                    textDecoration: "underline",
                  },
                }),
              }}
              onClick={!isToday ? () => onDateSelect(today) : undefined}
            >
              {isToday
                ? t.today
                : format(
                    parseISO(selectedDate),
                    language && language.toLowerCase() === "pt" ? "ccc, d LLL" : "EEE, MMM d",
                    { locale }
                  )}
            </Typography>
            <IconButton onClick={goToNextDay} aria-label="Next day" size="large" disabled={isToday}>
              <ChevronRight />
            </IconButton>
            <Box sx={{ width: { xs: 48, md: 0 } }} />{" "}
            {/* Invisible spacer to balance calendar button */}
          </Stack>
        </Box>
        <Box
          sx={{
            flex: 1,
            overflow: "auto",
            px: { xs: 2, md: 6 },
            py: 3,
            minHeight: 0, // Important for flex child to shrink
          }}
        >
          {rows.length === 0 ? (
            <Box
              sx={{
                textAlign: "center",
                py: 4,
              }}
            >
              <Typography variant="body1" color="text.secondary" sx={{ fontSize: "1.6875rem" }}>
                {t.noData}
              </Typography>
            </Box>
          ) : (
            rows.map(({ exerciseId, items }) => (
              <Paper
                key={exerciseId}
                elevation={4}
                sx={{ mb: { xs: 2, md: 4 }, borderRadius: 3, p: 2, bgcolor: "background.paper" }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    mb: 2,
                    fontWeight: "bold",
                    color: "text.primary",
                    cursor: "pointer",
                    "&:hover": {
                      color: "primary.main",
                      textDecoration: "underline",
                    },
                  }}
                  onClick={() => handleExerciseClick(exerciseId)}
                >
                  {getDisplayName(exerciseId)}
                </Typography>
                <TableContainer component={Box} sx={{ mb: 2, borderRadius: 2 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell
                          sx={{
                            color: "text.primary",
                            fontWeight: "bold",
                            textAlign: "center",
                            width: { xs: "33.33%", md: "12.5%" },
                          }}
                        >
                          {t.set}
                        </TableCell>
                        <TableCell
                          sx={{
                            color: "text.primary",
                            fontWeight: "bold",
                            textAlign: "center",
                            width: { xs: "33.33%", md: "12.5%" },
                          }}
                        >
                          {t.weight}
                        </TableCell>
                        <TableCell
                          sx={{
                            color: "text.primary",
                            fontWeight: "bold",
                            textAlign: "center",
                            width: { xs: "33.33%", md: "12.5%" },
                          }}
                        >
                          {t.reps}
                        </TableCell>
                        <TableCell
                          sx={{
                            color: "text.primary",
                            fontWeight: "bold",
                            textAlign: "left",
                            width: "62.5%",
                            display: { xs: "none", md: "table-cell" },
                          }}
                        >
                          {t.comment}
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {items.map((item, itemIndex) => (
                        <TableRow key={itemIndex}>
                          <TableCell
                            sx={{
                              textAlign: "center",
                              color: "text.primary",
                              fontWeight: "bold",
                            }}
                          >
                            {itemIndex + 1}
                          </TableCell>
                          <TableCell
                            sx={{
                              textAlign: "center",
                              color: "text.primary",
                            }}
                          >
                            {item.metric_weight} kg
                          </TableCell>
                          <TableCell
                            sx={{
                              textAlign: "center",
                              color: "text.primary",
                            }}
                          >
                            {item.reps}
                          </TableCell>
                          <TableCell
                            sx={{
                              textAlign: "left",
                              color: "text.primary",
                              wordBreak: "break-word",
                              display: { xs: "none", md: "table-cell" },
                            }}
                          >
                            {item.comment || ""}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            ))
          )}
        </Box>
      </Paper>

      {/* Exercise History Popout */}
      {selectedExercise && (
        <ExerciseHistoryPopout
          exerciseId={selectedExercise}
          onClose={handleCloseExercise}
          db={db}
          onDateSelect={onDateSelect}
          language={language}
          i18nMap={i18nMap}
        />
      )}
    </Container>
  );
}
