import { useMemo } from "react";

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(year, month) {
  return new Date(year, month, 1).getDay();
}

function isToday(date) {
  const today = new Date();
  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  );
}

function addMonths(date, n) {
  // Returns a new Date at the first of the month, n months from date
  const year = date.getFullYear();
  const month = date.getMonth();
  return new Date(year, month + n, 1);
}

export default function Calendar({
  selectedDate,
  onDateSelect,
  workoutDays = [],
  viewMonth,
  onMonthChange,
}) {
  // viewMonth is a string YYYY-MM-01
  const viewDate = useMemo(() => {
    const d = viewMonth ? new Date(viewMonth) : new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, [viewMonth]);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDayOfWeek = getFirstDayOfWeek(year, month);

  const days = [];
  for (let i = 0; i < firstDayOfWeek; i++) {
    days.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    days.push(new Date(year, month, d));
  }

  // Convert workoutDays to a Set for fast lookup
  const workoutDaySet = new Set(workoutDays);

  function handlePrevMonth() {
    const prev = addMonths(viewDate, -1);
    onMonthChange(prev.toISOString().slice(0, 10));
  }
  function handleNextMonth() {
    const next = addMonths(viewDate, 1);
    onMonthChange(next.toISOString().slice(0, 10));
  }
  function handleTitleClick() {
    const now = new Date();
    now.setDate(1);
    onMonthChange(now.toISOString().slice(0, 10));
  }

  return (
    <div className="bg-gray-800 rounded-2xl shadow-lg p-4 w-72 mb-8">
      <div className="flex items-center justify-between mb-2">
        <button
          className="px-2 py-1 rounded hover:bg-blue-700 text-white"
          onClick={handlePrevMonth}
          aria-label="Previous month"
        >
          &#8592;
        </button>
        <button
          className="text-lg font-bold text-blue-200 hover:underline hover:text-blue-400 px-2 py-1 rounded"
          onClick={handleTitleClick}
          title="Go to current month"
        >
          {viewDate.toLocaleString("default", { month: "long", year: "numeric" })}
        </button>
        <button
          className="px-2 py-1 rounded hover:bg-blue-700 text-white"
          onClick={handleNextMonth}
          aria-label="Next month"
        >
          &#8594;
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-blue-100 mb-1">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
          <div key={d} className="font-semibold text-xs">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1 text-center">
        {days.map((date, idx) => {
          if (!date) return <div key={idx} />;
          const isSelected = selectedDate === date.toISOString().slice(0, 10);
          const isWorkout = workoutDaySet.has(date.toISOString().slice(0, 10));
          const isCurrent = isToday(date);
          let btnClass = `w-8 h-8 rounded-full flex flex-col items-center justify-center text-sm font-medium transition`;
          if (isCurrent) btnClass += " bg-blue-600 text-white";
          else if (isSelected) btnClass += " ring-2 ring-blue-400";
          else if (isWorkout) btnClass += " bg-blue-200 text-blue-900";
          btnClass += " hover:bg-blue-700 hover:text-white";
          return (
            <button
              key={idx}
              className={btnClass}
              onClick={() => onDateSelect(date.toISOString().slice(0, 10))}
            >
              <span>{date.getDate()}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
