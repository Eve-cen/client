import React from "react";

const Button = ({
  children,
  onClick,
  variant = "primary",
  loading = false,
  icon: Icon,
  className = "",
  ...props
}) => {
  const baseStyles =
    "my-4 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium focus:outline-none focus:ring-2 transition-all duration-200 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed";

  const variants = {
    primary: "bg-primary text-white hover:bg-primary focus:ring-primary",
    secondary:
      "bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-400",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
    outline:
      "border border-primary text-primary hover:bg-primary focus:ring-primary",
  };

  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <svg
            className="w-5 h-5 animate-spin text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            ></path>
          </svg>
          Loading...
        </span>
      ) : (
        <>
          {Icon && <Icon className="w-5 h-5" />}
          {children}
        </>
      )}
    </button>
  );
};

export default Button;
