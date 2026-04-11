// AvailabilitySelector.jsx
import React from "react";

const DAY_OPTIONS = [
  { label: "Mon", value: 1 },
  { label: "Tue", value: 2 },
  { label: "Wed", value: 3 },
  { label: "Thu", value: 4 },
  { label: "Fri", value: 5 },
  { label: "Sat", value: 6 },
  { label: "Sun", value: 0 },
];

// Generate half-hour time options
const generateTimes = () => {
  const times = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 30) {
      const hour = h.toString().padStart(2, "0");
      const minute = m.toString().padStart(2, "0");
      times.push(`${hour}:${minute}`);
    }
  }
  return times;
};
const TIME_OPTIONS = generateTimes();

export default function AvailabilitySelector({
  availability,
  setAvailability,
  customAvailability,
  setCustomAvailability,
}) {
  const handleDayToggle = (dayValue) => {
    const current = customAvailability.days || [];
    const updated = current.includes(dayValue)
      ? current.filter((d) => d !== dayValue)
      : [...current, dayValue];
    setCustomAvailability({ ...customAvailability, days: updated });
  };

  const handleTimeChange = (field, value) => {
    setCustomAvailability({ ...customAvailability, [field]: value });
  };

  // Preset days helpers
  const applyPreset = (preset) => {
    if (preset === "all") {
      setCustomAvailability({
        ...customAvailability,
        days: [0, 1, 2, 3, 4, 5, 6],
      });
    } else if (preset === "weekdays") {
      setCustomAvailability({ ...customAvailability, days: [1, 2, 3, 4, 5] });
    } else if (preset === "weekends") {
      setCustomAvailability({ ...customAvailability, days: [0, 6] });
    }
    setAvailability(preset);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow mb-6">
      <h3 className="text-lg font-semibold mb-3">Default Availability</h3>

      {/* Day preset */}
      <select
        value={availability}
        onChange={(e) => applyPreset(e.target.value)}
        className="w-full p-3 border border-gray-200 rounded-lg mb-4"
      >
        <option value="all">Available every day</option>
        <option value="weekdays">Weekdays only</option>
        <option value="weekends">Weekends only</option>
        <option value="custom">Custom days</option>
      </select>

      {/* Day toggles — always visible so host can fine-tune */}
      <div className="mb-4">
        <p className="text-sm font-medium text-gray-600 mb-2">Available days</p>
        <div className="flex gap-2 flex-wrap">
          {DAY_OPTIONS.map(({ label, value }) => {
            const active = (customAvailability.days || []).includes(value);
            return (
              <button
                key={value}
                type="button"
                onClick={() => {
                  setAvailability("custom");
                  handleDayToggle(value);
                }}
                className={`px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors ${
                  active
                    ? "bg-gray-900 text-white border-gray-900"
                    : "bg-white text-gray-500 border-gray-200 hover:border-gray-400"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Open / Close time */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-600">
            Open time
          </label>
          <select
            value={customAvailability.openTime || "09:00"}
            onChange={(e) => handleTimeChange("openTime", e.target.value)}
            className="w-full p-2.5 border border-gray-200 rounded-lg text-sm"
          >
            {TIME_OPTIONS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-600">
            Close time
          </label>
          <select
            value={customAvailability.closeTime || "18:00"}
            onChange={(e) => handleTimeChange("closeTime", e.target.value)}
            className="w-full p-2.5 border border-gray-200 rounded-lg text-sm"
          >
            {TIME_OPTIONS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Min booking hours */}
      <div>
        <label className="block text-sm font-medium mb-1 text-gray-600">
          Minimum booking duration (hours)
        </label>
        <input
          type="number"
          min={1}
          max={24}
          value={customAvailability.minBookingHours || 2}
          onChange={(e) =>
            setCustomAvailability({
              ...customAvailability,
              minBookingHours: Number(e.target.value),
            })
          }
          className="w-full p-2.5 border border-gray-200 rounded-lg text-sm"
        />
      </div>

      {/* Summary */}
      <p className="mt-4 text-xs text-gray-400">
        Guests can book on{" "}
        {(customAvailability.days || []).length === 0
          ? "no days (select at least one)"
          : DAY_OPTIONS.filter((d) =>
              (customAvailability.days || []).includes(d.value)
            )
              .map((d) => d.label)
              .join(", ")}{" "}
        from {customAvailability.openTime || "09:00"} to{" "}
        {customAvailability.closeTime || "18:00"}, min{" "}
        {customAvailability.minBookingHours || 2}h.
      </p>
    </div>
  );
}
