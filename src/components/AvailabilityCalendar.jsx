import React, { useState, useCallback, useMemo, useRef } from "react";

/**
 * AvailabilityCalendar
 *
 * Props:
 *   blockedDates  – array of { id, start: "YYYY-MM-DD", end: "YYYY-MM-DD", reason: string }
 *   bookedDates   – array of { id, start: "YYYY-MM-DD", end: "YYYY-MM-DD", bookingId }
 *   onBlock       – (start: string, end: string) => void
 *   onUnblock     – (ids: string[]) => void   — called with array of blockedDate _ids to remove
 *   monthsToShow  – number (default 12)
 */
const AvailabilityCalendar = ({
  blockedDates = [],
  bookedDates = [],
  onBlock,
  onUnblock,
  monthsToShow = 12,
}) => {
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  // "block" | "delete"
  const [mode, setMode] = useState("block");

  // Selection: null | { start: "YYYY-MM-DD", end: "YYYY-MM-DD" | null }
  const [selection, setSelection] = useState(null);
  const [hovered, setHovered] = useState(null);

  // Tooltip
  const [tooltip, setTooltip] = useState(null); // { text, x, y }
  const calRef = useRef(null);

  const formatDate = useCallback((d) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }, []);

  // Map dateStr -> blocked entry (for tooltip + delete)
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

  // Map dateStr -> booked entry (for tooltip)
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

  // Live preview range
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

  // Confirmed range
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

  // In delete mode, which blocked entries overlap the confirmed range?
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
      // Start fresh
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
        const reasonLabel =
          {
            maintenance: "Maintenance",
            personal: "Personal block",
            external: "External calendar",
            booked: "Booked",
          }[entry?.reason] || "Blocked";
        text = reasonLabel;
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
    for (let i = 0; i < monthsToShow; i++) {
      const d = new Date(today.getFullYear(), today.getMonth() + i, 1);
      result.push({ year: d.getFullYear(), month: d.getMonth() });
    }
    return result;
  }, [monthsToShow, today]);

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
    <div
      className="availability-calendar"
      style={{ userSelect: "none", position: "relative" }}
      ref={calRef}
    >
      <div className="cal-top-bar">
        <Legend />
        <div className="cal-mode-toggle">
          <button
            className={`cal-mode-btn ${mode === "block" ? "active" : ""}`}
            onClick={() => {
              setMode("block");
              setSelection(null);
            }}
          >
            Block dates
          </button>
          <button
            className={`cal-mode-btn ${
              mode === "delete" ? "active delete" : ""
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

      {/* Action bar */}
      <div className="cal-action-bar">
        {pendingRange ? (
          <>
            <span className="cal-action-label">
              {mode === "block" ? "Block" : "Unblock"}{" "}
              <strong>
                {pendingRange.start === pendingRange.end
                  ? pendingRange.start
                  : `${pendingRange.start} → ${pendingRange.end}`}
              </strong>
              {mode === "delete" && deleteTargetIds.length === 0 && (
                <span className="cal-warn"> (no blocked dates in range)</span>
              )}
              ?
            </span>
            <div className="cal-action-btns">
              {mode === "block" ? (
                <button className="cal-btn-save" onClick={handleSave}>
                  Save
                </button>
              ) : (
                <button
                  className="cal-btn-delete"
                  onClick={handleDelete}
                  disabled={deleteTargetIds.length === 0}
                >
                  Delete{" "}
                  {deleteTargetIds.length > 0
                    ? `(${deleteTargetIds.length})`
                    : ""}
                </button>
              )}
              <button className="cal-btn-cancel" onClick={handleCancel}>
                Cancel
              </button>
            </div>
          </>
        ) : (
          <span className="cal-action-hint">{instructionText}</span>
        )}
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="cal-tooltip"
          style={{ left: tooltip.x, top: tooltip.y }}
        >
          {tooltip.text}
        </div>
      )}

      <div className="months-grid">
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

      <style>{CAL_STYLES}</style>
    </div>
  );
};

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
    <div className="cal-month">
      <div className="cal-month-header">
        {MONTH_NAMES[month]} {year}
      </div>
      <div className="cal-day-names">
        {DAY_NAMES.map((d) => (
          <div key={d} className="cal-day-name">
            {d}
          </div>
        ))}
      </div>
      <div className="cal-days">
        {cells.map((day, idx) => {
          if (!day)
            return <div key={`empty-${idx}`} className="cal-cell empty" />;

          const dateStr = formatDate(new Date(year, month, day));
          const status = getDateStatus(dateStr);
          const isPast = new Date(year, month, day) < today;
          const isToday = dateStr === formatDate(today);
          const inPreview = previewSet.has(dateStr);
          const inConfirmed = confirmedSet.has(dateStr);
          const isAnchor =
            dateStr === selectionStart || dateStr === selectionEnd;

          // In delete mode, dim non-blocked dates
          const isDeleteable = mode === "delete" && status === "blocked";

          let cls = "cal-cell";
          if (isPast) cls += " past";
          else cls += ` ${status}`;
          if (isToday) cls += " today";
          if (!isPast && inPreview) cls += " in-preview";
          if (!isPast && inConfirmed) {
            cls +=
              mode === "delete" && status === "blocked"
                ? " in-confirmed-delete"
                : " in-confirmed";
          }
          if (!isPast && isAnchor) cls += " selection-anchor";
          if (mode === "delete" && !isPast && status === "available")
            cls += " delete-mode-available";

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
  <div className="cal-legend">
    {[
      { cls: "available", label: "Available" },
      { cls: "blocked", label: "Blocked" },
      { cls: "booked", label: "Booked" },
      { cls: "past", label: "Past" },
    ].map(({ cls, label }) => (
      <div key={cls} className="legend-item">
        <span className={`legend-dot ${cls}`} />
        <span className="legend-label">{label}</span>
      </div>
    ))}
  </div>
);

// ─── Styles ───────────────────────────────────────────────────────────────────

const CAL_STYLES = `
  .availability-calendar {
    font-family: 'Barlow', sans-serif;
    width: 100%;
  }

  .cal-top-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 12px;
    margin-bottom: 16px;
  }

  .cal-legend {
    display: flex;
    gap: 20px;
    flex-wrap: wrap;
  }
  .legend-item { display: flex; align-items: center; gap: 6px; }
  .legend-dot {
    width: 12px; height: 12px;
    border-radius: 3px; display: inline-block;
  }
  .legend-dot.available { background: #f0f0f0; border: 1px solid #d1d5db; }
  .legend-dot.blocked   { background: #1A1A1A; }
  .legend-dot.booked    { background: #ef4444; }
  .legend-dot.past      { background: #e5e7eb; }
  .legend-label { font-size: 13px; color: #6b7280; }

  /* Mode toggle */
  .cal-mode-toggle {
    display: flex;
    gap: 0;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    overflow: hidden;
  }
  .cal-mode-btn {
    background: #fff;
    color: #6b7280;
    border: none;
    padding: 7px 16px;
    font-family: 'Barlow', sans-serif;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.15s, color 0.15s;
  }
  .cal-mode-btn:first-child { border-right: 1px solid #e5e7eb; }
  .cal-mode-btn.active {
    background: #1A1A1A;
    color: #fff;
    font-weight: 600;
  }
  .cal-mode-btn.active.delete {
    background: #ef4444;
  }

  .cal-action-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-height: 44px;
    background: #f9fafb;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 10px 16px;
    margin-bottom: 24px;
    gap: 12px;
    flex-wrap: wrap;
  }
  .cal-action-hint { font-size: 13px; color: #9ca3af; }
  .cal-action-label { font-size: 13px; color: #1A1A1A; }
  .cal-action-label strong { font-weight: 600; }
  .cal-warn { color: #f59e0b; font-weight: 500; }
  .cal-action-btns { display: flex; gap: 8px; }

  .cal-btn-save {
    background: #1A1A1A;
    color: #fff;
    border: none;
    border-radius: 6px;
    padding: 6px 18px;
    font-family: 'Barlow', sans-serif;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.15s;
  }
  .cal-btn-save:hover { background: #374151; }

  .cal-btn-delete {
    background: #ef4444;
    color: #fff;
    border: none;
    border-radius: 6px;
    padding: 6px 18px;
    font-family: 'Barlow', sans-serif;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.15s;
  }
  .cal-btn-delete:hover:not(:disabled) { background: #dc2626; }
  .cal-btn-delete:disabled { opacity: 0.4; cursor: not-allowed; }

  .cal-btn-cancel {
    background: transparent;
    color: #6b7280;
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    padding: 6px 14px;
    font-family: 'Barlow', sans-serif;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: border-color 0.15s, color 0.15s;
  }
  .cal-btn-cancel:hover { border-color: #9ca3af; color: #1A1A1A; }

  /* Tooltip */
  .cal-tooltip {
    position: absolute;
    transform: translate(-50%, -100%);
    background: #1A1A1A;
    color: #fff;
    font-family: 'Barlow', sans-serif;
    font-size: 12px;
    font-weight: 500;
    padding: 4px 10px;
    border-radius: 5px;
    pointer-events: none;
    white-space: nowrap;
    z-index: 100;
    margin-top: -4px;
  }
  .cal-tooltip::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    border: 5px solid transparent;
    border-top-color: #1A1A1A;
  }

  .months-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: 32px;
  }

  .cal-month { min-width: 0; }

  .cal-month-header {
    font-size: 15px;
    font-weight: 600;
    color: #1A1A1A;
    margin-bottom: 12px;
    letter-spacing: 0.01em;
  }

  .cal-day-names {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    margin-bottom: 4px;
  }
  .cal-day-name {
    text-align: center;
    font-size: 11px;
    font-weight: 600;
    color: #9ca3af;
    padding: 4px 0;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .cal-days {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 2px;
  }

  .cal-cell {
    aspect-ratio: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
    font-weight: 500;
    border-radius: 6px;
    cursor: pointer;
    transition: background 0.1s ease, transform 0.1s ease;
  }
  .cal-cell.empty { cursor: default; }

  .cal-cell.available {
    background: #f9fafb;
    color: #1A1A1A;
    border: 1px solid #e5e7eb;
  }
  .cal-cell.available:hover { background: #f0f0f0; border-color: #d1d5db; }

  /* In delete mode, available dates are visually dimmed */
  .cal-cell.delete-mode-available {
    opacity: 0.4;
    cursor: default;
  }

  .cal-cell.blocked {
    background: #1A1A1A;
    color: #fff;
    border: 1px solid #1A1A1A;
  }
  .cal-cell.blocked:hover { background: #374151; }

  .cal-cell.booked {
    background: #fef2f2;
    color: #ef4444;
    border: 1px solid #fecaca;
    cursor: not-allowed;
  }
  .cal-cell.past {
    background: transparent;
    color: #d1d5db;
    border: 1px solid transparent;
    cursor: default;
  }
  .cal-cell.today {
    outline: 2px solid #1A1A1A;
    outline-offset: -2px;
    font-weight: 700;
  }

  .cal-cell.in-preview {
    background: #e5e7eb !important;
    color: #1A1A1A !important;
    border-color: #d1d5db !important;
  }

  .cal-cell.in-confirmed {
    background: #374151 !important;
    color: #fff !important;
    border-color: #374151 !important;
  }

  /* Delete mode confirmed range highlight */
  .cal-cell.in-confirmed-delete {
    background: #fca5a5 !important;
    color: #7f1d1d !important;
    border-color: #f87171 !important;
  }

  .cal-cell.selection-anchor {
    background: #1A1A1A !important;
    color: #fff !important;
    border-color: #1A1A1A !important;
    transform: scale(1.08);
    z-index: 1;
  }

  .cal-cell:active:not(.past):not(.booked) { transform: scale(0.92); }
`;

export default AvailabilityCalendar;
