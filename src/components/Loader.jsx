import React from "react";

const EvencenLoader = ({ label = "Loading..." }) => {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      {/* Loader */}
      <div className="relative w-20 h-20">
        <div className="absolute inset-0 rounded-full border-4 border-neutral-800" />

        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-indigo-500 border-r-indigo-400 animate-spin" />

        <div className="absolute inset-3 rounded-full bg-neutral-950" />
      </div>

      {/* Label */}
      <p className="mt-6 text-sm tracking-wide text-neutral-400 animate-pulse">
        {label}
      </p>
    </div>
  );
};

export default EvencenLoader;
