import React from "react";

const CardInput = ({ value, onChange, label, placeholder }) => {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="mt-1 block w-full p-2 border rounded-lg"
      />
    </div>
  );
};

export default CardInput;
