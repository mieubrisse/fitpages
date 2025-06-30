import { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Divider,
  Tabs,
  Tab,
} from "@mui/material";
import { KeyboardArrowRight } from "@mui/icons-material";
import { format, parseISO } from "date-fns";

export default function ExerciseHistoryPopout({ exerciseName, onClose, db, onDateSelect }) {
  const [exerciseHistory, setExerciseHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isClosing, setIsClosing] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  useEffect(() => {
    if (!exerciseName || !db) return;

    setLoading(true);
    try {
      const query = `
        SELECT 
          t.date,
          t.reps,
          t.metric_weight,
          c.comment AS comment,
          t._id
        FROM training_log t
        LEFT JOIN exercise e ON t.exercise_id = e._id
        LEFT JOIN Comment c ON c.owner_id = t._id
        WHERE e.name = ?
        ORDER BY t.date DESC, t._id ASC;
      `;
      const result = db.exec(query, [exerciseName]);

      if (result.length > 0) {
        const data = result[0].values.map((row) => ({
          date: row[0],
          reps: row[1],
          metric_weight: row[2],
          comment: row[3] ?? "",
          id: row[4],
        }));

        // Group by date
        const groupedData = data.reduce((acc, item) => {
          if (!acc[item.date]) {
            acc[item.date] = [];
          }
          acc[item.date].push(item);
          return acc;
        }, {});

        // Convert to array and sort by date (newest first)
        // Items within each day are already sorted by _id ASC (chronological)
        const sortedData = Object.entries(groupedData)
          .sort(([dateA], [dateB]) => new Date(dateB) - new Date(dateA))
          .map(([date, items]) => ({ date, items }));

        setExerciseHistory(sortedData);
      } else {
        setExerciseHistory([]);
      }
      setLoading(false);
    } catch (err) {
      console.error("Error fetching exercise history:", err);
      setExerciseHistory([]);
      setLoading(false);
    }
  }, [exerciseName, db]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 300); // Match the animation duration
  };

  if (!exerciseName) return null;

  return (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        right: 0,
        width: "45vw",
        height: "100vh",
        zIndex: 1300,
        animation: isClosing ? "slideOut 0.3s ease-in forwards" : "slideIn 0.3s ease-out",
        "@keyframes slideIn": {
          from: {
            transform: "translateX(100%)",
          },
          to: {
            transform: "translateX(0)",
          },
        },
        "@keyframes slideOut": {
          from: {
            transform: "translateX(0)",
          },
          to: {
            transform: "translateX(100%)",
          },
        },
      }}
    >
      <Paper
        elevation={24}
        sx={{
          height: "100%",
          bgcolor: "background.paper",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <Box
          sx={{
            p: 3,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <IconButton
            onClick={handleClose}
            size="large"
            sx={{
              color: "text.secondary",
              "&:hover": {
                color: "text.primary",
                bgcolor: "action.hover",
              },
            }}
          >
            <KeyboardArrowRight />
          </IconButton>
          <Typography variant="h3" component="h2" sx={{ flex: 1, textAlign: "center" }}>
            {exerciseName}
          </Typography>
          <Box sx={{ width: 48 }} /> {/* Spacer to balance the close button */}
        </Box>

        {/* Tabs */}
        <Box sx={{ px: 3, pb: 0, borderBottom: 1, borderColor: "divider" }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            sx={{
              "& .MuiTabs-indicator": {
                bottom: 0,
                height: 2,
              },
            }}
          >
            <Tab label="History" />
            <Tab label="Graph" />
          </Tabs>
        </Box>

        {/* Content */}
        <Box
          sx={{
            flex: 1,
            overflow: "auto",
            p: 3,
          }}
        >
          {activeTab === 0 && (
            <>
              {loading ? (
                <Typography variant="body1" color="text.secondary">
                  Loading exercise history...
                </Typography>
              ) : exerciseHistory.length === 0 ? (
                <Typography variant="body1" color="text.secondary">
                  No history found for this exercise.
                </Typography>
              ) : (
                exerciseHistory.map(({ date, items }) => (
                  <Paper
                    key={date}
                    elevation={4}
                    sx={{ mb: 4, borderRadius: 3, p: 2, bgcolor: "background.paper" }}
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
                      onClick={() => {
                        onDateSelect(date);
                        onClose();
                      }}
                    >
                      {format(parseISO(date), "EEE, MMMM d, yyyy")}
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
                                width: "12.5%",
                              }}
                            >
                              Set
                            </TableCell>
                            <TableCell
                              sx={{
                                color: "text.primary",
                                fontWeight: "bold",
                                textAlign: "center",
                                width: "12.5%",
                              }}
                            >
                              Weight
                            </TableCell>
                            <TableCell
                              sx={{
                                color: "text.primary",
                                fontWeight: "bold",
                                textAlign: "center",
                                width: "12.5%",
                              }}
                            >
                              Reps
                            </TableCell>
                            <TableCell
                              sx={{
                                color: "text.primary",
                                fontWeight: "bold",
                                textAlign: "left",
                                width: "62.5%",
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
                                  textAlign: "left",
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
                  </Paper>
                ))
              )}
            </>
          )}

          {activeTab === 1 && (
            <Typography variant="body1" color="text.secondary">
              Graph view coming soon...
            </Typography>
          )}
        </Box>
      </Paper>
    </Box>
  );
}
