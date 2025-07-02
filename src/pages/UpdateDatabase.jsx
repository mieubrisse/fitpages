import { useState } from "react";
import { Box, Button, Paper, Typography, Stack, Input } from "@mui/material";

export default function UpdateDatabase() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setSuccess(false);
    setError("");
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setSuccess(false);
    setError("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload-fitnotes", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Upload failed");
      setSuccess(true);
    } catch (err) {
      setError(err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        bgcolor: "background.default",
      }}
    >
      <Paper elevation={8} sx={{ p: 4, borderRadius: 4, minWidth: 350, maxWidth: 500 }}>
        <Stack spacing={3} alignItems="center">
          <Typography variant="h5" fontWeight="bold">
            Update FitNotes Database
          </Typography>
          <Input
            type="file"
            inputProps={{ accept: ".fitnotes" }}
            onChange={handleFileChange}
            disabled={uploading}
          />
          <Button
            variant="contained"
            color="primary"
            disabled={!file || uploading}
            onClick={handleUpload}
            sx={{ minWidth: 120 }}
          >
            {uploading ? "Uploading..." : "Update"}
          </Button>
          {success && <Typography color="success.main">Upload successful!</Typography>}
          {error && <Typography color="error.main">{error}</Typography>}
        </Stack>
      </Paper>
    </Box>
  );
}
