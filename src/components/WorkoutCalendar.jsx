import { Box } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { StaticDatePicker } from "@mui/x-date-pickers/StaticDatePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { format, parseISO } from "date-fns";
import { PickersDay } from "@mui/x-date-pickers/PickersDay";
import { enUS, pt } from "date-fns/locale";

function CustomDay({ workoutDays, selectedDate, ...props }) {
  const dateStr = format(props.day, "yyyy-MM-dd");
  const hasWorkout = workoutDays.includes(dateStr);
  const isSelected = dateStr === selectedDate;
  return (
    <PickersDay
      {...props}
      sx={{
        ...(hasWorkout && {
          backgroundColor: (theme) => theme.palette.action.selected,
          color: (theme) => theme.palette.text.primary,
          "&:hover": {
            backgroundColor: (theme) => theme.palette.action.hover,
          },
        }),
        ...(isSelected && {
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
              "&.Mui-selected": {
                backgroundColor: "primary.main",
                color: "primary.contrastText",
              },
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
