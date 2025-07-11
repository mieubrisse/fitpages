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
  // Local translation map
  const t = {
    set: language && language.toLowerCase() === "pt" ? "Série" : "Set",
    weight: language && language.toLowerCase() === "pt" ? "Peso" : "Weight",
    reps: language && language.toLowerCase() === "pt" ? "Reps" : "Reps",
    comment: language && language.toLowerCase() === "pt" ? "Comentário" : "Comment",
  };

  // Handle adding a new row
  const handleAddRow = () => {
    const newRow = {
      metric_weight: 0,
      reps: 0,
      comment: "",
    };

    // Add the new row to the programming data
    const updatedItems = [...items, newRow];
    onUpdateProgramming(exerciseId, updatedItems);
  };

  // Handle updating a field value
  const handleFieldUpdate = (rowIndex, field, value) => {
    const updatedItems = [...items];
    updatedItems[rowIndex] = { ...updatedItems[rowIndex], [field]: value };
    onUpdateProgramming(exerciseId, updatedItems);
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
              <TableCell />
            </TableRow>
          </TableHead>
          <TableBody>
            {items &&
              items.length > 0 &&
              items.map((item, itemIndex) => (
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
                    <TextField
                      size="small"
                      value={item.metric_weight || ""}
                      onChange={(e) =>
                        handleFieldUpdate(itemIndex, "metric_weight", e.target.value)
                      }
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
                    <MuiIconButton
                      size="small"
                      color="error"
                      onClick={() => {
                        const updatedItems = items.filter((_, idx) => idx !== itemIndex);
                        onUpdateProgramming(exerciseId, updatedItems);
                      }}
                      aria-label="Remove row"
                    >
                      <Delete fontSize="small" />
                    </MuiIconButton>
                  </TableCell>
                </TableRow>
              ))}
            {/* Plus button row */}
            <TableRow>
              <TableCell
                sx={{
                  textAlign: "center",
                  color: "text.primary",
                  fontWeight: "bold",
                  px: { xs: 1, md: 2 },
                }}
              >
                {items.length + 1}
              </TableCell>
              <TableCell
                sx={{
                  textAlign: "center",
                  px: { xs: 1, md: 2 },
                }}
              >
                <MuiIconButton
                  size="small"
                  onClick={handleAddRow}
                  sx={{
                    color: "text.primary",
                    bgcolor: "action.hover",
                    "&:hover": {
                      bgcolor: "primary.light",
                      color: "primary.contrastText",
                    },
                  }}
                >
                  <Add fontSize="small" />
                </MuiIconButton>
              </TableCell>
              <TableCell
                sx={{
                  textAlign: "center",
                  px: { xs: 1, md: 2 },
                }}
              />
              <TableCell
                sx={{
                  textAlign: "center",
                  display: { xs: "table-cell", md: "none" },
                  px: { xs: 1, md: 2 },
                }}
              />
              <TableCell
                sx={{
                  textAlign: "left",
                  display: { xs: "none", md: "table-cell" },
                  px: { xs: 1, md: 2 },
                }}
              />
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
      {children}
    </Paper>
  );
}
