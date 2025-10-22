import React from "react";

const ExtraInput = ({ extra, onChange, onRemove }) => {
  return (
    <div className="flex space-x-2 mb-2">
      <input
        type="text"
        value={extra.name}
        onChange={(e) => onChange({ ...extra, name: e.target.value })}
        placeholder="Extra Name"
        className="p-2 border rounded-lg flex-1"
      />
      <input
        type="number"
        value={extra.price}
        onChange={(e) => onChange({ ...extra, price: e.target.value })}
        placeholder="Price"
        className="p-2 border rounded-lg w-24"
      />
      <button
        onClick={onRemove}
        className="bg-red-500 text-white px-2 rounded-lg"
      >
        Remove
      </button>
    </div>
  );
};

export default ExtraInput;
