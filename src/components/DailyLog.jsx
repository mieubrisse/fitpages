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
  Modal,
  Autocomplete,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  IconButton as MuiIconButton,
  Snackbar,
  Alert,
} from "@mui/material";
import {
  ChevronLeft,
  ChevronRight,
  CalendarToday,
  ChatBubbleOutline,
  Add,
  Delete,
} from "@mui/icons-material";
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
  // Programming modal state
  const [programmingModalOpen, setProgrammingModalOpen] = useState(false);
  const [programmingSearchValue, setProgrammingSearchValue] = useState("");
  const [programmingSearchSelected, setProgrammingSearchSelected] = useState(null);

  // Programming state
  const PROGRAMMING_KEY = "fitpages_dateToProgramming";
  const [dateToProgramming, setDateToProgramming] = useState(() => {
    try {
      const stored = localStorage.getItem(PROGRAMMING_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });
  // Error state for localStorage sync
  const [programmingStorageError, setProgrammingStorageError] = useState(null);

  // Sync to localStorage when dateToProgramming changes
  useEffect(() => {
    try {
      localStorage.setItem(PROGRAMMING_KEY, JSON.stringify(dateToProgramming));
    } catch {
      setProgrammingStorageError(
        language && language.toLowerCase() === "pt"
          ? "Erro ao salvar o plano de treino no armazenamento local."
          : "Failed to save training programming to local storage."
      );
    }
  }, [dateToProgramming]);

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

  // Derive exerciseIds from i18nMap or exerciseToDate
  const exerciseIds = i18nMap
    ? Object.keys(i18nMap)
    : exerciseToDate
    ? Object.keys(exerciseToDate)
    : [];

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

  // Programming for selectedDate
  const programmingForDay = dateToProgramming[selectedDate] || null;

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

  // Programming modal handlers
  const handleOpenProgrammingModal = () => {
    setProgrammingModalOpen(true);
    setProgrammingSearchValue("");
    setProgrammingSearchSelected(null);
  };
  const handleCloseProgrammingModal = () => {
    setProgrammingModalOpen(false);
    setProgrammingSearchValue("");
    setProgrammingSearchSelected(null);
  };
  const handleProgrammingSearchSelect = (event, value) => {
    setProgrammingSearchSelected(value);
    if (value) {
      // Prevent duplicate for this day
      setDateToProgramming((prev) => {
        const prevDay = prev[selectedDate] || { exerciseOrdering: [], exerciseDetails: {} };
        if (prevDay.exerciseOrdering.includes(value)) {
          // Already exists, do nothing
          return prev;
        }
        // Add new exercise to programming for the day
        const newOrdering = [...prevDay.exerciseOrdering, value];
        const newDetails = { ...prevDay.exerciseDetails, [value]: [] };
        return {
          ...prev,
          [selectedDate]: {
            exerciseOrdering: newOrdering,
            exerciseDetails: newDetails,
          },
        };
      });
      handleCloseProgrammingModal();
    }
  };

  // State for delete confirmation dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [exerciseToDelete, setExerciseToDelete] = useState(null);

  const handleOpenDeleteDialog = (exerciseId) => {
    setExerciseToDelete(exerciseId);
    setDeleteDialogOpen(true);
  };
  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setExerciseToDelete(null);
  };
  const handleConfirmDelete = () => {
    if (!exerciseToDelete) return;
    setDateToProgramming((prev) => {
      const prevDay = prev[selectedDate];
      if (!prevDay) return prev;
      const newOrdering = prevDay.exerciseOrdering.filter((id) => id !== exerciseToDelete);
      const { [exerciseToDelete]: _, ...newDetails } = prevDay.exerciseDetails;
      const newDay = { exerciseOrdering: newOrdering, exerciseDetails: newDetails };
      const newProgramming = { ...prev, [selectedDate]: newDay };
      // If no more programming for the day, remove the day key
      if (newDay.exerciseOrdering.length === 0) {
        delete newProgramming[selectedDate];
      }
      return newProgramming;
    });
    handleCloseDeleteDialog();
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

  // Helper: is selectedDate today or in the future?
  function isTodayOrFuture(dateStr) {
    const today = new Date();
    const date = parseDateLocal(dateStr);
    today.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);
    return date >= today;
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
            position: "relative", // For floating button positioning
          }}
        >
          {rows.length > 0
            ? rows.map(({ exerciseId, items }) => (
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
            : (!programmingForDay ||
                !programmingForDay.exerciseOrdering ||
                programmingForDay.exerciseOrdering.length === 0) && (
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
              )}
          {/* Show plus button only if today/future and no actual data and not already programming for all exercises */}
          {isTodayOrFuture(selectedDate) && rows.length === 0 && (
            <Box
              sx={{
                position: "absolute",
                bottom: 24,
                right: 24,
                zIndex: 10,
              }}
            >
              <IconButton
                color="primary"
                size="large"
                sx={{
                  bgcolor: "primary.light",
                  color: (theme) => theme.palette.primary.contrastText,
                  boxShadow: 3,
                  "&:hover": { bgcolor: "primary.main", color: "#fff" },
                  width: 64,
                  height: 64,
                  borderRadius: "50%",
                }}
                aria-label="Add programming"
                onClick={handleOpenProgrammingModal}
              >
                <Add sx={{ fontSize: 36 }} />
              </IconButton>
            </Box>
          )}
          {/* Programming Cards (if no actual data) */}
          {isTodayOrFuture(selectedDate) &&
            rows.length === 0 &&
            programmingForDay &&
            programmingForDay.exerciseOrdering.length > 0 &&
            programmingForDay.exerciseOrdering.map((exerciseId) => (
              <Paper
                key={exerciseId}
                elevation={4}
                sx={{
                  mb: { xs: 2, md: 4 },
                  borderRadius: 3,
                  p: 2,
                  bgcolor: "primary.main",
                  color: "#fff",
                  position: "relative",
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    mb: 2,
                    fontWeight: "bold",
                    color: "#fff",
                    cursor: "pointer",
                    "&:hover": {
                      color: "primary.light",
                      textDecoration: "underline",
                    },
                  }}
                  onClick={() => handleExerciseClick(exerciseId)}
                >
                  {getDisplayName(exerciseId)}
                </Typography>
                <MuiIconButton
                  size="small"
                  sx={{
                    position: "absolute",
                    top: 8,
                    right: 8,
                    color: "#fff",
                    bgcolor: "error.main",
                    "&:hover": { bgcolor: "error.dark" },
                  }}
                  aria-label={
                    language && language.toLowerCase() === "pt"
                      ? "Remover exercício"
                      : "Remove exercise"
                  }
                  onClick={() => handleOpenDeleteDialog(exerciseId)}
                >
                  <Delete fontSize="small" />
                </MuiIconButton>
              </Paper>
            ))}
          {/* Programming Modal */}
          <Modal
            open={programmingModalOpen}
            onClose={handleCloseProgrammingModal}
            aria-labelledby="add-programming-modal-title"
            aria-describedby="add-programming-modal-desc"
          >
            <Box
              sx={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: { xs: 320, sm: 400, md: 500 },
                bgcolor: "background.paper",
                borderRadius: 3,
                boxShadow: 24,
                p: 4,
                outline: "none",
              }}
            >
              <Autocomplete
                freeSolo
                options={exerciseIds}
                value={programmingSearchSelected}
                inputValue={programmingSearchValue}
                onInputChange={(_, newInputValue) => setProgrammingSearchValue(newInputValue)}
                onChange={handleProgrammingSearchSelect}
                sx={{ width: "100%" }}
                getOptionLabel={(option) => getDisplayName(option)}
                renderOption={(props, option) => <li {...props}>{getDisplayName(option)}</li>}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label={
                      language && language.toLowerCase() === "pt"
                        ? "Buscar exercícios"
                        : "Search exercises"
                    }
                    variant="outlined"
                    size="small"
                    autoFocus
                  />
                )}
              />
            </Box>
          </Modal>
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

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        aria-labelledby="delete-programming-dialog-title"
        aria-describedby="delete-programming-dialog-desc"
      >
        <DialogTitle id="delete-programming-dialog-title">
          {language && language.toLowerCase() === "pt"
            ? "Remover exercício do plano?"
            : "Remove Exercise from Programming?"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-programming-dialog-desc">
            {language && language.toLowerCase() === "pt"
              ? `Tem certeza de que deseja remover ${
                  exerciseToDelete ? getDisplayName(exerciseToDelete) : "este exercício"
                }?`
              : `Are you sure you want to delete ${
                  exerciseToDelete ? getDisplayName(exerciseToDelete) : "this exercise"
                }?`}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} color="inherit">
            {language && language.toLowerCase() === "pt" ? "Cancelar" : "Cancel"}
          </Button>
          <Button onClick={handleConfirmDelete} color="error" autoFocus>
            {language && language.toLowerCase() === "pt" ? "Remover" : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for localStorage errors */}
      <Snackbar
        open={!!programmingStorageError}
        autoHideDuration={6000}
        onClose={() => setProgrammingStorageError(null)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => setProgrammingStorageError(null)}
          severity="error"
          sx={{ width: "100%" }}
        >
          {programmingStorageError}
        </Alert>
      </Snackbar>
    </Container>
  );
}
