import React, { useState, useRef } from "react";
import Button from "./Button";

const OTPInput = ({ email, onVerify }) => {
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const inputs = useRef([]);

  const handleChange = (e, index) => {
    const value = e.target.value;
    if (/^[0-9]$/.test(value) || value === "") {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      if (value && index < 3) {
        inputs.current[index + 1].focus();
      }
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputs.current[index - 1].focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpValue = otp.join("");
    if (otpValue.length !== 4) {
      setError("Please enter the 4-digit OTP");
      return;
    }

    setLoading(true);
    try {
      await onVerify(otpValue);
    } catch (err) {
      setError(err.response?.data?.error || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto bg-white p-8">
      {error && (
        <p className="text-red-500 mb-4 text-center font-medium">{error}</p>
      )}
      <div className="flex justify-center gap-4 mb-6">
        {otp.map((digit, index) => (
          <input
            key={index}
            type="text"
            maxLength="1"
            value={digit}
            onChange={(e) => handleChange(e, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            ref={(el) => (inputs.current[index] = el)}
            className="w-16 h-16 text-center text-2xl border-2 border-gray-300 rounded-xl focus:border-[#305CDE] focus:ring-2 focus:ring-[#305CDE] outline-none transition"
          />
        ))}
      </div>
      <Button
        type="submit"
        disabled={loading}
        className="w-full bg-[#305CDE] hover:bg-blue-700 text-white py-3 rounded-xl font-semibold transition"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            Verifying...
          </span>
        ) : (
          "Verify OTP"
        )}
      </Button>
      <p className="mt-4 text-center text-gray-500 text-sm">
        Didn’t receive the code?{" "}
        <button className="text-[#305CDE] underline">Resend</button>
      </p>
    </form>
  );
};

export default OTPInput;
