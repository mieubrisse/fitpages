import {
  Paper,
  Typography,
  IconButton as MuiIconButton,
  Box,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TextField,
} from "@mui/material";
import { Delete, Add } from "@mui/icons-material";
import InputAdornment from "@mui/material/InputAdornment";
import { ChatBubbleOutline } from "@mui/icons-material";
import { useMemo } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { restrictToVerticalAxis, restrictToParentElement } from "@dnd-kit/modifiers";

export default function ProgrammingCard({
  exerciseId,
  getDisplayName,
  onExerciseClick,
  onDelete,
  items = [],
  onCommentClick,
  language = "EN",
  sx = {},
  children,
  onUpdateProgramming,
}) {
  // Helper: is a set empty?
  const isEmptySet = (set) => {
    return (
      (!set.metric_weight || set.metric_weight === "" || set.metric_weight === 0) &&
      (!set.reps || set.reps === "" || set.reps === 0) &&
      (!set.comment || set.comment === "")
    );
  };

  // Track real sets and always append a ghost set
  const realSets = useMemo(() => {
    // Any set the user has ever entered data into is a real set (unless deleted)
    // Only the last empty set is the ghost set
    // Remove trailing empty sets except one
    let trimmed = [...items];
    // Remove trailing empty sets
    while (trimmed.length > 0 && isEmptySet(trimmed[trimmed.length - 1])) {
      trimmed.pop();
    }
    // Always show at least one empty set (ghost set)
    return trimmed.length === 0
      ? [{ metric_weight: "", reps: "", comment: "" }]
      : [...trimmed, { metric_weight: "", reps: "", comment: "" }];
  }, [items]);

  // Handle updating a field value
  const handleFieldUpdate = (rowIndex, field, value) => {
    let updatedItems = [...items];
    // If editing the ghost set (last row), add a new real set
    const editingGhost = rowIndex === realSets.length - 1;
    if (editingGhost) {
      // Add the ghost set as a real set, then append a new ghost set
      updatedItems = [...items, { metric_weight: "", reps: "", comment: "" }];
    }
    // Update the value
    updatedItems[rowIndex] = { ...updatedItems[rowIndex], [field]: value };
    // Only pass real sets (exclude the last ghost set if empty)
    let toSave = [...updatedItems];
    // Remove trailing empty sets
    while (toSave.length > 0 && isEmptySet(toSave[toSave.length - 1])) {
      toSave.pop();
    }
    onUpdateProgramming(exerciseId, toSave);
  };

  // Handle deleting a set
  const handleDeleteRow = (rowIndex) => {
    const updatedItems = items.filter((_, idx) => idx !== rowIndex);
    // Only pass real sets (exclude trailing ghost set)
    let toSave = [...updatedItems];
    while (toSave.length > 0 && isEmptySet(toSave[toSave.length - 1])) {
      toSave.pop();
    }
    onUpdateProgramming(exerciseId, toSave);
  };

  // Handle drag end
  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      // Get the real sets (excluding ghost set)
      const realSetsOnly = realSets.filter((_, index) => index !== realSets.length - 1);
      const oldIndex = parseInt(active.id.split("-")[1]);
      const newIndex = parseInt(over.id.split("-")[1]);

      if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
        const newOrder = arrayMove(realSetsOnly, oldIndex, newIndex);
        onUpdateProgramming(exerciseId, newOrder);
      }
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Sortable row component
  const SortableTableRow = ({ item, itemIndex, isGhost }) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
      id: isGhost ? `ghost-${itemIndex}` : `set-${itemIndex}`,
      disabled: isGhost,
    });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.5 : 1,
    };

    return (
      <TableRow ref={setNodeRef} style={style}>
        <TableCell
          sx={{
            textAlign: "center",
            color: "text.primary",
            fontWeight: "bold",
            px: { xs: 1, md: 2 },
            opacity: isGhost ? 0.4 : 1,
            cursor: isGhost ? "default" : "grab",
            "&:active": {
              cursor: isGhost ? "default" : "grabbing",
            },
          }}
          {...(!isGhost ? { ...attributes, ...listeners } : {})}
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
          <TextField
            size="small"
            value={item.metric_weight || ""}
            onChange={(e) => handleFieldUpdate(itemIndex, "metric_weight", e.target.value)}
            placeholder="kg"
            sx={{
              width: "100%",
              "& .MuiInputBase-input": {
                textAlign: "center",
              },
            }}
            slotProps={{
              input: {
                style: { textAlign: "center", height: 32, fontSize: "1rem" },
                inputMode: "decimal",
                step: "any",
                min: 0,
                pattern: "[0-9]*",
              },
            }}
          />
        </TableCell>
        <TableCell
          sx={{
            textAlign: "center",
            color: "text.primary",
            px: { xs: 1, md: 2 },
          }}
        >
          <TextField
            size="small"
            value={item.reps || ""}
            onChange={(e) => handleFieldUpdate(itemIndex, "reps", e.target.value)}
            sx={{
              width: "100%",
              "& .MuiInputBase-root": {
                color: "text.primary",
                bgcolor: "action.hover",
                height: 32,
                minHeight: 0,
                fontSize: "1rem",
                boxSizing: "border-box",
                padding: 0,
              },
              "& .MuiInputBase-input": {
                textAlign: "center",
                height: 32,
                minHeight: 0,
                padding: 0,
                fontSize: "1rem",
              },
            }}
            slotProps={{
              input: {
                style: { textAlign: "center", height: 32, padding: 0, fontSize: "1rem" },
                inputMode: "numeric",
                step: 1,
                min: 0,
                pattern: "[0-9]*",
              },
            }}
          />
        </TableCell>
        <TableCell
          sx={{
            textAlign: "center",
            display: { xs: "table-cell", md: "none" },
            px: { xs: 1, md: 2 },
          }}
        >
          {item.comment && (
            <MuiIconButton
              size="small"
              sx={{
                color: "#fff",
                p: 0.5,
                "&:hover": {
                  color: "primary.light",
                  bgcolor: "action.hover",
                },
              }}
              onClick={() => onCommentClick && onCommentClick(item.comment)}
            >
              <ChatBubbleOutline fontSize="small" />
            </MuiIconButton>
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
          <TextField
            size="small"
            value={item.comment ?? ""}
            onChange={(e) => handleFieldUpdate(itemIndex, "comment", e.target.value)}
            sx={{
              width: "100%",
              "& .MuiInputBase-root": {
                color: "text.primary",
                bgcolor: "action.hover",
                height: 32,
                minHeight: 0,
                fontSize: "1rem",
                boxSizing: "border-box",
              },
              "& .MuiInputBase-input": {
                height: 32,
                minHeight: 0,
                fontSize: "1rem",
              },
            }}
            slotProps={{
              input: {
                style: { height: 32, fontSize: "1rem" },
              },
            }}
          />
        </TableCell>
        <TableCell sx={{ textAlign: "center", width: 40 }}>
          {!isGhost && (
            <MuiIconButton
              size="small"
              sx={{
                position: "relative",
                color: "#222",
                bgcolor: "#fff",
                transition: "background 0.2s, color 0.2s",
                "&:hover": {
                  bgcolor: "error.main",
                  color: "#fff",
                },
              }}
              onClick={() => handleDeleteRow(itemIndex)}
              aria-label="Remove row"
            >
              <Delete fontSize="small" />
            </MuiIconButton>
          )}
        </TableCell>
      </TableRow>
    );
  };

  return (
    <Paper
      elevation={4}
      sx={{
        mb: { xs: 2, md: 4 },
        borderRadius: 3,
        p: 2,
        bgcolor: "primary.main",
        color: "text.primary",
        position: "relative",
        overflow: "hidden", // Prevent expansion during drag
        ...sx,
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
            color: "primary.light",
            textDecoration: "underline",
          },
        }}
        onClick={() => onExerciseClick(exerciseId)}
      >
        {getDisplayName(exerciseId)}
      </Typography>
      <MuiIconButton
        size="small"
        sx={{
          position: "absolute",
          top: 8,
          right: 8,
          color: "#222",
          bgcolor: "#fff",
          transition: "background 0.2s, color 0.2s",
          "&:hover": {
            bgcolor: "error.main",
            color: "#fff",
          },
        }}
        aria-label={
          language && language.toLowerCase() === "pt" ? "Remover exercício" : "Remove exercise"
        }
        onClick={() => onDelete(exerciseId)}
      >
        <Delete fontSize="small" />
      </MuiIconButton>
      <TableContainer component={Box} sx={{ mb: 2, borderRadius: 2, overflow: "hidden" }}>
        <Table sx={{ minWidth: 650, tableLayout: "fixed" }} aria-label="programming table">
          <TableHead>
            <TableRow>
              <TableCell
                sx={{
                  textAlign: "center",
                  color: "text.primary",
                  fontWeight: "bold",
                  px: { xs: 1, md: 2 },
                  width: "60px",
                }}
              >
                #
              </TableCell>
              <TableCell
                sx={{
                  textAlign: "center",
                  color: "text.primary",
                  fontWeight: "bold",
                  px: { xs: 1, md: 2 },
                }}
              >
                {language === "PT" ? "Peso" : "Weight"}
              </TableCell>
              <TableCell
                sx={{
                  textAlign: "center",
                  color: "text.primary",
                  fontWeight: "bold",
                  px: { xs: 1, md: 2 },
                }}
              >
                {language === "PT" ? "Reps" : "Reps"}
              </TableCell>
              <TableCell
                sx={{
                  textAlign: "center",
                  color: "text.primary",
                  fontWeight: "bold",
                  px: { xs: 1, md: 2 },
                }}
              >
                {language === "PT" ? "Comentário" : "Comment"}
              </TableCell>
              <TableCell
                sx={{
                  textAlign: "center",
                  color: "text.primary",
                  fontWeight: "bold",
                  px: { xs: 1, md: 2 },
                  width: "60px",
                }}
              >
                {language === "PT" ? "Ação" : "Action"}
              </TableCell>
            </TableRow>
          </TableHead>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
            modifiers={[restrictToVerticalAxis, restrictToParentElement]}
          >
            <TableBody
              sx={{
                // Prevent scrolling during drag operations
                "& [data-dragging='true']": {
                  overflow: "hidden !important",
                },
                // Ensure the table body doesn't expand during drag
                "& .MuiTableRow-root": {
                  "&[data-dragging='true']": {
                    position: "relative",
                    zIndex: 1000,
                  },
                },
              }}
            >
              <SortableContext
                items={realSets.map((_, index) =>
                  index === realSets.length - 1 ? `ghost-${index}` : `set-${index}`
                )}
                strategy={verticalListSortingStrategy}
              >
                {realSets.map((item, itemIndex) => {
                  const isGhost = itemIndex === realSets.length - 1 && isEmptySet(item);
                  return (
                    <SortableTableRow
                      key={itemIndex}
                      item={item}
                      itemIndex={itemIndex}
                      isGhost={isGhost}
                    />
                  );
                })}
              </SortableContext>
            </TableBody>
          </DndContext>
        </Table>
      </TableContainer>
      {children}
    </Paper>
  );
}
