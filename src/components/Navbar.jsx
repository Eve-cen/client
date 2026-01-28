// import React, { useRef, useState, useEffect } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import Modal from "./Modal";
// import AuthForm from "./AuthForm";
// import ForgotPassword from "../pages/ForgotPassword";
// import { HiMenu, HiX, HiChevronDown } from "react-icons/hi";
// import { apiFetch } from "../utils/api";

// const Navbar = () => {
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [isForgotPassword, setIsForgotPassword] = useState(false);
//   const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
//   const [isProfileOpen, setIsProfileOpen] = useState(false);
//   const [currentUser, setCurrentUser] = useState(null);

//   const navigate = useNavigate();

//   useEffect(() => {
//     const fetchUser = async () => {
//       const token = localStorage.getItem("token");

//       if (!token) {
//         setCurrentUser(null);
//         return;
//       }

//       try {
//         const response = await fetch(
//           `${import.meta.env.VITE_API_URL}/auth/me`,
//           {
//             method: "GET",
//             headers: {
//               "Content-Type": "application/json",
//               Authorization: `Bearer ${token}`,
//             },
//           }
//         );

//         if (!response.ok || !response.status === "401") {
//           // Token expired or invalid
//           setCurrentUser(null);
//           return;
//         }

//         const user = await response.json();
//         setCurrentUser(user);
//       } catch (error) {
//         console.error("Auth check failed:", error);
//         setCurrentUser(null);
//       }
//     };

//     fetchUser();
//   }, []);

//   const profileRef = useRef(null);

//   useEffect(() => {
//     const handleClickOutside = (e) => {
//       if (profileRef.current && !profileRef.current.contains(e.target)) {
//         setIsProfileOpen(false);
//       }
//     };

//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, []);

//   const handleAuthSuccess = () => {
//     setIsModalOpen(false);
//     navigate("/");
//     window.location.reload(); // ensures navbar refresh after login
//   };

//   const avatar = currentUser?.profileImage;

//   return (
//     <nav className="w-full z-50">
//       <div className="container mx-auto px-4 py-4 flex justify-between items-center">
//         {/* Logo */}
//         <Link to="/" className="cursor-pointer">
//           <img src="/logo-blue.png" className="w-[10rem]" />
//         </Link>

//         {/* Desktop Navigation */}
//         <div className="hidden md:flex items-center space-x-6">
//           {currentUser ? (
//             <div ref={profileRef} className="relative">
//               <button
//                 onClick={() => setIsProfileOpen((prev) => !prev)}
//                 className="cursor-pointer hover:bg-white/20 p-2 rounded-lg flex items-center gap-2 focus:outline-none"
//               >
//                 <img
//                   src={avatar}
//                   alt="Profile"
//                   className="w-10 h-10 rounded-full object-cover"
//                 />

//                 <HiChevronDown
//                   className={`text-primary transition-transform duration-200 ${
//                     isProfileOpen ? "rotate-180" : ""
//                   }`}
//                 />
//               </button>

//               {isProfileOpen && (
//                 <div className="absolute right-0 mt-3 w-52 bg-white rounded-xl shadow-lg overflow-hidden z-50">
//                   <Link
//                     to="/create-space"
//                     className="block px-4 py-3 hover:bg-blue-50"
//                     onClick={() => setIsProfileOpen(false)}
//                   >
//                     Publish your space
//                   </Link>

//                   <Link
//                     to="/my-listings"
//                     className="block px-4 py-3 hover:bg-blue-50"
//                     onClick={() => setIsProfileOpen(false)}
//                   >
//                     My Listings
//                   </Link>

//                   <Link
//                     to="/profile/about"
//                     className="block px-4 py-3 hover:bg-blue-50"
//                     onClick={() => setIsProfileOpen(false)}
//                   >
//                     Profile
//                   </Link>

//                   <Link
//                     to="/settings/personal"
//                     className="block px-4 py-3 hover:bg-blue-50"
//                     onClick={() => setIsProfileOpen(false)}
//                   >
//                     Settings
//                   </Link>
//                 </div>
//               )}
//             </div>
//           ) : (
//             <>
//               <Link
//                 to="/create-space"
//                 className="text-primary cursor-pointer"
//                 onClick={() => setIsProfileOpen(false)}
//               >
//                 Publish your space
//               </Link>
//               <Link to="/login" className="text-primary cursor-pointer">
//                 Login/Signup
//               </Link>
//             </>
//           )}
//         </div>

//         {/* Mobile Hamburger */}
//         <button
//           className="cursor-pointer md:hidden text-2xl text-primary"
//           onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
//         >
//           {isMobileMenuOpen ? <HiX /> : <HiMenu />}
//         </button>
//       </div>

//       {/* Mobile Menu */}
//       {isMobileMenuOpen && (
//         <div className="md:hidden border-t bg-white shadow-lg">
//           <div className="flex flex-col px-6 py-4 space-y-3">
//             {!currentUser ? (
//               <>
//                 <Link
//                   to="/create-space"
//                   className="block px-4 py-3 hover:bg-blue-50"
//                   onClick={() => setIsProfileOpen(false)}
//                 >
//                   Publish your space
//                 </Link>
//                 <button
//                   className="cursor-pointer hover:text-primary"
//                   onClick={() => setIsModalOpen(true)}
//                 >
//                   Login / Sign Up
//                 </button>
//               </>
//             ) : (
//               <>
//                 <Link to="/create-space" className="hover:text-primary">
//                   Publish your space
//                 </Link>
//                 <Link to="/my-listings" className="hover:text-primary">
//                   My Listings
//                 </Link>
//                 <Link to="/profile/about" className="hover:text-primary">
//                   Profile
//                 </Link>
//                 <Link to="/profile/settings" className="hover:text-primary">
//                   Settings
//                 </Link>
//               </>
//             )}
//           </div>
//         </div>
//       )}

//       {/* Auth Modal */}
//       <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
//         {isForgotPassword ? (
//           <ForgotPassword onBackToLogin={() => setIsForgotPassword(false)} />
//         ) : (
//           <AuthForm
//             onForgotPassword={() => setIsForgotPassword(true)}
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
        localStorage.removeItem("currentUser");
        return;
      }

      // Check if user data exists in localStorage first
      const storedUser = localStorage.getItem("currentUser");
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setCurrentUser(parsedUser);
          return; // Skip API call if we have cached user data
        } catch (error) {
          console.error("Failed to parse stored user:", error);
          localStorage.removeItem("currentUser");
        }
      }

      // If no stored user, fetch from API
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/auth/me`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok || response.status === 401) {
          setCurrentUser(null);
          localStorage.removeItem("currentUser");
          localStorage.removeItem("token");
          return;
        }

        const user = await response.json();
        setCurrentUser(user);

        // Store user data in localStorage
        localStorage.setItem("currentUser", JSON.stringify(user));
      } catch (error) {
        console.error("Auth check failed:", error);
        setCurrentUser(null);
        localStorage.removeItem("currentUser");
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

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("currentUser");
    setCurrentUser(null);
    setIsProfileOpen(false);
    navigate("/");
  };

  const avatar = currentUser?.profileImage;

  return (
    <nav className="w-full z-50">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="cursor-pointer">
          <img src="/logo-blue.png" className="w-[10rem]" />
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
                  className={`text-primary transition-transform duration-200 ${
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

                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-3 hover:bg-blue-50 text-red-600"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link
                to="/create-space"
                className="text-primary cursor-pointer"
                onClick={() => setIsProfileOpen(false)}
              >
                Publish your space
              </Link>
              <Link to="/login" className="text-primary cursor-pointer">
                Login/Signup
              </Link>
            </>
          )}
        </div>

        {/* Mobile Hamburger */}
        <button
          className="cursor-pointer md:hidden text-2xl text-primary"
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
              <>
                <Link
                  to="/create-space"
                  className="block px-4 py-3 hover:bg-blue-50"
                  onClick={() => setIsProfileOpen(false)}
                >
                  Publish your space
                </Link>
                <button
                  className="cursor-pointer hover:text-primary"
                  onClick={() => setIsModalOpen(true)}
                >
                  Login / Sign Up
                </button>
              </>
            ) : (
              <>
                <Link to="/create-space" className="hover:text-primary">
                  Publish your space
                </Link>
                <Link to="/my-listings" className="hover:text-primary">
                  My Listings
                </Link>
                <Link to="/profile/about" className="hover:text-primary">
                  Profile
                </Link>
                <Link to="/profile/settings" className="hover:text-primary">
                  Settings
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-left hover:text-red-600"
                >
                  Logout
                </button>
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
