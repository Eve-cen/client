import React from "react";

const Input = ({ label, type = "text", error, ...props }) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-700">{label}</label>
    <input
      type={type}
      className={`mt-1 p-2 w-full border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
        error ? "border-red-500" : "border-gray-300"
      }`}
      {...props}
    />
    {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
  </div>
);

export default Input;
