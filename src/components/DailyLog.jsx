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
  Typography,
  Container,
} from "@mui/material";
import { ChevronLeft, ChevronRight } from "@mui/icons-material";
import initSqlJs from "sql.js";

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
          c.comment AS comment
        FROM training_log t
        LEFT JOIN exercise e ON t.exercise_id = e._id
        LEFT JOIN Comment c ON c.owner_id = t._id
        WHERE t.date = ?
        ORDER BY t.date DESC;
      `;
      const result = db.exec(query, [selectedDate]);
      if (result.length > 0) {
        const data = result[0].values.map((row) => {
          return {
            date: row[0],
            exercise_name: row[1],
            reps: row[2],
            metric_weight: row[3],
            comment: row[4] || "-",
          };
        });
        setRows(data);
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
    onDateSelect(formatDateLocal(prev));
  };
  const goToNextDay = () => {
    const next = parseDateLocal(selectedDate);
    next.setDate(next.getDate() + 1);
    onDateSelect(formatDateLocal(next));
  };
  const today = formatDateLocal(new Date());
  const isToday = selectedDate === today;

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
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        bgcolor: "background.default",
        px: 1,
      }}
    >
      <Paper
        elevation={8}
        sx={{
          width: "100%",
          maxWidth: "lg",
          bgcolor: "background.paper",
          borderRadius: 4,
          mt: 4,
          overflow: "hidden",
        }}
      >
        <Box sx={{ p: 4, pb: 2 }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              alignItems: "center",
              mb: 2,
              gap: 2,
              justifyContent: "space-between",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <IconButton
                onClick={goToPrevDay}
                aria-label="Previous day"
                sx={{
                  bgcolor: "primary.main",
                  color: "primary.contrastText",
                  "&:hover": {
                    bgcolor: "primary.dark",
                  },
                }}
              >
                <ChevronLeft />
              </IconButton>
              <Button
                onClick={() => {
                  if (!isToday) onDateSelect(today);
                }}
                disabled={isToday}
                title={isToday ? "Today" : "Go to today"}
                sx={{
                  fontSize: "1.25rem",
                  fontWeight: "bold",
                  mx: 1,
                  px: 1,
                  py: 0.5,
                  borderRadius: "9999px",
                  border: (theme) => `2px solid ${theme.palette.primary.main}`,
                  transition: "colors",
                  ...(isToday
                    ? {
                        bgcolor: "primary.main",
                        color: "primary.contrastText",
                        cursor: "default",
                      }
                    : {
                        bgcolor: "background.paper",
                        color: "primary.main",
                        "&:hover": {
                          bgcolor: "primary.main",
                          color: "primary.contrastText",
                        },
                        cursor: "pointer",
                      }),
                }}
              >
                {selectedDate}
              </Button>
              <IconButton
                onClick={goToNextDay}
                aria-label="Next day"
                disabled={isToday}
                sx={{
                  bgcolor: "primary.main",
                  color: "primary.contrastText",
                  opacity: isToday ? 0.5 : 1,
                  cursor: isToday ? "not-allowed" : "pointer",
                  "&:hover": {
                    bgcolor: isToday ? "primary.main" : "primary.dark",
                  },
                }}
              >
                <ChevronRight />
              </IconButton>
            </Box>
            <Typography
              variant="h4"
              sx={{
                fontWeight: "bold",
                color: "text.primary",
                mt: { xs: 1, sm: 0 },
              }}
            >
              Workouts for {selectedDate}
            </Typography>
          </Box>
        </Box>
        <Box
          sx={{
            mx: 4,
            mb: 4,
            borderRadius: 4,
            overflow: "hidden",
            bgcolor: "background.paper",
          }}
        >
          <TableContainer
            component={Paper}
            sx={{
              bgcolor: "background.paper",
              maxHeight: 400,
              "& .MuiTable-root": {
                bgcolor: "background.paper",
              },
            }}
          >
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell
                    sx={{
                      bgcolor: "background.paper",
                      color: "text.primary",
                      fontWeight: "bold",
                      textAlign: "center",
                    }}
                  >
                    Exercise
                  </TableCell>
                  <TableCell
                    sx={{
                      bgcolor: "background.paper",
                      color: "text.primary",
                      fontWeight: "bold",
                      textAlign: "center",
                    }}
                  >
                    Reps
                  </TableCell>
                  <TableCell
                    sx={{
                      bgcolor: "background.paper",
                      color: "text.primary",
                      fontWeight: "bold",
                      textAlign: "center",
                    }}
                  >
                    Weight
                  </TableCell>
                  <TableCell
                    sx={{
                      bgcolor: "background.paper",
                      color: "text.primary",
                      fontWeight: "bold",
                      textAlign: "center",
                    }}
                  >
                    Comment
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      sx={{
                        textAlign: "center",
                        color: "text.secondary",
                        fontSize: "1.125rem",
                        borderBottom: "none",
                      }}
                    >
                      No data
                    </TableCell>
                  </TableRow>
                ) : (
                  rows.map((row, index) => (
                    <TableRow
                      key={index}
                      sx={{
                        "&:hover": {
                          backgroundColor: "action.hover",
                        },
                      }}
                    >
                      <TableCell
                        sx={{
                          color: "text.primary",
                          textAlign: "center",
                        }}
                      >
                        {row.exercise_name}
                      </TableCell>
                      <TableCell
                        sx={{
                          color: "text.primary",
                          textAlign: "center",
                        }}
                      >
                        {row.reps}
                      </TableCell>
                      <TableCell
                        sx={{
                          color: "text.primary",
                          textAlign: "center",
                        }}
                      >
                        {row.metric_weight}
                      </TableCell>
                      <TableCell
                        sx={{
                          color: "text.primary",
                          textAlign: "center",
                        }}
                      >
                        {row.comment}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Paper>
    </Container>
  );
}
