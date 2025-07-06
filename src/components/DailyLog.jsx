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
import { ChevronLeft, ChevronRight, CalendarToday, ChatBubbleOutline } from "@mui/icons-material";
import { format, parseISO } from "date-fns";
import ExerciseHistoryPopout from "./ExerciseHistoryPopout";
import CommentModal from "./CommentModal";
import { enUS, pt } from "date-fns/locale";

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

// Format weight to display cleanly (max 2 decimal places, remove trailing zeros)
function formatWeight(weight) {
  if (weight === null || weight === undefined) return "0";
  const rounded = Math.round(weight * 100) / 100; // Round to 2 decimal places
  return rounded % 1 === 0 ? rounded.toString() : rounded.toString();
}

export default function DailyLog({
  selectedDate,
  onDateSelect,
  language = "EN",
  i18nMap,
  onCalendarOpen,
  dateToExercise,
  exerciseToDate,
}) {
  const [rows, setRows] = useState([]);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [commentModalOpen, setCommentModalOpen] = useState(false);
  const [selectedComment, setSelectedComment] = useState("");

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

  // Use dateToExercise data structure for the selected date
  useEffect(() => {
    if (!dateToExercise || !dateToExercise[selectedDate]) {
      setRows([]);
      return;
    }

    try {
      const dayData = dateToExercise[selectedDate];
      const exerciseOrdering = dayData.exerciseOrdering;
      const exerciseDetails = dayData.exerciseDetails;

      // Convert to the expected format for the component
      const sortedData = exerciseOrdering.map((exerciseId) => ({
        exerciseId,
        items: exerciseDetails[exerciseId].map((set, index) => ({
          date: selectedDate,
          exercise_id: exerciseId,
          reps: set.reps,
          metric_weight: set.weight,
          comment: set.comment,
          id: index, // Using index as id since we don't have the original _id
        })),
      }));

      setRows(sortedData);
    } catch (err) {
      console.error("Error processing dateToExercise data:", err);
      setRows([]);
    }
  }, [selectedDate, dateToExercise]);

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

  const handleCommentClick = (comment) => {
    setSelectedComment(comment || "");
    setCommentModalOpen(true);
  };

  const handleCloseCommentModal = () => {
    setCommentModalOpen(false);
    setSelectedComment("");
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
                            width: { xs: "25%", md: "12.5%" },
                            px: { xs: 1, md: 2 },
                          }}
                        >
                          {t.set}
                        </TableCell>
                        <TableCell
                          sx={{
                            color: "text.primary",
                            fontWeight: "bold",
                            textAlign: "center",
                            width: { xs: "25%", md: "12.5%" },
                            px: { xs: 1, md: 2 },
                          }}
                        >
                          {t.weight}
                        </TableCell>
                        <TableCell
                          sx={{
                            color: "text.primary",
                            fontWeight: "bold",
                            textAlign: "center",
                            width: { xs: "25%", md: "12.5%" },
                            px: { xs: 1, md: 2 },
                          }}
                        >
                          {t.reps}
                        </TableCell>
                        <TableCell
                          sx={{
                            color: "text.primary",
                            fontWeight: "bold",
                            textAlign: "center",
                            width: { xs: "15%", md: "12.5%" },
                            display: { xs: "table-cell", md: "none" },
                            px: { xs: 1, md: 2 },
                          }}
                        >
                          {t.comment}
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
                              px: { xs: 1, md: 2 },
                            }}
                          >
                            {itemIndex + 1}
                          </TableCell>
                          <TableCell
                            sx={{
                              textAlign: "center",
                              color: "text.primary",
                              px: { xs: 1, md: 2 },
                            }}
                          >
                            {formatWeight(item.metric_weight)} kg
                          </TableCell>
                          <TableCell
                            sx={{
                              textAlign: "center",
                              color: "text.primary",
                              px: { xs: 1, md: 2 },
                            }}
                          >
                            {item.reps}
                          </TableCell>
                          <TableCell
                            sx={{
                              textAlign: "center",
                              display: { xs: "table-cell", md: "none" },
                              px: { xs: 1, md: 2 },
                            }}
                          >
                            {item.comment && (
                              <IconButton
                                size="small"
                                sx={{
                                  color: "primary.main",
                                  p: 0.5,
                                  "&:hover": {
                                    color: "primary.dark",
                                    bgcolor: "action.hover",
                                  },
                                }}
                                onClick={() => handleCommentClick(item.comment)}
                              >
                                <ChatBubbleOutline fontSize="small" />
                              </IconButton>
                            )}
                          </TableCell>
                          <TableCell
                            sx={{
                              textAlign: "left",
                              color: "text.primary",
                              wordBreak: "break-word",
                              display: { xs: "none", md: "table-cell" },
                              px: { xs: 1, md: 2 },
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
          onDateSelect={onDateSelect}
          language={language}
          i18nMap={i18nMap}
          exerciseToDate={exerciseToDate}
        />
      )}

      {/* Comment Modal */}
      <CommentModal
        open={commentModalOpen}
        onClose={handleCloseCommentModal}
        comment={selectedComment}
      />
    </Container>
  );
}
