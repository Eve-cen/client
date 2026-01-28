const VencomeLoader = ({ label = "Loading..." }) => {
  return (
    <div className="flex items-center justify-center w-full h-screen">
      <img
        src="/logo-loader.svg"
        className="w-[20rem] md:w-[40rem] animate-[pulseScale_1.4s_ease-in-out_infinite]"
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
