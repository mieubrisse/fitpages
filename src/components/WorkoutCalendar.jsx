import { Box } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { StaticDatePicker } from "@mui/x-date-pickers/StaticDatePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { format, parseISO } from "date-fns";
import { PickersDay } from "@mui/x-date-pickers/PickersDay";
import { enUS, pt } from "date-fns/locale";

function CustomDay({ hasWorkout, hasProgramming, isSelected, ...props }) {
  // Build styling dictionary based on priority
  let dayStyle = {};

  if (isSelected) {
    // Selected day takes highest priority
    dayStyle = {
      backgroundColor: "#fff",
      color: (theme) => theme.palette.text.primary,
      fontWeight: "bold",
      borderRadius: "50%",
      boxShadow: 3,
      "&:hover": {
        backgroundColor: (theme) => theme.palette.action.hover,
      },
      // Override Material-UI selected styling
      "&.Mui-selected": {
        backgroundColor: "#fff !important",
        color: "text.primary !important",
      },
    };
  } else if (hasWorkout) {
    // Training data takes second priority
    dayStyle = {
      backgroundColor: (theme) => theme.palette.action.selected,
      color: (theme) => theme.palette.text.primary,
      "&:hover": {
        backgroundColor: (theme) => theme.palette.action.hover,
      },
    };
  } else if (hasProgramming) {
    // Programming scheduled days (blue circle) - lowest priority
    dayStyle = {
      backgroundColor: (theme) => theme.palette.primary.main,
      color: (theme) => theme.palette.primary.contrastText,
      fontWeight: "bold",
      borderRadius: "50%",
      boxShadow: 3,
      "&:hover": {
        backgroundColor: (theme) => theme.palette.primary.dark,
        color: (theme) => theme.palette.primary.contrastText,
      },
    };
  }

  return (
    <PickersDay
      {...props}
      sx={{
        ...dayStyle,
        // Ensure today border shows
        "&.MuiPickersDay-today": {
          borderColor: "primary.main",
        },
      }}
    />
  );
}

export default function WorkoutCalendar({
  selectedDate,
  onDateSelect,
  calendarMonth,
  onMonthChange,
  dateToExercise = {},
  dateToProgramming = {},
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
                hasWorkout={
                  dateToExercise &&
                  dateToExercise[format(props.day, "yyyy-MM-dd")] &&
                  dateToExercise[format(props.day, "yyyy-MM-dd")].exerciseOrdering &&
                  dateToExercise[format(props.day, "yyyy-MM-dd")].exerciseOrdering.length > 0
                }
                hasProgramming={
                  dateToProgramming &&
                  dateToProgramming[format(props.day, "yyyy-MM-dd")] &&
                  dateToProgramming[format(props.day, "yyyy-MM-dd")].exerciseOrdering &&
                  dateToProgramming[format(props.day, "yyyy-MM-dd")].exerciseOrdering.length > 0
                }
                isSelected={format(props.day, "yyyy-MM-dd") === selectedDate}
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
