import { useState } from "react";
import DatabaseViewer from "./components/DatabaseViewer";
import WorkoutLogPage from "./pages/WorkoutLogPage";
import { Container, Box, Button, Paper, Stack } from "@mui/material";
import { ThemeProvider, createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "dark",
  },
});

function App() {
  const [screen, setScreen] = useState("home");

  /*
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date();
    return d.toISOString().slice(0, 10);
  });

  const [viewMonth, setViewMonth] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d.toISOString().slice(0, 10);
  });
  const [workoutDays, setWorkoutDays] = useState([]);

  useEffect(() => {
    async function fetchWorkoutDays() {
      const SQL = await initSqlJs({ locateFile: (file) => `https://sql.js.org/dist/${file}` });
      const response = await fetch("/FitNotes_Backup.fitnotes");
      const arrayBuffer = await response.arrayBuffer();
      const db = new SQL.Database(new Uint8Array(arrayBuffer));
      const [start, end] = getMonthRange(viewMonth);
      const query = `SELECT DISTINCT date FROM training_log WHERE date >= ? AND date <= ? ORDER BY date`;
      const result = db.exec(query, [start, end]);
      console.log("SQL result for workout days:", result);
      if (result.length > 0) {
        setWorkoutDays(result[0].values.map((row) => row[0]));
      } else {
        setWorkoutDays([]);
      }
    }
    fetchWorkoutDays();
  }, [viewMonth]);

  // When the selected date changes, update the view month if needed
  useEffect(() => {
    const d = new Date(selectedDate);
    d.setDate(1);
    const monthStr = d.toISOString().slice(0, 10);
    // Only update viewMonth if selectedDate is outside the current viewMonth
    if (monthStr !== viewMonth) {
      setViewMonth(monthStr);
    }
  }, [selectedDate, viewMonth]);
  */

  return (
    <ThemeProvider theme={theme}>
      {screen === "home" || screen === "explorer" ? (
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
            {screen === "home" && (
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
                    onClick={() => setScreen("explorer")}
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
                    onClick={() => setScreen("workoutLogNew")}
                  >
                    Workout Log
                  </Button>
                </Stack>
              </Box>
            )}
            {screen === "explorer" && (
              <Box>
                <Button
                  variant="contained"
                  color="primary"
                  sx={{ m: 2, borderRadius: 2 }}
                  onClick={() => setScreen("home")}
                >
                  ← Back to Home
                </Button>
                <DatabaseViewer />
              </Box>
            )}
          </Paper>
        </Container>
      ) : null}
      {screen === "workoutLogNew" && <WorkoutLogPage onBack={() => setScreen("home")} />}
    </ThemeProvider>
  );
}

export default App;
