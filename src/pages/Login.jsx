import React, { useState } from "react";
import AuthForm from "../components/AuthForm";
import { useNavigate } from "react-router-dom";
import Modal from "../components/Modal";
import ForgotPassword from "./ForgotPassword";

const Login = () => {
  const [isModalOpen, setIsModalOpen] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const navigate = useNavigate();

  const handleAuthSuccess = () => {
    setIsModalOpen(false);
    navigate("/");
  };

  const handleForgotPasswordClick = () => {
    setIsForgotPassword(true);
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        {isForgotPassword ? (
          <ForgotPassword onBackToLogin={() => setIsForgotPassword(false)} />
        ) : (
          <AuthForm
            onForgotPassword={handleForgotPasswordClick}
            onSuccess={handleAuthSuccess}
          />
        )}
      </Modal>
    </div>
  );
};

export default Login;
