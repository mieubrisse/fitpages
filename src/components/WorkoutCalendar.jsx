import { Box } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { StaticDatePicker } from "@mui/x-date-pickers/StaticDatePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { format, parseISO } from "date-fns";
import { PickersDay } from "@mui/x-date-pickers/PickersDay";
import { enUS, pt } from "date-fns/locale";

function CustomDay({ workoutDays, programmingDays, selectedDate, ...props }) {
  const dateStr = format(props.day, "yyyy-MM-dd");
  const hasWorkout = workoutDays.includes(dateStr);
  const hasProgramming = programmingDays && programmingDays.includes(dateStr);
  const isSelected = dateStr === selectedDate;

  return (
    <PickersDay
      {...props}
      sx={{
        // Training data takes highest priority
        ...(hasWorkout && {
          backgroundColor: (theme) => theme.palette.action.selected,
          color: (theme) => theme.palette.text.primary,
          "&:hover": {
            backgroundColor: (theme) => theme.palette.action.hover,
          },
        }),
        // Programming scheduled days (blue circle)
        ...(hasProgramming &&
          !hasWorkout && {
            backgroundColor: (theme) => theme.palette.primary.main,
            color: (theme) => theme.palette.primary.contrastText,
            fontWeight: "bold",
            borderRadius: "50%",
            boxShadow: 3,
            "&:hover": {
              backgroundColor: (theme) => theme.palette.primary.dark,
              color: (theme) => theme.palette.primary.contrastText,
            },
          }),
        // Force programming days to be blue with !important
        ...(hasProgramming &&
          !hasWorkout && {
            "&.Mui-selected": {
              backgroundColor: (theme) => theme.palette.primary.main + " !important",
              color: (theme) => theme.palette.primary.contrastText + " !important",
            },
          }),
        // Selected day (white circle) - only if not training data or programming
        ...(isSelected &&
          !hasWorkout &&
          !hasProgramming && {
            backgroundColor: "#fff",
            color: (theme) => theme.palette.text.primary,
            fontWeight: "bold",
            borderRadius: "50%",
            boxShadow: 3,
            "&:hover": {
              backgroundColor: (theme) => theme.palette.action.hover,
            },
          }),
        // Ensure today border shows
        "&.MuiPickersDay-today": {
          borderColor: "primary.main",
        },
        // Override Material-UI selected styling with !important - but only for non-programming days
        ...(isSelected &&
          !hasProgramming && {
            "&.Mui-selected": {
              backgroundColor: "#fff !important",
              color: "text.primary !important",
            },
          }),
      }}
    />
  );
}

export default function WorkoutCalendar({
  selectedDate,
  onDateSelect,
  calendarMonth,
  onMonthChange,
  workoutDays = [],
  programmingDays = [],
  language = "EN",
  showHoverPreview = false,
  onDayHover,
}) {
  // Select locale for date-fns
  const locale = language && language.toLowerCase() === "pt" ? pt : enUS;

  return (
    <Box sx={{ minHeight: 0 }}>
      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={locale}>
        <StaticDatePicker
          calendarMonth={calendarMonth}
          value={parseISO(selectedDate)}
          onChange={onDateSelect}
          onMonthChange={onMonthChange}
          showDaysOutsideCurrentMonth={true}
          shouldDisableDate={(date) => {
            const today = new Date();
            today.setHours(23, 59, 59, 999); // End of today
            return date > today;
          }}
          reduceAnimations={true}
          slots={{
            toolbar: () => null,
            day: (props) => (
              <CustomDay
                {...props}
                workoutDays={workoutDays}
                programmingDays={programmingDays}
                selectedDate={selectedDate}
                onMouseEnter={
                  showHoverPreview ? () => onDayHover?.(format(props.day, "yyyy-MM-dd")) : undefined
                }
                onMouseLeave={showHoverPreview ? () => onDayHover?.(null) : undefined}
              />
            ),
            actionBar: () => null,
          }}
          sx={{
            backgroundColor: "background.paper",
            color: "text.primary",
            "& .MuiPickersDay-root": {
              color: "text.primary",
              "&.MuiPickersDay-today": {
                borderColor: "primary.main",
              },
            },
            "& .MuiPickersCalendarHeader-root": {
              color: "text.primary",
            },
            "& .MuiPickersDay-root.MuiPickersDay-dayOutsideMonth": {
              opacity: 0.3,
              color: "text.secondary",
            },
          }}
        />
      </LocalizationProvider>
    </Box>
  );
}
