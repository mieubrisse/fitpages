// import { useState } from "react";
import DatabaseViewer from "./components/DatabaseViewer";
import WorkoutLogPage from "./pages/WorkoutLogPage";
import { Container, Box, Button, Paper, Stack } from "@mui/material";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";

const theme = createTheme({
  palette: {
    mode: "dark",
  },
});

function HomeScreen() {
  const navigate = useNavigate();
  return (
    <Container
      maxWidth={false}
      disableGutters
      sx={{
        bgcolor: "background.default",
        minHeight: "100vh",
        width: "100vw",
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Paper
        elevation={8}
        sx={{
          p: 4,
          borderRadius: 4,
          bgcolor: "background.paper",
          minWidth: 350,
          width: "100%",
          maxWidth: 500,
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: 300,
          }}
        >
          <Stack spacing={4} width="100%" alignItems="center">
            <Button
              variant="contained"
              color="primary"
              size="large"
              sx={{
                fontWeight: "bold",
                fontSize: "1.5rem",
                px: 6,
                py: 2,
                borderRadius: 2,
                boxShadow: 3,
              }}
              onClick={() => navigate("/explorer")}
            >
              Table Explorer
            </Button>
            <Button
              variant="contained"
              color="secondary"
              size="large"
              sx={{
                fontWeight: "bold",
                fontSize: "1.5rem",
                px: 6,
                py: 2,
                borderRadius: 2,
                boxShadow: 3,
              }}
              onClick={() => navigate("/log")}
            >
              Workout Log
            </Button>
          </Stack>
        </Box>
      </Paper>
    </Container>
  );
}

function ExplorerScreen() {
  const navigate = useNavigate();
  return (
    <Container
      maxWidth={false}
      disableGutters
      sx={{
        bgcolor: "background.default",
        minHeight: "100vh",
        width: "100vw",
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Paper
        elevation={8}
        sx={{
          p: 4,
          borderRadius: 4,
          bgcolor: "background.paper",
          minWidth: 350,
          width: "100%",
          maxWidth: 500,
        }}
      >
        <Box>
          <Button
            variant="contained"
            color="primary"
            sx={{ m: 2, borderRadius: 2 }}
            onClick={() => navigate("/")}
          >
            ← Back to Home
          </Button>
          <DatabaseViewer />
        </Box>
      </Paper>
    </Container>
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <Router>
        <Routes>
          <Route path="/" element={<HomeScreen />} />
          <Route path="/explorer" element={<ExplorerScreen />} />
          <Route path="/log" element={<WorkoutLogPage onBack={() => window.history.back()} />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
