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
  Select,
  MenuItem,
  FormControl,
} from "@mui/material";
import { KeyboardArrowRight } from "@mui/icons-material";
import { format, parseISO, subMonths, subYears, compareAsc } from "date-fns";
import { LineChart } from "@mui/x-charts/LineChart";
import { useTheme } from "@mui/material/styles";

export default function ExerciseHistoryPopout({ exerciseName, onClose, db, onDateSelect }) {
  const [exerciseHistory, setExerciseHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isClosing, setIsClosing] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [chartData, setChartData] = useState([]);
  const [chartLoading, setChartLoading] = useState(false);
  const [timeframe, setTimeframe] = useState("3months");
  const theme = useTheme();

  const timeframes = [
    { value: "3months", label: "3 Months" },
    { value: "6months", label: "6 Months" },
    { value: "1year", label: "1 Year" },
  ];

  const getTimeframeDate = (timeframe) => {
    const now = new Date();
    switch (timeframe) {
      case "3months":
        return subMonths(now, 3);
      case "6months":
        return subMonths(now, 6);
      case "1year":
        return subYears(now, 1);
      default:
        return subMonths(now, 3);
    }
  };

  const fetchChartData = async () => {
    if (!db || !exerciseName) return;

    setChartLoading(true);
    try {
      const startDate = formatDateLocal(getTimeframeDate(timeframe));
      const endDate = formatDateLocal(new Date());

      const query = `
        SELECT 
          t.date,
          MAX(t.metric_weight) as max_weight
        FROM training_log t
        LEFT JOIN exercise e ON t.exercise_id = e._id
        WHERE e.name = ? AND t.date >= ? AND t.date <= ?
        GROUP BY t.date
        ORDER BY t.date ASC;
      `;

      const result = db.exec(query, [exerciseName, startDate, endDate]);

      if (result.length > 0) {
        const data = result[0].values.map((row) => ({
          date: row[0],
          maxWeight: row[1],
        }));
        setChartData(data);
      } else {
        setChartData([]);
      }
    } catch (err) {
      console.error("Error fetching chart data:", err);
      setChartData([]);
    } finally {
      setChartLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 1) {
      fetchChartData();
    }
  }, [activeTab, timeframe, exerciseName, db]);

  // Format a Date object as YYYY-MM-DD in local time
  const formatDateLocal = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

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
            <Tab label="Records" />
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
                    <TableContainer
                      component={Box}
                      sx={{ mb: 2, borderRadius: 2, width: "auto", minWidth: 0 }}
                    >
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
            <>
              <Box sx={{ mb: 3 }}>
                <FormControl fullWidth>
                  <Select value={timeframe} onChange={(e) => setTimeframe(e.target.value)}>
                    {timeframes.map((tf) => (
                      <MenuItem key={tf.value} value={tf.value}>
                        {tf.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              {chartLoading ? (
                <Typography variant="body1" color="text.secondary">
                  Loading chart data...
                </Typography>
              ) : chartData.length === 0 ? (
                <Typography variant="body1" color="text.secondary">
                  No data available for the selected timeframe.
                </Typography>
              ) : (
                <Box sx={{ height: 400, width: "100%" }}>
                  <Typography variant="h6" sx={{ mb: 2, textAlign: "center" }}>
                    Max Weight Over Time
                  </Typography>
                  <LineChart
                    height={350}
                    series={[
                      {
                        data: chartData.map((point) => point.maxWeight),
                        label: "Max Weight (kg)",
                        color: theme.palette.primary.main,
                      },
                    ]}
                    xAxis={[
                      {
                        data: chartData.map((point) => {
                          const [year, month, day] = point.date.split("-").map(Number);
                          return new Date(year, month - 1, day);
                        }),
                        scaleType: "time",
                        valueFormatter: (date) => format(date, "MMM d"),
                      },
                    ]}
                    yAxis={[
                      {
                        label: "Weight (kg)",
                      },
                    ]}
                    hideLegend={true}
                    slotProps={{
                      mark: {
                        color: theme.palette.primary.main,
                        borderColor: theme.palette.primary.main,
                        fill: "transparent",
                      },
                    }}
                  />
                </Box>
              )}
            </>
          )}

          {activeTab === 2 && (
            <Paper
              elevation={4}
              sx={{
                mb: 4,
                borderRadius: 3,
                p: 2,
                bgcolor: "background.paper",
                width: "auto",
                display: "inline-block",
                minWidth: 0,
              }}
            >
              {loading ? (
                <Typography variant="body1" color="text.secondary">
                  Loading records...
                </Typography>
              ) : exerciseHistory.length === 0 ? (
                <Typography variant="body1" color="text.secondary">
                  No records found for this exercise.
                </Typography>
              ) : (
                (() => {
                  // Flatten all sets for this exercise
                  const allSets = exerciseHistory.flatMap(({ items }) => items);
                  // Bucket by reps (1-15 only)
                  const repBuckets = {};
                  allSets.forEach((set) => {
                    const reps = set.reps;
                    const weight = set.metric_weight;
                    if (reps > 0 && reps <= 15) {
                      if (!repBuckets[reps] || weight > repBuckets[reps]) {
                        repBuckets[reps] = weight;
                      }
                    }
                  });
                  // Sort by rep count ascending
                  const sorted = Object.entries(repBuckets)
                    .map(([reps, weight]) => [parseInt(reps, 10), weight])
                    .sort((a, b) => a[0] - b[0]);
                  return (
                    <TableContainer
                      component={Box}
                      sx={{ mb: 2, borderRadius: 2, width: "auto", minWidth: 0 }}
                    >
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell sx={{ textAlign: "center", fontWeight: "bold" }}>
                              Reps
                            </TableCell>
                            <TableCell sx={{ textAlign: "center", fontWeight: "bold" }}>
                              Max Weight
                            </TableCell>
                            <TableCell sx={{ textAlign: "center", fontWeight: "bold" }}>
                              Date
                            </TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {sorted.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={2} align="center">
                                <Typography variant="body2" color="text.secondary">
                                  No records found.
                                </Typography>
                              </TableCell>
                            </TableRow>
                          ) : (
                            sorted.map(([reps, weight]) => {
                              // Find the earliest date this record was achieved
                              const allSets = exerciseHistory.flatMap(({ date, items }) =>
                                items.map((item) => ({ ...item, date }))
                              );
                              const matchingSets = allSets.filter(
                                (set) => set.reps === reps && set.metric_weight === weight
                              );
                              // Sort by date ascending (earliest first)
                              matchingSets.sort((a, b) => {
                                const [ya, ma, da] = a.date.split("-").map(Number);
                                const [yb, mb, db] = b.date.split("-").map(Number);
                                return compareAsc(
                                  new Date(ya, ma - 1, da),
                                  new Date(yb, mb - 1, db)
                                );
                              });
                              const recordDate =
                                matchingSets.length > 0 ? matchingSets[0].date : "";
                              let recordDateFormatted = "";
                              if (recordDate) {
                                const [year, month, day] = recordDate.split("-").map(Number);
                                const localDate = new Date(year, month - 1, day);
                                recordDateFormatted = format(localDate, "MMM d, yyyy");
                              }
                              return (
                                <TableRow key={reps}>
                                  <TableCell sx={{ textAlign: "center" }}>{reps}RM</TableCell>
                                  <TableCell sx={{ textAlign: "center" }}>
                                    {parseFloat(weight).toFixed(1)}kg
                                  </TableCell>
                                  <TableCell sx={{ textAlign: "center" }}>
                                    {recordDateFormatted}
                                  </TableCell>
                                </TableRow>
                              );
                            })
                          )}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  );
                })()
              )}
            </Paper>
          )}
        </Box>
      </Paper>
    </Box>
  );
}
