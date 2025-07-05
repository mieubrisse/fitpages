import { Box, Modal, IconButton } from "@mui/material";
import { Close } from "@mui/icons-material";
import WorkoutCalendar from "./WorkoutCalendar";

export default function MobileCalendarModal({
  open,
  onClose,
  selectedDate,
  onDateSelect,
  calendarMonth,
  onMonthChange,
  workoutDays = [],
  language = "EN",
  dateToExercise,
}) {
  const handleDateSelect = (date) => {
    onDateSelect(date);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="mobile-calendar-modal"
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 2,
      }}
    >
      <Box
        sx={{
          bgcolor: "background.paper",
          borderRadius: 3,
          boxShadow: 24,
          p: 3,
          maxWidth: "90vw",
          maxHeight: "90vh",
          width: "100%",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Close button */}
        <IconButton
          onClick={onClose}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
            zIndex: 1,
            bgcolor: "background.paper",
            boxShadow: 2,
            "&:hover": {
              bgcolor: "action.hover",
            },
          }}
        >
          <Close />
        </IconButton>

        {/* Calendar */}
        <Box sx={{ mt: 1 }}>
          <WorkoutCalendar
            selectedDate={selectedDate}
            onDateSelect={handleDateSelect}
            calendarMonth={calendarMonth}
            onMonthChange={onMonthChange}
            workoutDays={workoutDays}
            language={language}
            showHoverPreview={false}
          />
        </Box>
      </Box>
    </Modal>
  );
}
