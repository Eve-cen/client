const CustomToast = ({ closeToast, toastProps, message }) => (
  <div className="flex items-start gap-3">
    <div className="flex flex-col">
      <span
        className={`text-lg font-semibold ${
          toastProps.type === "success" ? "text-green-700" : "text-red-700"
        }`}
      >
        {toastProps.type === "success" ? "Success" : "Error"}
      </span>

      <p className="text-gray-700 mt-1">{message}</p>
    </div>
  </div>
);

export default CustomToast;
