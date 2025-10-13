import React, { useState } from "react";
import Input from "../components/Input";
import Button from "../components/Button";
import OTPInput from "../components/OTPInput";
import { apiFetch } from "../utils/api";

const ForgotPassword = ({ onBackToLogin }) => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await apiFetch({
        endpoint: "/auth/forgot-password",
        method: "POST",
        body: { email },
      });
      setStep(2);
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleOTPVerify = async (otp) => {
    try {
      await apiFetch({
        endpoint: "/auth/verify-otp",
        method: "POST",
        body: { email, otp },
      });
      setStep(3);
    } catch (err) {
      throw err;
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await apiFetch({
        endpoint: "/auth/reset-password",
        method: "POST",
        body: { email, password, confirmPassword },
      });
      onBackToLogin();
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      {step === 1 && (
        <>
          <h2 className="text-2xl font-bold mb-6 text-center">
            Forgot Password
          </h2>
          {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
          <form onSubmit={handleEmailSubmit}>
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Sending..." : "Send OTP"}
            </Button>
            <p
              className="mt-4 text-blue-600 cursor-pointer text-center"
              onClick={onBackToLogin}
            >
              Back to Login
            </p>
          </form>
        </>
      )}
      {step === 2 && <OTPInput email={email} onVerify={handleOTPVerify} />}
      {step === 3 && (
        <>
          <h2 className="text-2xl font-bold mb-6 text-center">
            Reset Password
          </h2>
          {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
          <form onSubmit={handlePasswordReset}>
            <Input
              label="New Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Input
              label="Confirm Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Resetting..." : "Reset Password"}
            </Button>
            <p
              className="mt-4 text-blue-600 cursor-pointer text-center"
              onClick={onBackToLogin}
            >
              Back to Login
            </p>
          </form>
        </>
      )}{" "}
    </div>
  );
};

export default ForgotPassword;
