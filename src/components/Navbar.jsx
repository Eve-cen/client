// import React, { useState } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import Modal from "./Modal";
// import AuthForm from "./AuthForm";
// import ForgotPassword from "../pages/ForgotPassword";
// import { HiMenu, HiX } from "react-icons/hi";

// const Navbar = () => {
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [isForgotPassword, setIsForgotPassword] = useState(false);
//   const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
//   const navigate = useNavigate();
//   const token = localStorage.getItem("token");

//   const handleAuthSuccess = () => {
//     setIsModalOpen(false);
//     navigate("/");
//   };

//   const handleForgotPasswordClick = () => {
//     setIsForgotPassword(true);
//   };

//   const toggleMobileMenu = () => setIsMobileMenuOpen((prev) => !prev);

//   return (
//     <nav className="w-full z-50">
//       <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
//         {/* Logo */}
//         <Link to="/" className="text-2xl font-bold text-[#305CDE]">
//           EvenCen
//         </Link>

//         {/* Desktop Links */}
//         <div className="hidden md:flex space-x-4 items-center">
//           <Link to="/create-space" className="text-[#305CDE] hover:underline">
//             Publish Your Space
//           </Link>
//           {!token ? (
//             <button
//               onClick={() => setIsModalOpen(true)}
//               className="text-[#305CDE] hover:underline"
//             >
//               Login / Sign Up
//             </button>
//           ) : (
//             <>
//               <Link
//                 to="/my-listings"
//                 className="text-[#305CDE] hover:underline"
//               >
//                 My Listings
//               </Link>
//               <Link
//                 to="/profile/about"
//                 className="text-[#305CDE] hover:underline"
//               >
//                 Profile
//               </Link>
//             </>
//           )}
//         </div>

//         {/* Hamburger Icon */}
//         <button
//           className="md:hidden text-2xl text-[#305CDE] cursor-pointer"
//           onClick={toggleMobileMenu}
//         >
//           {isMobileMenuOpen ? <HiX /> : <HiMenu />}
//         </button>
//       </div>
//       <hr />
//       {/* Mobile Menu */}
//       {isMobileMenuOpen && (
//         <div className="md:hidden bg-white shadow-lg rounded-b-xl border-t border-gray-100 overflow-hidden transform transition-all duration-300 ease-out">
//           <div className="flex flex-col px-6 py-4 space-y-3">
//             <Link
//               to="/create-space"
//               className="text-[#305CDE] font-medium hover:bg-blue-50 px-3 py-2 rounded-lg transition"
//               onClick={() => setIsMobileMenuOpen(false)}
//             >
//               List your Event Center
//             </Link>

//             {!token ? (
//               <button
//                 onClick={() => {
//                   setIsModalOpen(true);
//                   setIsMobileMenuOpen(false);
//                 }}
//                 className="text-[#305CDE] font-medium hover:bg-blue-50 px-3 py-2 rounded-lg text-left transition"
//               >
//                 Login / Sign Up
//               </button>
//             ) : (
//               <>
//                 <Link
//                   to="/my-listings"
//                   className="text-[#305CDE] font-medium hover:bg-blue-50 px-3 py-2 rounded-lg transition"
//                   onClick={() => setIsMobileMenuOpen(false)}
//                 >
//                   My Listings
//                 </Link>
//                 <Link
//                   to="/profile/about"
//                   className="text-[#305CDE] font-medium hover:bg-blue-50 px-3 py-2 rounded-lg transition"
//                   onClick={() => setIsMobileMenuOpen(false)}
//                 >
//                   Profile
//                 </Link>
//               </>
//             )}
//           </div>
//         </div>
//       )}

//       {/* Modal for Auth */}
//       <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
//         {isForgotPassword ? (
//           <ForgotPassword onBackToLogin={() => setIsForgotPassword(false)} />
//         ) : (
//           <AuthForm
//             onForgotPassword={handleForgotPasswordClick}
//             onSuccess={handleAuthSuccess}
//           />
//         )}
//       </Modal>
//     </nav>
//   );
// };

// export default Navbar;

import React, { useRef, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Modal from "./Modal";
import AuthForm from "./AuthForm";
import ForgotPassword from "../pages/ForgotPassword";
import { HiMenu, HiX, HiChevronDown } from "react-icons/hi";
import { apiFetch } from "../utils/api";

const Navbar = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setCurrentUser(null);
        return;
      }

      try {
        const response = await fetch(
          `https://evencen.onrender.com/api/auth/me`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok || !response.status === "401") {
          // Token expired or invalid
          console.log("not logged in");
          setCurrentUser(null);
          return;
        }

        const user = await response.json();
        setCurrentUser(user);
      } catch (error) {
        console.error("Auth check failed:", error);
        setCurrentUser(null);
      }
    };

    fetchUser();
  }, []);

  const profileRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAuthSuccess = () => {
    setIsModalOpen(false);
    navigate("/");
    window.location.reload(); // ensures navbar refresh after login
  };

  const avatar = currentUser?.profileImage;

  return (
    <nav className="w-full z-50">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        {/* Logo */}
        <Link
          to="/"
          className="text-2xl font-bold text-[#305CDE] cursor-pointer"
        >
          EvenCen
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-6">
          {currentUser ? (
            <div ref={profileRef} className="relative">
              <button
                onClick={() => setIsProfileOpen((prev) => !prev)}
                className="cursor-pointer hover:bg-white/20 p-2 rounded-lg flex items-center gap-2 focus:outline-none"
              >
                <img
                  src={avatar}
                  alt="Profile"
                  className="w-10 h-10 rounded-full object-cover"
                />

                <HiChevronDown
                  className={`text-[#305CDE] transition-transform duration-200 ${
                    isProfileOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-3 w-52 bg-white rounded-xl shadow-lg overflow-hidden z-50">
                  <Link
                    to="/create-space"
                    className="block px-4 py-3 hover:bg-blue-50"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    Publish your space
                  </Link>

                  <Link
                    to="/my-listings"
                    className="block px-4 py-3 hover:bg-blue-50"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    My Listings
                  </Link>

                  <Link
                    to="/profile/about"
                    className="block px-4 py-3 hover:bg-blue-50"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    Profile
                  </Link>

                  <Link
                    to="/settings/personal"
                    className="block px-4 py-3 hover:bg-blue-50"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    Settings
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="text-[#305CDE] cursor-pointer">
              Login/Signup
            </Link>
          )}
        </div>

        {/* Mobile Hamburger */}
        <button
          className="cursor-pointer md:hidden text-2xl text-[#305CDE]"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <HiX /> : <HiMenu />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t bg-white shadow-lg">
          <div className="flex flex-col px-6 py-4 space-y-3">
            {!currentUser ? (
              <button
                className="cursor-pointer hover:text-[#305CDE]"
                onClick={() => setIsModalOpen(true)}
              >
                Login / Sign Up
              </button>
            ) : (
              <>
                <Link to="/create-space" className="hover:text-[#305CDE]">
                  Publish your space
                </Link>
                <Link to="/my-listings" className="hover:text-[#305CDE]">
                  My Listings
                </Link>
                <Link to="/profile/about" className="hover:text-[#305CDE]">
                  Profile
                </Link>
                <Link to="/profile/settings" className="hover:text-[#305CDE]">
                  Settings
                </Link>
              </>
            )}
          </div>
        </div>
      )}

      {/* Auth Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        {isForgotPassword ? (
          <ForgotPassword onBackToLogin={() => setIsForgotPassword(false)} />
        ) : (
          <AuthForm
            onForgotPassword={() => setIsForgotPassword(true)}
            onSuccess={handleAuthSuccess}
          />
        )}
      </Modal>
    </nav>
  );
};

export default Navbar;
