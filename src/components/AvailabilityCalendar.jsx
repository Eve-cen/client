import React, { useState, useCallback, useMemo, useRef } from "react";

/**
 * AvailabilityCalendar
 *
 * Props:
 *   blockedDates  – array of { id, start: "YYYY-MM-DD", end: "YYYY-MM-DD", reason: string }
 *   bookedDates   – array of { id, start: "YYYY-MM-DD", end: "YYYY-MM-DD", bookingId }
 *   onBlock       – (start: string, end: string) => void
 *   onUnblock     – (ids: string[]) => void
 *   monthsPerPage – number (default 3)
 */
const AvailabilityCalendar = ({
  blockedDates = [],
  bookedDates = [],
  onBlock,
  onUnblock,
  monthsPerPage = 3,
}) => {
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const [pageOffset, setPageOffset] = useState(0);
  // "block" | "delete"
  const [mode, setMode] = useState("block");
  // Selection: null | { start: "YYYY-MM-DD", end: "YYYY-MM-DD" | null }
  const [selection, setSelection] = useState(null);
  const [hovered, setHovered] = useState(null);
  const [tooltip, setTooltip] = useState(null); // { text, x, y }
  const calRef = useRef(null);

  const formatDate = useCallback((d) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }, []);

  const blockedMap = useMemo(() => {
    const map = new Map();
    blockedDates.forEach((entry) => {
      const s = new Date(entry.start);
      const e = new Date(entry.end);
      for (let d = new Date(s); d <= e; d.setDate(d.getDate() + 1))
        map.set(formatDate(new Date(d)), entry);
    });
    return map;
  }, [blockedDates, formatDate]);

  const bookedMap = useMemo(() => {
    const map = new Map();
    bookedDates.forEach((entry) => {
      const s = new Date(entry.start);
      const e = new Date(entry.end);
      for (let d = new Date(s); d <= e; d.setDate(d.getDate() + 1))
        map.set(formatDate(new Date(d)), entry);
    });
    return map;
  }, [bookedDates, formatDate]);

  const blockedSet = useMemo(() => new Set(blockedMap.keys()), [blockedMap]);
  const bookedSet = useMemo(() => new Set(bookedMap.keys()), [bookedMap]);

  const previewSet = useMemo(() => {
    if (!selection?.start || selection?.end || !hovered) return new Set();
    const set = new Set();
    const a = new Date(selection.start);
    const b = new Date(hovered);
    const s = new Date(Math.min(a, b));
    const e = new Date(Math.max(a, b));
    for (let d = new Date(s); d <= e; d.setDate(d.getDate() + 1))
      set.add(formatDate(new Date(d)));
    return set;
  }, [selection, hovered, formatDate]);

  const pendingRange = useMemo(() => {
    if (!selection?.start || !selection?.end) return null;
    const a = new Date(selection.start);
    const b = new Date(selection.end);
    return {
      start: formatDate(new Date(Math.min(a, b))),
      end: formatDate(new Date(Math.max(a, b))),
    };
  }, [selection, formatDate]);

  const confirmedSet = useMemo(() => {
    if (!pendingRange) return new Set();
    const set = new Set();
    const s = new Date(pendingRange.start);
    const e = new Date(pendingRange.end);
    for (let d = new Date(s); d <= e; d.setDate(d.getDate() + 1))
      set.add(formatDate(new Date(d)));
    return set;
  }, [pendingRange, formatDate]);

  const deleteTargetIds = useMemo(() => {
    if (mode !== "delete" || !pendingRange) return [];
    const ids = new Set();
    const s = new Date(pendingRange.start);
    const e = new Date(pendingRange.end);
    for (let d = new Date(s); d <= e; d.setDate(d.getDate() + 1)) {
      const entry = blockedMap.get(formatDate(new Date(d)));
      if (entry?.id) ids.add(entry.id);
    }
    return [...ids];
  }, [mode, pendingRange, blockedMap, formatDate]);

  function getDateStatus(dateStr) {
    if (bookedSet.has(dateStr)) return "booked";
    if (blockedSet.has(dateStr)) return "blocked";
    return "available";
  }

  const handleDateClick = useCallback(
    (dateStr) => {
      if (bookedSet.has(dateStr)) return;
      if (!selection) {
        setSelection({ start: dateStr, end: null });
        return;
      }
      if (!selection.end) {
        setSelection((prev) => ({ ...prev, end: dateStr }));
        return;
      }
      setSelection({ start: dateStr, end: null });
    },
    [selection, bookedSet]
  );

  const handleSave = useCallback(() => {
    if (!pendingRange) return;
    onBlock?.(pendingRange.start, pendingRange.end);
    setSelection(null);
    setHovered(null);
  }, [pendingRange, onBlock]);

  const handleDelete = useCallback(() => {
    if (!deleteTargetIds.length) return;
    onUnblock?.(deleteTargetIds);
    setSelection(null);
    setHovered(null);
  }, [deleteTargetIds, onUnblock]);

  const handleCancel = useCallback(() => {
    setSelection(null);
    setHovered(null);
  }, []);

  const handleDateHover = useCallback(
    (dateStr, event) => {
      setHovered(dateStr || null);
      if (!dateStr) {
        setTooltip(null);
        return;
      }
      const status = getDateStatus(dateStr);
      let text = null;
      if (status === "blocked") {
        const entry = blockedMap.get(dateStr);
        text =
          {
            maintenance: "Maintenance",
            personal: "Personal block",
            external: "External calendar",
            booked: "Booked",
          }[entry?.reason] || "Blocked";
      } else if (status === "booked") {
        text = "Booked";
      }
      if (text && event) {
        const rect = event.currentTarget.getBoundingClientRect();
        const calRect = calRef.current?.getBoundingClientRect();
        setTooltip({
          text,
          x: rect.left - (calRect?.left || 0) + rect.width / 2,
          y: rect.top - (calRect?.top || 0) - 8,
        });
      } else {
        setTooltip(null);
      }
    },
    [blockedMap, bookedSet]
  );

  const months = useMemo(() => {
    const result = [];
    for (let i = 0; i < monthsPerPage; i++) {
      const d = new Date(
        today.getFullYear(),
        today.getMonth() + pageOffset * monthsPerPage + i,
        1
      );
      result.push({ year: d.getFullYear(), month: d.getMonth() });
    }
    return result;
  }, [monthsPerPage, pageOffset, today]);

  const pageLabel = useMemo(() => {
    const first = months[0];
    const last = months[months.length - 1];
    if (first.year === last.year)
      return `${MONTH_NAMES[first.month]} – ${MONTH_NAMES[last.month]} ${
        first.year
      }`;
    return `${MONTH_NAMES[first.month]} ${first.year} – ${
      MONTH_NAMES[last.month]
    } ${last.year}`;
  }, [months]);

  const canGoPrev = pageOffset > 0;

  const instructionText =
    mode === "block"
      ? !selection
        ? "Click a date to start blocking a range"
        : !selection.end
        ? "Now click the end date"
        : null
      : !selection
      ? "Click a date to start selecting a range to unblock"
      : !selection.end
      ? "Now click the end date"
      : null;

  return (
    <div className="w-full select-none relative" ref={calRef}>
      {/* Top bar */}
      <div className="flex items-center justify-between flex-wrap gap-3 mb-3">
        <Legend />
        <div className="flex border border-gray-200 rounded-lg overflow-hidden">
          <button
            className={`px-4 py-1.5 text-sm font-medium transition-colors ${
              mode === "block"
                ? "bg-gray-900 text-white"
                : "bg-white text-gray-500 hover:bg-gray-50"
            }`}
            onClick={() => {
              setMode("block");
              setSelection(null);
            }}
          >
            Block dates
          </button>
          <button
            className={`px-4 py-1.5 text-sm font-medium border-l border-gray-200 transition-colors ${
              mode === "delete"
                ? "bg-red-500 text-white"
                : "bg-white text-gray-500 hover:bg-gray-50"
            }`}
            onClick={() => {
              setMode("delete");
              setSelection(null);
            }}
          >
            Unblock dates
          </button>
        </div>
      </div>

      {/* Navigation bar */}
      <div className="flex items-center justify-center gap-4 mb-4">
        <button
          onClick={() => canGoPrev && setPageOffset((p) => p - 1)}
          className={`w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 bg-white transition-colors ${
            canGoPrev
              ? "hover:bg-gray-50 text-gray-700 cursor-pointer"
              : "opacity-30 cursor-default text-gray-400"
          }`}
          aria-label="Previous"
        >
          <ChevronLeft />
        </button>
        <span className="text-sm font-semibold text-gray-800 min-w-[220px] text-center">
          {pageLabel}
        </span>
        <button
          onClick={() => setPageOffset((p) => p + 1)}
          className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 cursor-pointer transition-colors"
          aria-label="Next"
        >
          <ChevronRight />
        </button>
      </div>

      {/* Action bar */}
      <div className="flex items-center justify-between min-h-[44px] bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 mb-6 gap-3 flex-wrap">
        {pendingRange ? (
          <>
            <span className="text-sm text-gray-800">
              {mode === "block" ? "Block" : "Unblock"}{" "}
              <strong className="font-semibold">
                {pendingRange.start === pendingRange.end
                  ? pendingRange.start
                  : `${pendingRange.start} → ${pendingRange.end}`}
              </strong>
              {mode === "delete" && deleteTargetIds.length === 0 && (
                <span className="text-amber-500 font-medium">
                  {" "}
                  (no blocked dates in range)
                </span>
              )}
              ?
            </span>
            <div className="flex gap-2">
              {mode === "block" ? (
                <button
                  onClick={handleSave}
                  className="bg-gray-900 text-white text-sm font-semibold px-4 py-1.5 rounded-md hover:bg-gray-700 transition-colors"
                >
                  Save
                </button>
              ) : (
                <button
                  onClick={handleDelete}
                  disabled={deleteTargetIds.length === 0}
                  className="bg-red-500 text-white text-sm font-semibold px-4 py-1.5 rounded-md hover:bg-red-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Delete
                  {deleteTargetIds.length > 0
                    ? ` (${deleteTargetIds.length})`
                    : ""}
                </button>
              )}
              <button
                onClick={handleCancel}
                className="text-sm font-medium text-gray-500 border border-gray-200 px-3.5 py-1.5 rounded-md hover:border-gray-400 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
            </div>
          </>
        ) : (
          <span className="text-sm text-gray-400">{instructionText}</span>
        )}
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="absolute z-50 pointer-events-none"
          style={{
            left: tooltip.x,
            top: tooltip.y,
            transform: "translate(-50%, -100%)",
          }}
        >
          <div className="bg-gray-900 text-white text-xs font-medium px-2.5 py-1 rounded-md whitespace-nowrap mb-1">
            {tooltip.text}
          </div>
        </div>
      )}

      {/* Months grid */}
      <div
        className="grid gap-8"
        style={{ gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))" }}
      >
        {months.map(({ year, month }) => (
          <Month
            key={`${year}-${month}`}
            year={year}
            month={month}
            today={today}
            getDateStatus={getDateStatus}
            previewSet={previewSet}
            confirmedSet={confirmedSet}
            selectionStart={selection?.start}
            selectionEnd={selection?.end}
            onDateClick={handleDateClick}
            onDateHover={handleDateHover}
            formatDate={formatDate}
            mode={mode}
          />
        ))}
      </div>
    </div>
  );
};

// ─── Icons ────────────────────────────────────────────────────────────────────

const ChevronLeft = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M10 12L6 8l4-4"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ChevronRight = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M6 4l4 4-4 4"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// ─── Month ────────────────────────────────────────────────────────────────────

const MONTH_NAMES = [
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
const DAY_NAMES = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

const Month = ({
  year,
  month,
  today,
  getDateStatus,
  previewSet,
  confirmedSet,
  selectionStart,
  selectionEnd,
  onDateClick,
  onDateHover,
  formatDate,
  mode,
}) => {
  const firstDay = new Date(year, month, 1);
  const startOffset = (firstDay.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div className="min-w-0">
      <div className="text-sm font-semibold text-gray-900 mb-3 tracking-tight">
        {MONTH_NAMES[month]} {year}
      </div>
      <div className="grid grid-cols-7 mb-1">
        {DAY_NAMES.map((d) => (
          <div
            key={d}
            className="text-center text-[10px] font-semibold text-gray-400 py-1 uppercase tracking-widest"
          >
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-0.5">
        {cells.map((day, idx) => {
          if (!day)
            return <div key={`empty-${idx}`} className="aspect-square" />;

          const dateStr = formatDate(new Date(year, month, day));
          const status = getDateStatus(dateStr);
          const isPast = new Date(year, month, day) < today;
          const isToday = dateStr === formatDate(today);
          const inPreview = previewSet.has(dateStr);
          const inConfirmed = confirmedSet.has(dateStr);
          const isAnchor =
            dateStr === selectionStart || dateStr === selectionEnd;

          let cls =
            "aspect-square flex items-center justify-center text-[13px] font-medium rounded-md cursor-pointer transition-all duration-100 select-none ";

          if (isPast) {
            cls += "text-gray-300 border border-transparent cursor-default ";
          } else if (status === "booked") {
            cls +=
              "bg-red-50 text-red-400 border border-red-100 cursor-not-allowed ";
          } else if (inConfirmed && mode === "delete" && status === "blocked") {
            cls += "!bg-red-200 !text-red-900 !border-red-300 border ";
          } else if (inConfirmed) {
            cls += "!bg-gray-600 !text-white !border-gray-600 border ";
          } else if (inPreview) {
            cls += "!bg-gray-200 !text-gray-900 !border-gray-300 border ";
          } else if (status === "blocked") {
            if (mode === "delete") {
              cls +=
                "bg-gray-900 text-white border border-gray-900 hover:bg-gray-700 ";
            } else {
              cls +=
                "bg-gray-900 text-white border border-gray-900 hover:bg-gray-700 ";
            }
          } else {
            // available
            if (mode === "delete") {
              cls +=
                "bg-gray-50 text-gray-900 border border-gray-200 opacity-40 cursor-default ";
            } else {
              cls +=
                "bg-gray-50 text-gray-900 border border-gray-200 hover:bg-gray-100 hover:border-gray-300 ";
            }
          }

          if (isToday && !isPast) {
            cls +=
              "outline outline-2 outline-gray-900 outline-offset-[-2px] font-bold ";
          }

          if (isAnchor && !isPast) {
            cls +=
              "!bg-gray-900 !text-white !border-gray-900 scale-110 z-10 shadow-sm ";
          }

          return (
            <div
              key={dateStr}
              className={cls}
              onClick={() => !isPast && onDateClick(dateStr)}
              onMouseEnter={(e) => onDateHover(dateStr, e)}
              onMouseLeave={() => onDateHover(null, null)}
            >
              {day}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ─── Legend ───────────────────────────────────────────────────────────────────

const Legend = () => (
  <div className="flex gap-5 flex-wrap">
    {[
      { bg: "bg-gray-100 border border-gray-300", label: "Available" },
      { bg: "bg-gray-900", label: "Blocked" },
      { bg: "bg-red-400", label: "Booked" },
      { bg: "bg-gray-200", label: "Past" },
    ].map(({ bg, label }) => (
      <div key={label} className="flex items-center gap-1.5">
        <span className={`w-3 h-3 rounded-sm inline-block ${bg}`} />
        <span className="text-xs text-gray-500">{label}</span>
      </div>
    ))}
  </div>
);

export default AvailabilityCalendar;
