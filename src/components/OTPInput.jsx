import React, { useState, useRef, useEffect } from "react";
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
      setError("Please enter a 4-digit OTP");
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
    <form onSubmit={handleSubmit} className="max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-center">Enter OTP</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <div className="flex gap-5 mx-auto mb-6">
        {otp.map((digit, index) => (
          <input
            key={index}
            type="text"
            maxLength="1"
            value={digit}
            onChange={(e) => handleChange(e, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            ref={(el) => (inputs.current[index] = el)}
            className="w-14 h-14 text-center text-lg border rounded-lg focus:ring-blue-500 focus:border-blue-500"
          />
        ))}
      </div>
      <Button type="submit" disabled={loading}>
        {loading ? "Verifying..." : "Verify OTP"}
      </Button>
    </form>
  );
};

export default OTPInput;
