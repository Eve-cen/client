import React, { useState } from "react";
import Input from "./Input";
import Button from "./Button";
import { useNavigate } from "react-router-dom";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import AppleSignin from "react-apple-signin-auth";
import FacebookLogin from "@greatsumini/react-facebook-login";
import { apiFetch } from "../utils/api";

const AuthForm = ({ onForgotPassword, onSuccess }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await apiFetch({
        endpoint: "/auth/login",
        method: "POST",
        body: { email, password },
      });
      localStorage.setItem("token", data.token);
      // localStorage.setItem("userId", data.user._id);
      console.log(data);
      onSuccess();
      navigate("/");
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setError("");
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
      setError(err.message || "Google login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleFacebookResponse = async (response) => {
    if (response.accessToken) {
      setError("");
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
        setError(err.message || "Facebook login failed");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleAppleSuccess = async (response) => {
    setError("");
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
      setError(err.message || "Apple login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full text-black">
      <h2 className="text-2xl font-bold mb-6 text-center">
        Welcome to EvenCen
      </h2>
      {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
      <form onSubmit={handleEmailSubmit}>
        {/* <Input
          label="Name"
          type="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        /> */}
        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Loading..." : "Login"}
        </Button>
        <p
          className="mt-4 text-blue-600 cursor-pointer text-center"
          onClick={onForgotPassword}
        >
          Forgot Password?
        </p>
      </form>

      {/* Divider */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">Or continue with</span>
        </div>
      </div>

      {/* OAuth Buttons */}
      <div className="space-y-4">
        <GoogleOAuthProvider clientId={import.meta.VITE_GOOGLE_CLIENT_ID}>
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => setError("Google login failed")}
            render={(renderProps) => (
              <Button
                className="w-full flex items-center justify-center space-x-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                onClick={renderProps.onClick}
                disabled={renderProps.disabled || loading}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M12.24 10.4V14h3.76c-.15.96-.59 1.83-1.21 2.49v2.06h2.43c1.42-1.31 2.24-3.24 2.24-5.55 0-.55-.05-1.09-.14-1.61h-7.08z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.69c1.51 0 2.86.58 3.9 1.52l2.85-2.85C16.92 2.42 14.63 1.2 12 1.2c-4.41 0-8 3.59-8 8s3.59 8 8 8c2.63 0 4.92-1.22 6.75-3.15l-2.85-2.85c-1.04.94-2.39 1.52-3.9 1.52-3.31 0-6-2.69-6-6s2.69-6 6-6z"
                  />
                </svg>
                <span>Sign in with Google</span>
              </Button>
            )}
          />
        </GoogleOAuthProvider>

        <AppleSignin
          authOptions={{
            clientId: import.meta.VITE_APPLE_CLIENT_ID,
            scope: "email",
            redirectURI: "http:localhost:5173",
            state: "state",
            nonce: "nonce",
            usePopup: true,
          }}
          onSuccess={handleAppleSuccess}
          onError={() => setError("Apple login failed")}
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
        />
      </div>
    </div>
  );
};

export default AuthForm;
