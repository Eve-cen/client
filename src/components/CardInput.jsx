import { detectCardType } from "../utils/cardUtils";

const CardInput = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  error,
  ...props
}) => {
  const brand = name === "newCardNumber" ? detectCardType(value) : null;
  const brandIcons = {
    mastercard: "/mastercard.png",
    visa: "/visa.png",
    verve: "/verve.png",
  };
  const brandSize = {
    visa: "w-10 top-[38px]",
    verve: "w-10 top-[36px]",
    mastercard: "w-8",
  };
  return (
    <div className="relative flex flex-col">
      {label && (
        <label className="text-sm font-medium text-gray-700">{label}</label>
      )}
      {brand && brandIcons[brand] && (
        <img
          src={brandIcons[brand]}
          alt={brand}
          className={`absolute right-3 top-[32px] h-auto ${
            brandSize[brand] || "w-8"
          }`}
        />
      )}
      <input
        type="text" // ⬅️ MUST be text
        inputMode="numeric" // ⬅️ numeric keyboard
        autoComplete={
          name === "newCardNumber"
            ? "cc-number"
            : name === "newExpiryDate"
            ? "cc-exp"
            : "cc-csc"
        }
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        maxLength={
          name === "newCardNumber" ? 19 : name === "newExpiryDate" ? 5 : 4
        }
        className="mt-1 block w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        {...props}
      />

      {error && <span className="text-sm text-red-500 mt-1">{error}</span>}
    </div>
  );
};

export default CardInput;
