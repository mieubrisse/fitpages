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
            comment: row[4] ?? "",
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
          my: 4,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          flex: "1 1 auto",
        }}
      >
        <Box sx={{ px: 2, pt: 2, pb: 0 }}>
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
              {selectedDate}
            </Button>
            <IconButton onClick={goToNextDay} aria-label="Next day" size="large" disabled={isToday}>
              <ChevronRight />
            </IconButton>
          </Stack>
        </Box>
        <Box
          sx={{
            mx: 4,
            mb: 4,
            borderRadius: 4,
            overflow: "hidden",
            bgcolor: "background.paper",
            flex: "1 1 auto",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <TableContainer
            component={Paper}
            sx={{
              bgcolor: "background.paper",
              flex: "1 1 0",
              minHeight: 0,
              display: "flex",
              flexDirection: "column",
              "& .MuiTable-root": {
                bgcolor: "background.paper",
              },
            }}
          >
            <Table stickyHeader>
              <TableHead>
                <TableRow sx={{ bgcolor: "grey.900" }}>
                  <TableCell
                    sx={{
                      bgcolor: "grey.900",
                      color: "text.primary",
                      fontWeight: "bold",
                      textAlign: "center",
                      width: "40%",
                      maxWidth: 0,
                      borderRight: "1px solid",
                      borderColor: "divider",
                    }}
                  >
                    Exercise
                  </TableCell>
                  <TableCell
                    sx={{
                      bgcolor: "grey.900",
                      color: "text.primary",
                      fontWeight: "bold",
                      textAlign: "center",
                      width: "10%",
                      maxWidth: 0,
                      borderRight: "1px solid",
                      borderColor: "divider",
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
                      width: "10%",
                      maxWidth: 0,
                      borderRight: "1px solid",
                      borderColor: "divider",
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
                      width: "40%",
                      maxWidth: 0,
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
                    <TableRow key={index}>
                      <TableCell
                        sx={{
                          color: "text.primary",
                          textAlign: "center",
                          width: "40%",
                          maxWidth: 0,
                          borderRight: "1px solid",
                          borderColor: "divider",
                          wordBreak: "break-word",
                        }}
                      >
                        {row.exercise_name}
                      </TableCell>
                      <TableCell
                        sx={{
                          color: "text.primary",
                          textAlign: "center",
                          width: "10%",
                          maxWidth: 0,
                          borderRight: "1px solid",
                          borderColor: "divider",
                          wordBreak: "break-word",
                        }}
                      >
                        {row.reps}
                      </TableCell>
                      <TableCell
                        sx={{
                          color: "text.primary",
                          textAlign: "center",
                          width: "10%",
                          maxWidth: 0,
                          borderRight: "1px solid",
                          borderColor: "divider",
                          wordBreak: "break-word",
                        }}
                      >
                        {row.metric_weight} kg
                      </TableCell>
                      <TableCell
                        sx={{
                          color: "text.primary",
                          textAlign: "center",
                          width: "40%",
                          maxWidth: 0,
                          wordBreak: "break-word",
                        }}
                      >
                        {row.comment ? row.comment : ""}
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
