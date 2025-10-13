import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Modal from "./Modal";
import AuthForm from "./AuthForm";
import ForgotPassword from "../pages/ForgotPassword";
import Button from "./Button";

const Navbar = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const handleAuthSuccess = () => {
    setIsModalOpen(false);
    navigate("/");
  };

  const handleForgotPasswordClick = () => {
    setIsForgotPassword(true);
  };

  return (
    <nav className="shadow-md w-full z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="text-2xl font-bold text-blue-500">
          EvenCen
        </Link>

        {/* Auth Buttons */}
        <div className="space-x-4">
          <Link to="/space-listing">List your Event Center</Link>
          {!token && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="text-blue-500 hover:underline"
            >
              Login / Sign Up
            </button>
          )}
        </div>

        {/* Modal for Auth */}
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
    </nav>
  );
};

export default Navbar;
