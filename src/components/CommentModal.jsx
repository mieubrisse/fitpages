import { Dialog, DialogContent, DialogActions, Button, Typography } from "@mui/material";

export default function CommentModal({ open, onClose, comment = "" }) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          maxHeight: "80vh",
          minHeight: "auto",
        },
      }}
    >
      <DialogContent
        sx={{
          p: 3,
          minHeight: "auto",
          maxHeight: "60vh",
          overflow: "auto",
        }}
      >
        <Typography
          variant="body1"
          sx={{
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            lineHeight: 1.6,
          }}
        >
          {comment || ""}
        </Typography>
      </DialogContent>
      <DialogActions sx={{ p: 2, pt: 0 }}>
        <Button onClick={onClose} variant="contained" color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
