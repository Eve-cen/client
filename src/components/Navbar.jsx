// import React, { useState } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import Modal from "./Modal";
// import AuthForm from "./AuthForm";
// import ForgotPassword from "../pages/ForgotPassword";
// import Button from "./Button";

// const Navbar = () => {
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [isForgotPassword, setIsForgotPassword] = useState(false);
//   const navigate = useNavigate();
//   const token = localStorage.getItem("token");

//   const handleAuthSuccess = () => {
//     setIsModalOpen(false);
//     navigate("/");
//   };

//   const handleForgotPasswordClick = () => {
//     setIsForgotPassword(true);
//   };

//   return (
//     <nav className="border-b border-b-gray-100 w-full z-50">
//       <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
//         {/* Logo */}
//         <Link to="/" className="text-2xl font-bold text-[#305CDE]">
//           EvenCen
//         </Link>

//         {/* Auth Buttons */}
//         <div className="space-x-4">
//           <Link to="/create-space">List your Event Center</Link>
//           {!token ? (
//             <button
//               onClick={() => setIsModalOpen(true)}
//               className="text-[#305CDE] hover:underline"
//             >
//               Login / Sign Up
//             </button>
//           ) : (
//             <>
//               <Link to="/my-listings" className="">
//                 My Listings
//               </Link>
//               <Link to="/profile/about" className="">
//                 Profile
//               </Link>
//             </>
//           )}
//         </div>

//         {/* Modal for Auth */}
//         <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
//           {isForgotPassword ? (
//             <ForgotPassword onBackToLogin={() => setIsForgotPassword(false)} />
//           ) : (
//             <AuthForm
//               onForgotPassword={handleForgotPasswordClick}
//               onSuccess={handleAuthSuccess}
//             />
//           )}
//         </Modal>
//       </div>
//     </nav>
//   );
// };

// export default Navbar;

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Modal from "./Modal";
import AuthForm from "./AuthForm";
import ForgotPassword from "../pages/ForgotPassword";
import { HiMenu, HiX } from "react-icons/hi";

const Navbar = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const handleAuthSuccess = () => {
    setIsModalOpen(false);
    navigate("/");
  };

  const handleForgotPasswordClick = () => {
    setIsForgotPassword(true);
  };

  const toggleMobileMenu = () => setIsMobileMenuOpen((prev) => !prev);

  return (
    <nav className="w-full z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="text-2xl font-bold text-[#305CDE]">
          EvenCen
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex space-x-4 items-center">
          <Link to="/create-space" className="text-[#305CDE] hover:underline">
            List your Event Center
          </Link>
          {!token ? (
            <button
              onClick={() => setIsModalOpen(true)}
              className="text-[#305CDE] hover:underline"
            >
              Login / Sign Up
            </button>
          ) : (
            <>
              <Link
                to="/my-listings"
                className="text-[#305CDE] hover:underline"
              >
                My Listings
              </Link>
              <Link
                to="/profile/about"
                className="text-[#305CDE] hover:underline"
              >
                Profile
              </Link>
            </>
          )}
        </div>

        {/* Hamburger Icon */}
        <button
          className="md:hidden text-2xl text-[#305CDE] cursor-pointer"
          onClick={toggleMobileMenu}
        >
          {isMobileMenuOpen ? <HiX /> : <HiMenu />}
        </button>
      </div>
      <hr />
      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white shadow-lg rounded-b-xl border-t border-gray-100 overflow-hidden transform transition-all duration-300 ease-out">
          <div className="flex flex-col px-6 py-4 space-y-3">
            <Link
              to="/create-space"
              className="text-[#305CDE] font-medium hover:bg-blue-50 px-3 py-2 rounded-lg transition"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              List your Event Center
            </Link>

            {!token ? (
              <button
                onClick={() => {
                  setIsModalOpen(true);
                  setIsMobileMenuOpen(false);
                }}
                className="text-[#305CDE] font-medium hover:bg-blue-50 px-3 py-2 rounded-lg text-left transition"
              >
                Login / Sign Up
              </button>
            ) : (
              <>
                <Link
                  to="/my-listings"
                  className="text-[#305CDE] font-medium hover:bg-blue-50 px-3 py-2 rounded-lg transition"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  My Listings
                </Link>
                <Link
                  to="/profile/about"
                  className="text-[#305CDE] font-medium hover:bg-blue-50 px-3 py-2 rounded-lg transition"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Profile
                </Link>
              </>
            )}
          </div>
        </div>
      )}

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
    </nav>
  );
};

export default Navbar;
