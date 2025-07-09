import {
  Paper,
  Typography,
  Box,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
} from "@mui/material";
import { ChatBubbleOutline } from "@mui/icons-material";

export default function TrainingCard({
  exerciseId,
  getDisplayName,
  onExerciseClick,
  items = [],
  t = {},
  onCommentClick,
  sx = {},
  children,
}) {
  // Format weight to display cleanly (max 2 decimal places, remove trailing zeros)
  function formatWeight(weight) {
    if (weight === null || weight === undefined) return "0";
    const rounded = Math.round(weight * 100) / 100;
    return rounded % 1 === 0 ? rounded.toString() : rounded.toString();
  }

  return (
    <Paper
      elevation={4}
      sx={{ mb: { xs: 2, md: 4 }, borderRadius: 3, p: 2, bgcolor: "background.paper", ...sx }}
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
        onClick={() => onExerciseClick(exerciseId)}
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
                      onClick={() => onCommentClick && onCommentClick(item.comment)}
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
      {children}
    </Paper>
  );
}
