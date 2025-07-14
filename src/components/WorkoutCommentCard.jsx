import { Paper, Typography, Box } from "@mui/material";

export default function WorkoutCommentCard({ comment = "", language = "EN", sx = {} }) {
  if (!comment) return null;
  const header =
    language && language.toLowerCase() === "pt" ? "Comentário do Treino" : "Workout Comment";
  return (
    <Paper
      elevation={4}
      sx={{
        mb: { xs: 2, md: 4 },
        borderRadius: 3,
        p: 2,
        bgcolor: "background.paper",
        ...sx,
      }}
    >
      <Typography
        variant="h6"
        sx={{
          mb: 2,
          fontWeight: "bold",
          color: "text.primary",
        }}
      >
        {header}
      </Typography>
      <Typography variant="body1" sx={{ color: "text.primary", whiteSpace: "pre-line" }}>
        {comment}
      </Typography>
    </Paper>
  );
}
