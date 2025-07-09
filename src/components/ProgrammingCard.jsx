import { Paper, Typography, IconButton as MuiIconButton } from "@mui/material";
import { Delete } from "@mui/icons-material";

export default function ProgrammingCard({
  exerciseId,
  getDisplayName,
  onExerciseClick,
  onDelete,
  language = "EN",
  sx = {},
  children,
}) {
  return (
    <Paper
      elevation={4}
      sx={{
        mb: { xs: 2, md: 4 },
        borderRadius: 3,
        p: 2,
        bgcolor: "primary.main",
        color: "#fff",
        position: "relative",
        ...sx,
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
      {children}
    </Paper>
  );
}
