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
        background: "linear-gradient(135deg, #111827 0%, #1f2937 50%, #1e3a8a 100%)",
        px: 1,
      }}
    >
      <Paper
        elevation={8}
        sx={{
          width: "100%",
          maxWidth: "lg",
          backgroundColor: "rgba(31, 41, 55, 0.9)",
          backdropFilter: "blur(8px)",
          borderRadius: 4,
          border: "1px solid #1e3a8a",
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
                  backgroundColor: "#3b82f6",
                  color: "white",
                  "&:hover": {
                    backgroundColor: "#2563eb",
                  },
                  "&:focus": {
                    outline: "none",
                    ring: "2px",
                    ringColor: "#60a5fa",
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
                  border: "2px solid #3b82f6",
                  transition: "colors",
                  ...(isToday
                    ? {
                        backgroundColor: "#3b82f6",
                        color: "white",
                        cursor: "default",
                      }
                    : {
                        backgroundColor: "rgba(255, 255, 255, 0.2)",
                        color: "#1e3a8a",
                        "&:hover": {
                          backgroundColor: "#3b82f6",
                          color: "white",
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
                  backgroundColor: "#3b82f6",
                  color: "white",
                  opacity: isToday ? 0.5 : 1,
                  cursor: isToday ? "not-allowed" : "pointer",
                  "&:hover": {
                    backgroundColor: isToday ? "#3b82f6" : "#2563eb",
                  },
                  "&:focus": {
                    outline: "none",
                    ring: "2px",
                    ringColor: "#60a5fa",
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
                color: "#93c5fd",
                mt: { xs: 1, sm: 0 },
                textShadow: "0 1px 2px rgba(0, 0, 0, 0.5)",
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
            border: "1px solid #1e3a8a",
            backgroundColor: "rgba(17, 24, 39, 0.9)",
            boxShadow: "inset 0 2px 4px rgba(0, 0, 0, 0.3)",
          }}
        >
          <TableContainer
            component={Paper}
            sx={{
              backgroundColor: "transparent",
              maxHeight: 400,
              "& .MuiTable-root": {
                backgroundColor: "transparent",
              },
            }}
          >
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell
                    sx={{
                      backgroundColor: "#1e293b",
                      color: "#93c5fd",
                      fontWeight: "bold",
                      textAlign: "center",
                      borderBottom: "2px solid #1e3a8a",
                    }}
                  >
                    Exercise
                  </TableCell>
                  <TableCell
                    sx={{
                      backgroundColor: "#1e293b",
                      color: "#93c5fd",
                      fontWeight: "bold",
                      textAlign: "center",
                      borderBottom: "2px solid #1e3a8a",
                    }}
                  >
                    Reps
                  </TableCell>
                  <TableCell
                    sx={{
                      backgroundColor: "#1e293b",
                      color: "#93c5fd",
                      fontWeight: "bold",
                      textAlign: "center",
                      borderBottom: "2px solid #1e3a8a",
                    }}
                  >
                    Weight
                  </TableCell>
                  <TableCell
                    sx={{
                      backgroundColor: "#1e293b",
                      color: "#93c5fd",
                      fontWeight: "bold",
                      textAlign: "center",
                      borderBottom: "2px solid #1e3a8a",
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
                        color: "#93c5fd",
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
                          backgroundColor: "rgba(59, 130, 246, 0.1)",
                        },
                      }}
                    >
                      <TableCell
                        sx={{
                          color: "#dbeafe",
                          textAlign: "center",
                          borderBottom: "1px solid #1e3a8a",
                        }}
                      >
                        {row.exercise_name}
                      </TableCell>
                      <TableCell
                        sx={{
                          color: "#dbeafe",
                          textAlign: "center",
                          borderBottom: "1px solid #1e3a8a",
                        }}
                      >
                        {row.reps}
                      </TableCell>
                      <TableCell
                        sx={{
                          color: "#dbeafe",
                          textAlign: "center",
                          borderBottom: "1px solid #1e3a8a",
                        }}
                      >
                        {row.metric_weight}
                      </TableCell>
                      <TableCell
                        sx={{
                          color: "#dbeafe",
                          textAlign: "center",
                          borderBottom: "1px solid #1e3a8a",
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
