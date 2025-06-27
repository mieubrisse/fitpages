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
import { ChevronLeft, ChevronRight } from "@mui/icons-material";
import initSqlJs from "sql.js";
import { format, parseISO } from "date-fns";
import ExerciseHistoryPopout from "./ExerciseHistoryPopout";

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

export default function DailyLog({ selectedDate, onDateSelect }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [db, setDb] = useState(null);
  const [selectedExercise, setSelectedExercise] = useState(null);

  // Load DB only once
  useEffect(() => {
    const loadDb = async () => {
      try {
        const SQL = await initSqlJs({
          locateFile: (file) => `https://sql.js.org/dist/${file}`,
        });
        const response = await fetch("/FitNotes_Backup.fitnotes");
        const arrayBuffer = await response.arrayBuffer();
        const dbInstance = new SQL.Database(new Uint8Array(arrayBuffer));
        setDb(dbInstance);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    loadDb();
  }, []);

  // Query for the selected date
  useEffect(() => {
    if (!db) return;
    setLoading(true);
    try {
      const query = `
        SELECT 
          t.date,
          e.name AS exercise_name,
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
            exercise_name: row[1],
            reps: row[2],
            metric_weight: row[3],
            comment: row[4] ?? "",
            id: row[5],
          };
        });

        // Track first appearance of each exercise
        const exerciseFirstAppearance = new Map();
        data.forEach((item, index) => {
          if (!exerciseFirstAppearance.has(item.exercise_name)) {
            exerciseFirstAppearance.set(item.exercise_name, index);
          }
        });

        // Group by exercise name
        const groupedData = data.reduce((acc, item) => {
          if (!acc[item.exercise_name]) {
            acc[item.exercise_name] = [];
          }
          acc[item.exercise_name].push(item);
          return acc;
        }, {});

        // Convert to array and sort by first appearance order
        const sortedData = Object.entries(groupedData)
          .sort(([exerciseA], [exerciseB]) => {
            const firstA = exerciseFirstAppearance.get(exerciseA);
            const firstB = exerciseFirstAppearance.get(exerciseB);
            return firstA - firstB;
          })
          .map(([exerciseName, items]) => ({ exerciseName, items }));

        setRows(sortedData);
      } else {
        setRows([]);
      }
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }, [db, selectedDate]);

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

  const handleExerciseClick = (exerciseName) => {
    setSelectedExercise(exerciseName);
  };

  const handleCloseExercise = () => {
    setSelectedExercise(null);
  };

  if (loading) {
    return <Box sx={{ p: 2, color: "grey.300" }}>Loading workout log...</Box>;
  }
  if (error) {
    return <Box sx={{ p: 2, color: "error.main" }}>Error: {error}</Box>;
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
        px: 1,
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
          my: 3,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          flex: "1 1 auto",
          height: "100%",
          minHeight: 0,
        }}
      >
        <Box sx={{ px: 3, pt: 3, pb: 0, flexShrink: 0, borderBottom: 1, borderColor: "divider" }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: "bold",
              letterSpacing: 1,
              mb: 1,
              textAlign: "center",
              color: "text.primary",
            }}
          >
            {isToday ? "Today" : format(parseISO(selectedDate), "EEE, MMMM d, yyyy")}
          </Typography>
          <Stack direction="row" alignItems="center" justifyContent="center" spacing={1} mb={1}>
            <IconButton onClick={goToPrevDay} aria-label="Previous day" size="large">
              <ChevronLeft />
            </IconButton>
            <Button
              variant="text"
              disableRipple
              disabled={isToday}
              onClick={() => !isToday && onDateSelect(today)}
              sx={{
                minWidth: 120,
                fontWeight: "normal",
                fontSize: "1.25rem",
                textTransform: "none",
                color: "text.primary",
                backgroundColor: "transparent",
                cursor: isToday ? "default" : "pointer",
                transition: "background 0.2s, color 0.2s",
                "&:hover": !isToday
                  ? {
                      backgroundColor: "primary.main",
                      color: "primary.contrastText",
                    }
                  : {},
                "&.Mui-disabled": {
                  color: "text.primary",
                  backgroundColor: "transparent",
                  opacity: 1,
                },
              }}
            >
              {isToday ? "Today" : format(parseISO(selectedDate), "EEE, MMMM d")}
            </Button>
            <IconButton onClick={goToNextDay} aria-label="Next day" size="large" disabled={isToday}>
              <ChevronRight />
            </IconButton>
          </Stack>
        </Box>
        <Box
          sx={{
            flex: 1,
            overflow: "auto",
            px: 6,
            py: 3,
            minHeight: 0, // Important for flex child to shrink
          }}
        >
          {rows.length === 0 ? (
            <Box
              sx={{
                textAlign: "center",
                color: "text.secondary",
                fontSize: "1.125rem",
                py: 4,
              }}
            >
              No data
            </Box>
          ) : (
            rows.map(({ exerciseName, items }) => (
              <Box key={exerciseName} sx={{ mb: 4 }}>
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
                  onClick={() => handleExerciseClick(exerciseName)}
                >
                  {exerciseName}
                </Typography>

                <TableContainer
                  component={Paper}
                  sx={{
                    bgcolor: "background.default",
                    mb: 2,
                  }}
                >
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ bgcolor: "grey.900" }}>
                        <TableCell
                          sx={{
                            bgcolor: "grey.900",
                            color: "text.primary",
                            fontWeight: "bold",
                            textAlign: "center",
                            width: "15%",
                          }}
                        >
                          Set
                        </TableCell>
                        <TableCell
                          sx={{
                            bgcolor: "grey.900",
                            color: "text.primary",
                            fontWeight: "bold",
                            textAlign: "center",
                            width: "20%",
                          }}
                        >
                          Weight
                        </TableCell>
                        <TableCell
                          sx={{
                            bgcolor: "grey.900",
                            color: "text.primary",
                            fontWeight: "bold",
                            textAlign: "center",
                            width: "15%",
                          }}
                        >
                          Reps
                        </TableCell>
                        <TableCell
                          sx={{
                            bgcolor: "grey.900",
                            color: "text.primary",
                            fontWeight: "bold",
                            textAlign: "center",
                            width: "50%",
                          }}
                        >
                          Comment
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
                              textAlign: "center",
                              color: "text.primary",
                              wordBreak: "break-word",
                            }}
                          >
                            {item.comment || ""}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            ))
          )}
        </Box>
      </Paper>

      {/* Exercise History Popout */}
      {selectedExercise && (
        <ExerciseHistoryPopout
          exerciseName={selectedExercise}
          onClose={handleCloseExercise}
          db={db}
        />
      )}
    </Container>
  );
}
