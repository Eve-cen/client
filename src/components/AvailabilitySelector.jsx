export default function AvailabilitySelector({
  availability,
  setAvailability,
  timeBlocks,
  setTimeBlocks,
}) {
  const handleTimeChange = (index, field, value) => {
    const updated = [...timeBlocks];
    updated[index][field] = value;
    setTimeBlocks(updated);
  };

  const addBlock = () => {
    setTimeBlocks([...timeBlocks, { start: "", end: "" }]);
  };

  const removeBlock = (index) => {
    setTimeBlocks(timeBlocks.filter((_, i) => i !== index));
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow mb-6">
      <h3 className="text-lg font-semibold mb-3">Default Availability</h3>

      <select
        value={availability}
        onChange={(e) => setAvailability(e.target.value)}
        className="w-full p-3 border border-gray-200 rounded-lg"
      >
        <option value="all">Available every day</option>
        <option value="weekdays">Weekdays only</option>
        <option value="weekends">Weekends only</option>
        <option value="custom">Custom schedule</option>
      </select>

      {availability === "custom" && (
        <div className="mt-4 space-y-3">
          {timeBlocks.map((block, index) => (
            <div key={index} className="flex items-center gap-3">
              <input
                type="time"
                value={block.start}
                onChange={(e) =>
                  handleTimeChange(index, "start", e.target.value)
                }
                className="flex-1 p-2 border rounded-lg"
              />

              <span>to</span>

              <input
                type="time"
                value={block.end}
                onChange={(e) => handleTimeChange(index, "end", e.target.value)}
                className="flex-1 p-2 border rounded-lg"
              />

              {timeBlocks.length > 1 && (
                <button
                  onClick={() => removeBlock(index)}
                  className="text-red-500 text-sm"
                >
                  Remove
                </button>
              )}
            </div>
          ))}

          <button
            onClick={addBlock}
            className="text-primary text-sm font-medium"
          >
            + Add time block
          </button>
        </div>
      )}
    </div>
  );
}
