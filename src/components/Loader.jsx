// import React from "react";

// const vencomeLoader = ({ label = "Loading..." }) => {
//   return (
//     <div className="flex flex-col items-center justify-center h-screen">
//       {/* Loader */}
//       <div className="relative w-20 h-20">
//         <div className="absolute inset-0 rounded-full border-4 border-neutral-800" />

//         <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-indigo-500 border-r-indigo-400 animate-spin" />

//         <div className="absolute inset-3 rounded-full bg-neutral-950" />
//       </div>

//       {/* Label */}
//       <p className="mt-6 text-sm tracking-wide text-neutral-400 animate-pulse">
//         {label}
//       </p>
//     </div>
//   );
// };

// export default vencomeLoader;

const VencomeLoader = ({ label = "Loading..." }) => {
  return (
    <div className="flex items-center justify-center w-full h-screen">
      <img
        src="/logo-loader.svg"
        className="w-[40rem] animate-[pulseScale_1.4s_ease-in-out_infinite]"
      />

      <style>
        {`
          @keyframes pulseScale {
            0% { transform: scale(1); opacity: .7; }
            50% { transform: scale(1.08); opacity: 1; }
            100% { transform: scale(1); opacity: .7; }
          }
        `}
      </style>
    </div>
  );
};

export default VencomeLoader;
