import React, { useState, useRef, useEffect } from "react";

const DateSelector = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  minDate,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Initialize currentMonth based on selected value or today
  useEffect(() => {
    if (value) {
      const selectedDate = new Date(value);
      if (!isNaN(selectedDate)) {
        setCurrentMonth(selectedDate);
      }
    }
  }, [value]);

  const formatDate = (date) => {
    if (!date) return "";
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const formatValueForInput = (date) => {
    if (!date) return "";
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek, year, month };
  };

  const handleDateSelect = (day) => {
    const selectedDate = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day
    );
    const formattedValue = formatValueForInput(selectedDate);

    onChange({
      target: {
        name: name,
        value: formattedValue,
      },
    });
    setIsOpen(false);
  };

  const handlePrevMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1)
    );
  };

  const handleNextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1)
    );
  };

  const isDateDisabled = (day) => {
    if (!minDate) return false;
    const date = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day
    );
    const min = new Date(minDate);
    return date < min;
  };

  const isDateSelected = (day) => {
    if (!value) return false;
    const selected = new Date(value);
    return (
      selected.getDate() === day &&
      selected.getMonth() === currentMonth.getMonth() &&
      selected.getFullYear() === currentMonth.getFullYear()
    );
  };

  const isToday = (day) => {
    const today = new Date();
    return (
      today.getDate() === day &&
      today.getMonth() === currentMonth.getMonth() &&
      today.getFullYear() === currentMonth.getFullYear()
    );
  };

  const { daysInMonth, startingDayOfWeek, year, month } =
    getDaysInMonth(currentMonth);

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Create array of day cells including empty cells for alignment
  const dayCells = [];
  for (let i = 0; i < startingDayOfWeek; i++) {
    dayCells.push(<div key={`empty-${i}`} className="h-10" />);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    dayCells.push(day);
  }

  return (
    <div className="relative w-full" ref={dropdownRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}

      <div
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 mb-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent cursor-pointer bg-white flex items-center justify-between"
      >
        <span className={value ? "text-gray-900" : "text-gray-400"}>
          {value ? formatDate(value) : placeholder || "Select date"}
        </span>
        <svg
          className={`w-5 h-5 text-gray-400 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>

      {isOpen && (
        <div className="absolute z-50 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-4 w-80">
          {/* Month/Year Header */}
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>

            <span className="font-semibold text-gray-900">
              {monthNames[month]} {year}
            </span>

            <button
              type="button"
              onClick={handleNextMonth}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>

          {/* Day Names */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {dayNames.map((day) => (
              <div
                key={day}
                className="h-10 flex items-center justify-center text-xs font-medium text-gray-600"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {dayCells.map((day, index) => {
              if (typeof day !== "number") {
                return day; // Empty cell
              }

              const disabled = isDateDisabled(day);
              const selected = isDateSelected(day);
              const today = isToday(day);

              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => !disabled && handleDateSelect(day)}
                  disabled={disabled}
                  className={`
                    h-10 flex items-center justify-center rounded-lg text-sm font-medium
                    transition-colors
                    ${
                      disabled
                        ? "text-gray-300 cursor-not-allowed"
                        : "hover:bg-gray-100 cursor-pointer"
                    }
                    ${
                      selected
                        ? "bg-primary text-white hover:bg-primary"
                        : "text-gray-900"
                    }
                    ${
                      today && !selected ? "ring-2 ring-primary ring-inset" : ""
                    }
                  `}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {/* Today Button */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => {
                const today = new Date();
                handleDateSelect(today.getDate());
                setCurrentMonth(today);
              }}
              className="w-full py-2 text-sm font-medium text-primary hover:bg-gray-50 rounded-lg transition-colors"
            >
              Today
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DateSelector;
