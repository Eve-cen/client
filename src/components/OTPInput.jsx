import React, { useState, useRef } from "react";
import Button from "./Button";

const OTP_LENGTH = 6;

const OTPInput = ({ email, onVerify }) => {
  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(""));
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const inputs = useRef([]);

  const handleChange = (e, index) => {
    const value = e.target.value;

    if (/^[0-9]$/.test(value) || value === "") {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      // move forward
      if (value && index < OTP_LENGTH - 1) {
        inputs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyDown = (e, index) => {
    // move backward on empty backspace
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }

    // optional: allow arrow navigation
    if (e.key === "ArrowLeft" && index > 0) {
      inputs.current[index - 1]?.focus();
    }
    if (e.key === "ArrowRight" && index < OTP_LENGTH - 1) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData("text").slice(0, OTP_LENGTH);
    if (!/^\d+$/.test(pasted)) return;

    const newOtp = pasted.split("");
    while (newOtp.length < OTP_LENGTH) newOtp.push("");

    setOtp(newOtp);

    // focus last filled input
    const lastIndex = Math.min(pasted.length - 1, OTP_LENGTH - 1);
    inputs.current[lastIndex]?.focus();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpValue = otp.join("");

    if (otpValue.length !== OTP_LENGTH) {
      setError(`Please enter the ${OTP_LENGTH}-digit OTP`);
      return;
    }

    setLoading(true);
    setError("");

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

      <div className="flex justify-center gap-3 mb-6" onPaste={handlePaste}>
        {otp.map((digit, index) => (
          <input
            key={index}
            type="text"
            inputMode="numeric"
            maxLength="1"
            value={digit}
            onChange={(e) => handleChange(e, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            ref={(el) => (inputs.current[index] = el)}
            className="w-14 h-14 text-center text-xl border-2 border-gray-300 rounded-xl focus:border-[#305CDE] focus:ring-2 focus:ring-[#305CDE] outline-none transition"
          />
        ))}
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="w-full bg-[#305CDE] hover:bg-blue-700 text-white py-3 rounded-xl font-semibold transition"
      >
        {loading ? "Verifying..." : "Verify OTP"}
      </Button>

      <p className="mt-4 text-center text-gray-500 text-sm">
        Didn’t receive the code?{" "}
        <button type="button" className="text-[#305CDE] underline">
          Resend
        </button>
      </p>
    </form>
  );
};

export default OTPInput;
