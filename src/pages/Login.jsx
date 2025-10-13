import React, { useState } from "react";
import AuthForm from "../components/AuthForm";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [forgotPassword, setForgotPassword] = useState(false);
  const navigate = useNavigate();

  const handleForgotPassword = () => {
    setForgotPassword(true);
    navigate("/forgot-password");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <AuthForm onForgotPassword={handleForgotPassword} />
    </div>
  );
};

export default Login;
