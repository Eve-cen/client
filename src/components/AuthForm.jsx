// import React, { useState, useEffect } from "react";
// import Input from "./Input";
// import Button from "./Button";
// import { Link, useLocation, useNavigate } from "react-router-dom";
// import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
// import AppleSignin from "react-apple-signin-auth";
// import FacebookLogin from "@greatsumini/react-facebook-login";
// import { apiFetch } from "../utils/api";
// import { toast, ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import CustomToast from "./CustomToast";

// const AuthForm = ({ onForgotPassword, onSuccess }) => {
//   const { pathname } = useLocation();
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [showPassword, setShowPassword] = useState(false);
//   const [rememberMe, setRememberMe] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [errors, setErrors] = useState({ email: "", password: "" });
//   const [touched, setTouched] = useState({ email: false, password: false });
//   const navigate = useNavigate();

//   // Password strength calculation
//   const calculateStrength = (pass) => {
//     let strength = 0;
//     const checks = [
//       { regex: /.{8,}/, label: "At least 8 characters" },
//       { regex: /[A-Z]/, label: "One uppercase letter" },
//       { regex: /[a-z]/, label: "One lowercase letter" },
//       { regex: /[0-9]/, label: "One number" },
//       { regex: /[^A-Za-z0-9]/, label: "One symbol" },
//     ];

//     checks.forEach((check) => {
//       if (check.regex.test(pass)) strength += 20;
//     });

//     return { score: strength, checks };
//   };

//   const { score, checks } = calculateStrength(password);
//   const strengthColor =
//     score < 40 ? "bg-red-500" : score < 70 ? "bg-yellow-500" : "bg-green-500";
//   const strengthText = score < 40 ? "Weak" : score < 70 ? "Medium" : "Strong";

//   // Validation rules
//   const validateEmail = (value) => {
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     return value && !emailRegex.test(value) ? "Invalid email address" : "";
//   };

//   const validatePassword = (value) => {
//     return value.length < 8 ? "Password must be at least 8 characters" : "";
//   };

//   // Real-time validation
//   useEffect(() => {
//     if (touched.email) {
//       setErrors((prev) => ({ ...prev, email: validateEmail(email) }));
//     }
//     if (touched.password) {
//       setErrors((prev) => ({ ...prev, password: validatePassword(password) }));
//     }
//   }, [email, password, touched]);

//   // Form validity
//   const isFormValid = () => {
//     return (
//       email && password && !errors.email && !errors.password && score === 100
//     );
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setErrors({
//       email: validateEmail(email),
//       password: validatePassword(password),
//     });
//     setTouched({ email: true, password: true });

//     if (!isFormValid()) {
//       toast.error(<CustomToast message="Please fix the errors below" />, {
//         className: "custom-toast-error",
//       });
//       return;
//     }

//     setLoading(true);
//     try {
//       const data = await apiFetch({
//         endpoint: "/auth/login",
//         method: "POST",
//         body: { email, password },
//       });

//       localStorage.setItem("token", data.token);
//       if (rememberMe) {
//         localStorage.setItem("rememberedEmail", email);
//       } else {
//         localStorage.removeItem("rememberedEmail");
//       }

//       toast.success(<CustomToast message="Login successful!" />, {
//         className: "custom-toast-success",
//       });

//       // Wait 2 seconds before navigating
//       setTimeout(() => {
//         onSuccess();
//         navigate("/", { replace: true });
//       }, 2000);
//     } catch (err) {
//       toast.error(<CustomToast message={err.message || "Login failed"} />);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleGoogleSuccess = async (credentialResponse) => {
//     setError("");
//     setLoading(true);

//     try {
//       const data = await apiFetch({
//         endpoint: "/auth/google",
//         method: "POST",
//         body: { token: credentialResponse.credential },
//       });
//       localStorage.setItem("token", data.token);
//       onSuccess();
//       navigate("/");
//     } catch (err) {
//       setError(err.message || "Google login failed");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleFacebookResponse = async (response) => {
//     if (response.accessToken) {
//       setError("");
//       setLoading(true);

//       try {
//         const data = await apiFetch({
//           endpoint: "/auth/facebook",
//           method: "POST",
//           body: { accessToken: response.accessToken, userID: response.userID },
//         });
//         localStorage.setItem("token", data.token);
//         onSuccess();
//         navigate("/");
//       } catch (err) {
//         setError(err.message || "Facebook login failed");
//       } finally {
//         setLoading(false);
//       }
//     }
//   };

//   const handleAppleSuccess = async (response) => {
//     setError("");
//     setLoading(true);

//     try {
//       const data = await apiFetch({
//         endpoint: "/auth/apple",
//         method: "POST",
//         body: { id_token: response.authorization.id_token },
//       });
//       localStorage.setItem("token", data.token);
//       onSuccess();
//       navigate("/");
//     } catch (err) {
//       setError(err.message || "Apple login failed");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Autofill detection & pre-fill remembered email
//   useEffect(() => {
//     const remembered = localStorage.getItem("rememberedEmail");
//     if (remembered) {
//       setEmail(remembered);
//       setRememberMe(true);
//     }
//   }, []);

//   return (
//     <>
//       <ToastContainer
//         position="top-right"
//         autoClose={4000}
//         hideProgressBar
//         closeOnClick
//         rtl={false}
//         pauseOnFocusLoss
//         draggable
//         pauseOnHover
//         theme="light"
//       />

//       <div className="w-full text-black max-w-md mx-auto">
//         {pathname === "/login" ? (
//           <h2 className="text-3xl font-bold mb-8 text-center text-gray-800">
//             Welcome back to Vencome
//           </h2>
//         ) : (
//           <h2 className="text-3xl font-bold mb-8 text-center text-gray-800">
//             Welcome to Vencome
//           </h2>
//         )}

//         <form onSubmit={handleSubmit} className="space-y-6">
//           <div>
//             <Input
//               label="Email"
//               type="email"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               onBlur={() => setTouched((prev) => ({ ...prev, email: true }))}
//               placeholder="you@example.com"
//               required
//               error={touched.email && errors.email}
//               shake={touched.email && !!errors.email}
//             />
//           </div>

//           <div className="relative">
//             <Input
//               label="Password"
//               type={showPassword ? "text" : "password"}
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               onBlur={() => setTouched((prev) => ({ ...prev, password: true }))}
//               placeholder="••••••••"
//               required
//               error={touched.password && errors.password}
//               shake={touched.password && !!errors.password}
//             />

//             {/* Show/Hide Toggle */}
//             <button
//               type="button"
//               onClick={() => setShowPassword(!showPassword)}
//               className="absolute right-3 top-10 text-gray-500 hover:text-gray-700 text-sm"
//             >
//               {showPassword ? "Hide" : "Show"}
//             </button>

//             {/* Password Strength Meter */}
//             {password && (
//               <div className="mt-3 space-y-2">
//                 <div className="flex items-center justify-between text-sm">
//                   <span className="font-medium">Password Strength:</span>
//                   <span
//                     className={`font-bold ${
//                       score < 40
//                         ? "text-red-600"
//                         : score < 70
//                         ? "text-yellow-600"
//                         : "text-green-600"
//                     }`}
//                   >
//                     {strengthText}
//                   </span>
//                 </div>
//                 <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
//                   <div
//                     className={`h-full ${strengthColor} transition-all duration-500 ease-out`}
//                     style={{ width: `${score}%` }}
//                   />
//                 </div>

//                 {/* Tooltip Rules */}
//                 <div className="text-xs text-gray-500 space-y-1 mt-2 border-l-4 border-gray-300 pl-3">
//                   {checks.map((check, i) => (
//                     <div
//                       key={i}
//                       className={`flex items-center gap-2 transition-all ${
//                         check.regex.test(password)
//                           ? "text-green-600"
//                           : "text-gray-400"
//                       }`}
//                     >
//                       <span>{check.regex.test(password) ? "✔" : "✖"}</span>
//                       <span>{check.label}</span>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             )}
//           </div>

//           <div className="flex items-center justify-between">
//             <label className="flex items-center gap-2 cursor-pointer">
//               <input
//                 type="checkbox"
//                 checked={rememberMe}
//                 onChange={(e) => setRememberMe(e.target.checked)}
//                 className="w-4 h-4 text-primary rounded focus:ring-primary"
//               />
//               <span className="text-sm text-gray-600">Remember me</span>
//             </label>

//             <button
//               type="button"
//               onClick={onForgotPassword}
//               className="text-sm text-primary hover:underline"
//             >
//               Forgot Password?
//             </button>
//           </div>

//           {pathname === "/login" ? (
//             <Button
//               type="submit"
//               disabled={loading || !isFormValid()}
//               className={`w-full font-medium transition-all ${
//                 isFormValid() && !loading
//                   ? "bg-primary hover:bg-primary text-white"
//                   : "bg-gray-300 text-gray-500 cursor-not-allowed"
//               }`}
//             >
//               {loading ? (
//                 <span className="flex items-center justify-center gap-2">
//                   <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
//                     <circle
//                       cx="12"
//                       cy="12"
//                       r="10"
//                       stroke="currentColor"
//                       strokeWidth="4"
//                       fill="none"
//                     />
//                     <path fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
//                   </svg>
//                   Logging in...
//                 </span>
//               ) : (
//                 "Login"
//               )}
//             </Button>
//           ) : (
//             <Button
//               type="submit"
//               disabled={loading || !isFormValid()}
//               className={`w-full font-medium transition-all ${
//                 isFormValid() && !loading
//                   ? "bg-primary hover:bg-primary text-white"
//                   : "bg-gray-300 text-gray-500 cursor-not-allowed"
//               }`}
//             >
//               {loading ? (
//                 <span className="flex items-center justify-center gap-2">
//                   <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
//                     <circle
//                       cx="12"
//                       cy="12"
//                       r="10"
//                       stroke="currentColor"
//                       strokeWidth="4"
//                       fill="none"
//                     />
//                     <path fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
//                   </svg>
//                   Signing up...
//                 </span>
//               ) : (
//                 "Sign up"
//               )}
//             </Button>
//           )}
//         </form>
//         {pathname === "/login" ? (
//           <p className="text-center">
//             Not registered yet?{" "}
//             <Link to="/signup" className="text-primary">
//               Sign Up today!
//             </Link>
//           </p>
//         ) : (
//           <p className="text-center">
//             Already have an account?{" "}
//             <Link to="/login" className="text-primary">
//               Login!
//             </Link>
//           </p>
//         )}

//         {/* Divider */}
//         <div className="relative my-8">
//           <div className="absolute inset-0 flex items-center">
//             <div className="w-full border-t border-gray-300"></div>
//           </div>
//           <div className="relative flex justify-center text-sm">
//             <span className="px-4 bg-white text-gray-500 font-medium">
//               Or continue with
//             </span>
//           </div>
//         </div>

//         {/* OAuth Buttons */}
//         <div className="grid grid-cols-1 gap-3">
//           <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
//             <GoogleLogin
//               onSuccess={handleGoogleSuccess}
//               onError={() =>
//                 toast.error(<CustomToast message="Google login failed" />)
//               }
//               theme="outline"
//               size="large"
//               width="100%"
//             />
//           </GoogleOAuthProvider>

//           {/* <AppleSignin
//             authOptions={{
//               clientId: import.meta.VITE_APPLE_CLIENT_ID,
//               scope: "email",
//               redirectURI: "https://vencome.onrender.com",
//               state: "state",
//               nonce: "nonce",
//               usePopup: true,
//             }}
//             onSuccess={handleAppleSuccess}
//             onError={() => toast.error("Apple login failed")}
//             render={(renderProps) => (
//               <Button
//                 className="w-full flex items-center justify-center space-x-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
//                 onClick={renderProps.onClick}
//                 disabled={loading}
//               >
//                 <svg className="w-5 h-5" viewBox="0 0 24 24">
//                   <path
//                     fill="currentColor"
//                     d="M17.05 20.28c-.98.95-2.05.88-3.15.38-1.14-.52-2.18-.49-3.32 0-1.43.62-2.35.68-3.33-.38-2.65-2.87-2.38-7.62.45-10.24 1.4-1.29 3.06-1.95 4.7-1.95 1.62 0 2.58.64 3.83.64 1.29 0 2.36-.64 3.83-1.95 2.83-2.62 3.1 2.13.45 5-1.01.98-1.48 2.53-1.48 3.89 0 1.62.63 3.33 1.48 4.61zM13.1 3.95c-.76.95-2.01.89-2.86.38-.1-.06-.2-.12-.29-.19 0-1.14.38-2.36 1.14-3.23.95-1.1 2.53-1.81 3.71-1.81.1.06.19.12.29.19-.76 1.43-1.05 2.99-.99 4.66z"
//                   />
//                 </svg>
//                 <span>Sign in with Apple</span>
//               </Button>
//             )}
//           />

//           <FacebookLogin
//             appId={import.meta.VITE_FACEBOOK_APP_ID}
//             autoLoad={false}
//             fields="email"
//             callback={handleFacebookResponse}
//             render={(renderProps) => (
//               <Button
//                 className="w-full flex items-center justify-center space-x-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
//                 onClick={renderProps.onClick}
//                 disabled={loading}
//               >
//                 <svg className="w-5 h-5" viewBox="0 0 24 24">
//                   <path
//                     fill="currentColor"
//                     d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8v-6.9H7.9v-2.9H10V9.8c0-2.1 1.25-3.25 3.15-3.25.9 0 1.85.15 1.85.15v2.05h-1.04c-1.03 0-1.36.64-1.36 1.3v1.55h2.3l-.37 2.9h-1.93V21.8c4.56-.93 8-4.96 8-9.8z"
//                   />
//                 </svg>
//                 <span>Sign in with Facebook</span>
//               </Button>
//             )}
//           /> */}
//         </div>
//       </div>
//     </>
//   );
// };

// export default AuthForm;

import React, { useState, useEffect } from "react";
import Input from "./Input";
import Button from "./Button";
import OTPInput from "./OTPInput";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import AppleSignin from "react-apple-signin-auth";
import FacebookLogin from "@greatsumini/react-facebook-login";
import { apiFetch } from "../utils/api";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import CustomToast from "./CustomToast";

const AuthForm = ({ onForgotPassword, onSuccess }) => {
  const { pathname } = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({ email: "", password: "" });
  const [touched, setTouched] = useState({ email: false, password: false });
  const [step, setStep] = useState("credentials"); // "credentials" or "otp"
  const [isNewUser, setIsNewUser] = useState(false);
  const navigate = useNavigate();

  // Password strength calculation
  const calculateStrength = (pass) => {
    let strength = 0;
    const checks = [
      { regex: /.{8,}/, label: "At least 8 characters" },
      { regex: /[A-Z]/, label: "One uppercase letter" },
      { regex: /[a-z]/, label: "One lowercase letter" },
      { regex: /[0-9]/, label: "One number" },
      { regex: /[^A-Za-z0-9]/, label: "One symbol" },
    ];

    checks.forEach((check) => {
      if (check.regex.test(pass)) strength += 20;
    });

    return { score: strength, checks };
  };

  const { score, checks } = calculateStrength(password);
  const strengthColor =
    score < 40 ? "bg-red-500" : score < 70 ? "bg-yellow-500" : "bg-green-500";
  const strengthText = score < 40 ? "Weak" : score < 70 ? "Medium" : "Strong";

  // Validation rules
  const validateEmail = (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return value && !emailRegex.test(value) ? "Invalid email address" : "";
  };

  const validatePassword = (value) => {
    return value.length < 8 ? "Password must be at least 8 characters" : "";
  };

  // Real-time validation
  useEffect(() => {
    if (touched.email) {
      setErrors((prev) => ({ ...prev, email: validateEmail(email) }));
    }
    if (touched.password) {
      setErrors((prev) => ({ ...prev, password: validatePassword(password) }));
    }
  }, [email, password, touched]);

  // Form validity
  const isFormValid = () => {
    return (
      email && password && !errors.email && !errors.password && score === 100
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({
      email: validateEmail(email),
      password: validatePassword(password),
    });
    setTouched({ email: true, password: true });

    if (!isFormValid()) {
      toast.error(<CustomToast message="Please fix the errors below" />, {
        className: "custom-toast-error",
      });
      return;
    }

    setLoading(true);
    try {
      const data = await apiFetch({
        endpoint: "/auth/login",
        method: "POST",
        body: { email, password },
      });

      if (data.requiresVerification) {
        setIsNewUser(data.isNewUser);
        setStep("otp");
        toast.success(
          <CustomToast
            message={`OTP sent to ${email}. Please check your inbox.`}
          />,
          { className: "custom-toast-success" }
        );
      }
    } catch (err) {
      toast.error(<CustomToast message={err.message || "Login failed"} />);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (otpValue) => {
    const data = await apiFetch({
      endpoint: "/auth/verify-login",
      method: "POST",
      body: { email, otp: otpValue },
    });

    localStorage.setItem("token", data.token);
    if (rememberMe) {
      localStorage.setItem("rememberedEmail", email);
    } else {
      localStorage.removeItem("rememberedEmail");
    }

    toast.success(
      <CustomToast
        message={
          isNewUser ? "Account created successfully!" : "Login successful!"
        }
      />,
      { className: "custom-toast-success" }
    );

    // Wait 2 seconds before navigating
    setTimeout(() => {
      onSuccess();
      navigate("/", { replace: true });
    }, 2000);
  };

  const handleResendOTP = async () => {
    setLoading(true);
    try {
      await apiFetch({
        endpoint: "/auth/login",
        method: "POST",
        body: { email, password },
      });

      toast.success(<CustomToast message="OTP resent successfully!" />, {
        className: "custom-toast-success",
      });
    } catch (err) {
      toast.error(
        <CustomToast message={err.message || "Failed to resend OTP"} />
      );
    } finally {
      setLoading(false);
    }
  };

  const handleBackToCredentials = () => {
    setStep("credentials");
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);

    try {
      const data = await apiFetch({
        endpoint: "/auth/google",
        method: "POST",
        body: { token: credentialResponse.credential },
      });
      localStorage.setItem("token", data.token);
      onSuccess();
      navigate("/");
    } catch (err) {
      toast.error(
        <CustomToast message={err.message || "Google login failed"} />
      );
    } finally {
      setLoading(false);
    }
  };

  const handleFacebookResponse = async (response) => {
    if (response.accessToken) {
      setLoading(true);

      try {
        const data = await apiFetch({
          endpoint: "/auth/facebook",
          method: "POST",
          body: { accessToken: response.accessToken, userID: response.userID },
        });
        localStorage.setItem("token", data.token);
        onSuccess();
        navigate("/");
      } catch (err) {
        toast.error(
          <CustomToast message={err.message || "Facebook login failed"} />
        );
      } finally {
        setLoading(false);
      }
    }
  };

  const handleAppleSuccess = async (response) => {
    setLoading(true);

    try {
      const data = await apiFetch({
        endpoint: "/auth/apple",
        method: "POST",
        body: { id_token: response.authorization.id_token },
      });
      localStorage.setItem("token", data.token);
      onSuccess();
      navigate("/");
    } catch (err) {
      toast.error(
        <CustomToast message={err.message || "Apple login failed"} />
      );
    } finally {
      setLoading(false);
    }
  };

  // Autofill detection & pre-fill remembered email
  useEffect(() => {
    const remembered = localStorage.getItem("rememberedEmail");
    if (remembered) {
      setEmail(remembered);
      setRememberMe(true);
    }
  }, []);

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={4000}
        hideProgressBar
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />

      <div className="w-full text-black max-w-md mx-auto">
        {step === "credentials" ? (
          <>
            {pathname === "/login" ? (
              <h2 className="text-3xl font-bold mb-8 text-center text-gray-800">
                Welcome back to Vencome
              </h2>
            ) : (
              <h2 className="text-3xl font-bold mb-8 text-center text-gray-800">
                Welcome to Vencome
              </h2>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Input
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() =>
                    setTouched((prev) => ({ ...prev, email: true }))
                  }
                  placeholder="you@example.com"
                  required
                  error={touched.email && errors.email}
                  shake={touched.email && !!errors.email}
                />
              </div>

              <div className="relative">
                <Input
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onBlur={() =>
                    setTouched((prev) => ({ ...prev, password: true }))
                  }
                  placeholder="••••••••"
                  required
                  error={touched.password && errors.password}
                  shake={touched.password && !!errors.password}
                />

                {/* Show/Hide Toggle */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-10 text-gray-500 hover:text-gray-700 text-sm"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>

                {/* Password Strength Meter */}
                {password && (
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">Password Strength:</span>
                      <span
                        className={`font-bold ${
                          score < 40
                            ? "text-red-600"
                            : score < 70
                            ? "text-yellow-600"
                            : "text-green-600"
                        }`}
                      >
                        {strengthText}
                      </span>
                    </div>
                    <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${strengthColor} transition-all duration-500 ease-out`}
                        style={{ width: `${score}%` }}
                      />
                    </div>

                    {/* Tooltip Rules */}
                    <div className="text-xs text-gray-500 space-y-1 mt-2 border-l-4 border-gray-300 pl-3">
                      {checks.map((check, i) => (
                        <div
                          key={i}
                          className={`flex items-center gap-2 transition-all ${
                            check.regex.test(password)
                              ? "text-green-600"
                              : "text-gray-400"
                          }`}
                        >
                          <span>{check.regex.test(password) ? "✔" : "✖"}</span>
                          <span>{check.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 text-primary rounded focus:ring-primary"
                  />
                  <span className="text-sm text-gray-600">Remember me</span>
                </label>

                <button
                  type="button"
                  onClick={onForgotPassword}
                  className="text-sm text-primary hover:underline"
                >
                  Forgot Password?
                </button>
              </div>

              {pathname === "/login" ? (
                <Button
                  type="submit"
                  disabled={loading || !isFormValid()}
                  className={`w-full font-medium transition-all ${
                    isFormValid() && !loading
                      ? "bg-primary hover:bg-primary text-white"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
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
                      Processing...
                    </span>
                  ) : (
                    "Continue"
                  )}
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={loading || !isFormValid()}
                  className={`w-full font-medium transition-all ${
                    isFormValid() && !loading
                      ? "bg-primary hover:bg-primary text-white"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
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
                      Processing...
                    </span>
                  ) : (
                    "Continue"
                  )}
                </Button>
              )}
            </form>

            {pathname === "/login" ? (
              <p className="text-center mt-6">
                Not registered yet?{" "}
                <Link to="/signup" className="text-primary">
                  Sign Up today!
                </Link>
              </p>
            ) : (
              <p className="text-center mt-6">
                Already have an account?{" "}
                <Link to="/login" className="text-primary">
                  Login!
                </Link>
              </p>
            )}

            {/* Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500 font-medium">
                  Or continue with
                </span>
              </div>
            </div>

            {/* OAuth Buttons */}
            <div className="grid grid-cols-1 gap-3">
              <GoogleOAuthProvider
                clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}
              >
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() =>
                    toast.error(<CustomToast message="Google login failed" />)
                  }
                  theme="outline"
                  size="large"
                  width="100%"
                />
              </GoogleOAuthProvider>

              {/* Uncomment if you want Apple/Facebook login */}
              {/* <AppleSignin
                authOptions={{
                  clientId: import.meta.VITE_APPLE_CLIENT_ID,
                  scope: "email",
                  redirectURI: "https://vencome.onrender.com",
                  state: "state",
                  nonce: "nonce",
                  usePopup: true,
                }}
                onSuccess={handleAppleSuccess}
                onError={() => toast.error("Apple login failed")}
                render={(renderProps) => (
                  <Button
                    className="w-full flex items-center justify-center space-x-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                    onClick={renderProps.onClick}
                    disabled={loading}
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M17.05 20.28c-.98.95-2.05.88-3.15.38-1.14-.52-2.18-.49-3.32 0-1.43.62-2.35.68-3.33-.38-2.65-2.87-2.38-7.62.45-10.24 1.4-1.29 3.06-1.95 4.7-1.95 1.62 0 2.58.64 3.83.64 1.29 0 2.36-.64 3.83-1.95 2.83-2.62 3.1 2.13.45 5-1.01.98-1.48 2.53-1.48 3.89 0 1.62.63 3.33 1.48 4.61zM13.1 3.95c-.76.95-2.01.89-2.86.38-.1-.06-.2-.12-.29-.19 0-1.14.38-2.36 1.14-3.23.95-1.1 2.53-1.81 3.71-1.81.1.06.19.12.29.19-.76 1.43-1.05 2.99-.99 4.66z"
                      />
                    </svg>
                    <span>Sign in with Apple</span>
                  </Button>
                )}
              />

              <FacebookLogin
                appId={import.meta.VITE_FACEBOOK_APP_ID}
                autoLoad={false}
                fields="email"
                callback={handleFacebookResponse}
                render={(renderProps) => (
                  <Button
                    className="w-full flex items-center justify-center space-x-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                    onClick={renderProps.onClick}
                    disabled={loading}
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8v-6.9H7.9v-2.9H10V9.8c0-2.1 1.25-3.25 3.15-3.25.9 0 1.85.15 1.85.15v2.05h-1.04c-1.03 0-1.36.64-1.36 1.3v1.55h2.3l-.37 2.9h-1.93V21.8c4.56-.93 8-4.96 8-9.8z"
                      />
                    </svg>
                    <span>Sign in with Facebook</span>
                  </Button>
                )}
              /> */}
            </div>
          </>
        ) : (
          <>
            {/* OTP Verification Step */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">
                Verify Your Email
              </h2>
              <p className="text-gray-600 mb-4">
                We've sent a 4-digit code to <strong>{email}</strong>
              </p>
              <p className="text-xs text-gray-500">
                The code will expire in 10 minutes
              </p>
            </div>

            <OTPInput email={email} onVerify={handleVerifyOTP} />

            <div className="flex items-center justify-between text-sm mt-6">
              <button
                type="button"
                onClick={handleBackToCredentials}
                className="text-gray-600 hover:text-gray-800 underline"
              >
                ← Change email
              </button>
              <button
                type="button"
                onClick={handleResendOTP}
                disabled={loading}
                className="text-primary hover:underline disabled:opacity-50"
              >
                Resend code
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default AuthForm;
