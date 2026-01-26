import React from "react";

const YesNoToggle = ({ label, subtitle, name, value, onChange }) => {
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-200">
      <div>
        <h3 className="text-gray-800 font-medium">{label}</h3>
        {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
      </div>

      <div className="flex items-center bg-gray-200 rounded-full p-1">
        <button
          type="button"
          onClick={() => onChange({ target: { name, value: true } })}
          className={`px-4 py-1 text-sm rounded-full transition-all cursor-pointer ${
            value ? "bg-primary text-white shadow-sm" : "text-gray-700"
          }`}
        >
          Yes
        </button>
        <button
          type="button"
          onClick={() => onChange({ target: { name, value: false } })}
          className={`px-4 py-1 text-sm rounded-full transition-all cursor-pointer ${
            !value ? "bg-primary text-white shadow-sm" : "text-gray-700"
          }`}
        >
          No
        </button>
      </div>
    </div>
  );
};

export default YesNoToggle;
