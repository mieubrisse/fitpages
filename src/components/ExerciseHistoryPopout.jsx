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
import { format, parseISO, subMonths } from "date-fns";
import { LineChart } from "@mui/x-charts/LineChart";
import { useTheme } from "@mui/material/styles";
import { enUS, pt } from "date-fns/locale";

export default function ExerciseHistoryPopout({
  exerciseId,
  onClose,
  db,
  onDateSelect,
  language = "EN",
  i18nMap = {},
}) {
  const [exerciseHistory, setExerciseHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isClosing, setIsClosing] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [chartData, setChartData] = useState([]);
  const [chartLoading, setChartLoading] = useState(false);
  const [timeframe, setTimeframe] = useState(3);
  const theme = useTheme();

  // Select locale for date-fns
  const locale = language && language.toLowerCase() === "pt" ? pt : enUS;

  // Translation map
  const i18nStaticStrings = {
    history: language && language.toLowerCase() === "pt" ? "Histórico" : "History",
    graph: language && language.toLowerCase() === "pt" ? "Gráfico" : "Graph",
    records: language && language.toLowerCase() === "pt" ? "Recordes" : "Records",
    loadingHistory:
      language && language.toLowerCase() === "pt"
        ? "Carregando histórico de exercício..."
        : "Loading exercise history...",
    noHistory:
      language && language.toLowerCase() === "pt"
        ? "Nenhum histórico encontrado para este exercício."
        : "No history found for this exercise.",
    set: language && language.toLowerCase() === "pt" ? "Série" : "Set",
    weight: language && language.toLowerCase() === "pt" ? "Peso" : "Weight",
    reps: language && language.toLowerCase() === "pt" ? "Reps" : "Reps",
    comment: language && language.toLowerCase() === "pt" ? "Comentário" : "Comment",
    loadingChart:
      language && language.toLowerCase() === "pt"
        ? "Carregando dados do gráfico..."
        : "Loading chart data...",
    noChart:
      language && language.toLowerCase() === "pt"
        ? "Nenhum dado disponível para o período selecionado."
        : "No data available for the selected timeframe.",
    maxWeightOverTime:
      language && language.toLowerCase() === "pt"
        ? "Peso Máximo ao Longo do Tempo"
        : "Max Weight Over Time",
    loadingRecords:
      language && language.toLowerCase() === "pt" ? "Carregando recordes..." : "Loading records...",
    noRecords:
      language && language.toLowerCase() === "pt"
        ? "Nenhum recorde encontrado para este exercício."
        : "No records found for this exercise.",
    repsCol: language && language.toLowerCase() === "pt" ? "Reps" : "Reps",
    maxWeightCol: language && language.toLowerCase() === "pt" ? "Peso Máximo" : "Max Weight",
    dateCol: language && language.toLowerCase() === "pt" ? "Data" : "Date",
    noRecordsFound:
      language && language.toLowerCase() === "pt"
        ? "Nenhum recorde encontrado."
        : "No records found.",
    tf3months: language && language.toLowerCase() === "pt" ? "3 meses" : "3 Months",
    tf6months: language && language.toLowerCase() === "pt" ? "6 meses" : "6 Months",
    tf1year: language && language.toLowerCase() === "pt" ? "1 ano" : "1 Year",
    yAxis: language && language.toLowerCase() === "pt" ? "Peso (kg)" : "Weight (kg)",
  };

  // Timeframe options: value is number of months
  const graphTimeframes = [
    { value: 3, label: i18nStaticStrings.tf3months },
    { value: 6, label: i18nStaticStrings.tf6months },
    { value: 12, label: i18nStaticStrings.tf1year },
  ];

  const getTimeframeDate = (months) => {
    const now = new Date();
    return subMonths(now, months);
  };

  const fetchChartData = async () => {
    if (!db || !exerciseId) return;

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
        WHERE e._id = ? AND t.date >= ? AND t.date <= ?
        GROUP BY t.date
        ORDER BY t.date ASC;
      `;

      const result = db.exec(query, [exerciseId, startDate, endDate]);

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
  }, [activeTab, timeframe, exerciseId, db]);

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
    if (!exerciseId || !db) return;

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
        WHERE e._id = ?
        ORDER BY t.date DESC, t._id ASC;
      `;
      const result = db.exec(query, [exerciseId]);

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
  }, [exerciseId, db]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 300); // Match the animation duration
  };

  // Helper to get the display name for an exercise
  function getDisplayName(id) {
    if (
      language &&
      language.toLowerCase() !== "en" &&
      i18nMap &&
      i18nMap[id] &&
      i18nMap[id][language.toLowerCase()]
    ) {
      return i18nMap[id][language.toLowerCase()];
    }
    // Fallback to English if available
    if (i18nMap && i18nMap[id] && i18nMap[id]["en"]) {
      return i18nMap[id]["en"];
    }
    // Fallback to ID if no name is available
    return String(id);
  }

  if (!exerciseId) return null;

  return (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        right: 0,
        width: { xs: "95vw", md: "45vw" },
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
            p: { xs: 2, md: 3 },
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: 0,
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
          <Typography
            variant="h3"
            component="h2"
            sx={{
              flex: 1,
              textAlign: "center",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              px: 1,
              fontSize: { xs: "2rem", md: "3rem" },
              minWidth: 0,
            }}
          >
            {getDisplayName(exerciseId)}
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
            <Tab label={i18nStaticStrings.history} />
            <Tab label={i18nStaticStrings.graph} />
            <Tab label={i18nStaticStrings.records} />
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
                  {i18nStaticStrings.loadingHistory}
                </Typography>
              ) : exerciseHistory.length === 0 ? (
                <Typography variant="body1" color="text.secondary">
                  {i18nStaticStrings.noHistory}
                </Typography>
              ) : (
                exerciseHistory.map(({ date, items }) => (
                  <Paper
                    key={date}
                    elevation={4}
                    sx={{
                      mb: { xs: 2, md: 4 },
                      borderRadius: 3,
                      p: 2,
                      bgcolor: "background.paper",
                    }}
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
                      {format(
                        parseISO(date),
                        language && language.toLowerCase() === "pt"
                          ? "ccc, d LLLL, yyyy"
                          : "EEE, MMMM d, yyyy",
                        { locale }
                      )}
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
                                width: { xs: "33.33%", md: "12.5%" },
                              }}
                            >
                              {i18nStaticStrings.set}
                            </TableCell>
                            <TableCell
                              sx={{
                                color: "text.primary",
                                fontWeight: "bold",
                                textAlign: "center",
                                width: { xs: "33.33%", md: "12.5%" },
                              }}
                            >
                              {i18nStaticStrings.weight}
                            </TableCell>
                            <TableCell
                              sx={{
                                color: "text.primary",
                                fontWeight: "bold",
                                textAlign: "center",
                                width: { xs: "33.33%", md: "12.5%" },
                              }}
                            >
                              {i18nStaticStrings.reps}
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
                              {i18nStaticStrings.comment}
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
            </>
          )}

          {activeTab === 1 && (
            <>
              <Box sx={{ mb: 3 }}>
                <FormControl fullWidth>
                  <Select value={timeframe} onChange={(e) => setTimeframe(Number(e.target.value))}>
                    {graphTimeframes.map((tf) => (
                      <MenuItem key={tf.value} value={tf.value}>
                        {tf.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              {chartLoading ? (
                <Typography variant="body1" color="text.secondary">
                  {i18nStaticStrings.loadingChart}
                </Typography>
              ) : chartData.length === 0 ? (
                <Typography variant="body1" color="text.secondary">
                  {i18nStaticStrings.noChart}
                </Typography>
              ) : (
                <Box sx={{ height: 400, width: "100%" }}>
                  <Typography variant="h6" sx={{ mb: 2, textAlign: "center" }}>
                    {i18nStaticStrings.maxWeightOverTime}
                  </Typography>
                  <LineChart
                    height={350}
                    series={[
                      {
                        data: chartData.map((point) => point.maxWeight),
                        label: "Max Weight (kg)",
                        color: theme.palette.primary.main,
                        showMark: true,
                      },
                    ]}
                    xAxis={[
                      {
                        data: chartData.map((point) => {
                          const [year, month, day] = point.date.split("-").map(Number);
                          return new Date(year, month - 1, day);
                        }),
                        scaleType: "time",
                        valueFormatter: (date) =>
                          format(
                            date,
                            language && language.toLowerCase() === "pt" ? "d LLLL" : "MMM d",
                            { locale }
                          ),
                      },
                    ]}
                    yAxis={[
                      {
                        label: i18nStaticStrings.yAxis,
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
                    onAxisClick={(_, params) => {
                      if (typeof params.dataIndex === "number") {
                        const clickedDate = chartData[params.dataIndex]?.date;
                        if (clickedDate) {
                          onDateSelect(clickedDate);
                          onClose();
                        }
                      }
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
                  {i18nStaticStrings.loadingRecords}
                </Typography>
              ) : exerciseHistory.length === 0 ? (
                <Typography variant="body1" color="text.secondary">
                  {i18nStaticStrings.noRecords}
                </Typography>
              ) : (
                (() => {
                  // Flatten all sets for this exercise (with date for record lookup)
                  const allSets = exerciseHistory.flatMap(({ date, items }) =>
                    items.map((item) => ({ ...item, date }))
                  );
                  // Bucket by reps (1-15 only)
                  const repBuckets = {};
                  const repDates = {};
                  allSets.forEach((set) => {
                    const reps = set.reps;
                    const weight = set.metric_weight;
                    if (reps > 0 && reps <= 15) {
                      if (!repBuckets[reps] || weight > repBuckets[reps]) {
                        repBuckets[reps] = weight;
                        repDates[reps] = set.date;
                      } else if (weight === repBuckets[reps]) {
                        // If same weight, keep the earlier date
                        const currentDate = repDates[reps];
                        const newDate = set.date;
                        if (newDate < currentDate) {
                          repDates[reps] = newDate;
                        }
                      }
                    }
                  });
                  // Find the highest rep count present (up to 15)
                  const repEntries = Object.entries(repBuckets)
                    .map(([reps, weight]) => [parseInt(reps, 10), weight])
                    .sort((a, b) => a[0] - b[0]);
                  const maxRep = repEntries.length > 0 ? repEntries[repEntries.length - 1][0] : 0;
                  // Create a map of reps -> maxWeight for easy lookup
                  const repsToMaxWeight = new Map(repEntries);
                  // Create a map of reps -> earliest date for easy lookup
                  const repsToDate = new Map(
                    Object.entries(repDates).map(([reps, date]) => [parseInt(reps, 10), date])
                  );

                  // Build the display list with simplified cascading logic
                  const cascaded = [];
                  let currentMaxWeight = null;
                  let currentMaxDate = null;

                  // Start from the highest rep found (up to 15)
                  if (maxRep > 0) {
                    currentMaxWeight = repsToMaxWeight.get(maxRep);
                    currentMaxDate = repsToDate.get(maxRep);
                  }

                  // Walk downwards by 1 rep at a time
                  for (let rep = maxRep; rep >= 1; rep--) {
                    const realWeight = repsToMaxWeight.get(rep);
                    const realDate = repsToDate.get(rep);

                    // If this rep has a higher weight than our current max, update it
                    if (realWeight !== undefined) {
                      if (currentMaxWeight === null || realWeight > currentMaxWeight) {
                        // Higher weight - always update
                        currentMaxWeight = realWeight;
                        currentMaxDate = realDate;
                      } else if (realWeight === currentMaxWeight && realDate < currentMaxDate) {
                        // Same weight but earlier date - update to the earlier date
                        currentMaxWeight = realWeight;
                        currentMaxDate = realDate;
                      }
                    }

                    // Add this rep to the display list
                    cascaded.unshift({
                      reps: rep,
                      weight: currentMaxWeight,
                      date: currentMaxDate,
                      isImplied: realWeight === undefined || realWeight < currentMaxWeight,
                    });
                  }
                  return (
                    <TableContainer
                      component={Box}
                      sx={{ mb: 2, borderRadius: 2, width: "auto", minWidth: 0 }}
                    >
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell sx={{ textAlign: "center", fontWeight: "bold" }}>
                              {i18nStaticStrings.repsCol}
                            </TableCell>
                            <TableCell sx={{ textAlign: "center", fontWeight: "bold" }}>
                              {i18nStaticStrings.maxWeightCol}
                            </TableCell>
                            <TableCell sx={{ textAlign: "center", fontWeight: "bold" }}>
                              {i18nStaticStrings.dateCol}
                            </TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {cascaded.length === 0 || !cascaded[0].weight ? (
                            <TableRow>
                              <TableCell colSpan={3} align="center">
                                <Typography variant="body2" color="text.secondary">
                                  {i18nStaticStrings.noRecordsFound}
                                </Typography>
                              </TableCell>
                            </TableRow>
                          ) : (
                            cascaded.map(({ reps, weight, date, isImplied }) => {
                              if (!weight) return null;
                              let formatted = "";
                              if (date) {
                                const [year, month, day] = date.split("-").map(Number);
                                const localDate = new Date(year, month - 1, day);
                                formatted = format(
                                  localDate,
                                  language && language.toLowerCase() === "pt"
                                    ? "d LLL, yyyy"
                                    : "MMM d, yyyy",
                                  { locale }
                                );
                              }
                              return (
                                <TableRow key={reps}>
                                  <TableCell sx={{ textAlign: "center" }}>{reps}RM</TableCell>
                                  <TableCell
                                    sx={{
                                      textAlign: "center",
                                      color: isImplied ? "text.secondary" : "text.primary",
                                    }}
                                  >
                                    {parseFloat(weight).toFixed(1)}kg
                                  </TableCell>
                                  <TableCell
                                    sx={{
                                      textAlign: "center",
                                      color: isImplied ? "text.secondary" : "text.primary",
                                      cursor: date ? "pointer" : "default",
                                      "&:hover": date
                                        ? {
                                            color: "primary.main",
                                            textDecoration: "underline",
                                          }
                                        : {},
                                    }}
                                    onClick={
                                      date
                                        ? () => {
                                            onDateSelect(date);
                                            onClose();
                                          }
                                        : undefined
                                    }
                                  >
                                    {formatted}
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
