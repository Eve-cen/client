import React from "react";

const Button = ({ children, className, ...props }) => (
  <button
    className={`w-full px-4 py-2 bg-[#305CDE] text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
    {...props}
  >
    {children}
  </button>
);

export default Button;
