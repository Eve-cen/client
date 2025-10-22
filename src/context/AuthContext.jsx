import { createContext, useContext, useState, useEffect } from "react";
import { apiFetch } from "../utils/api"; // import your function

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem("token"));

  // Restore session on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, [token]);

  // ✅ LOGIN FUNCTION
  const login = async (username, password) => {
    try {
      const data = await apiFetch({
        endpoint: "/auth/login",
        method: "POST",
        body: { username, password },
      });

      // Expected backend response: { token, user }
      if (data?.token && data?.user) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        setToken(data.token);
        setUser(data.user);
        return true;
      } else {
        throw new Error("Invalid login response");
      }
    } catch (error) {
      console.error("Login error:", error.message);
      return false;
    }
  };

  // ✅ LOGOUT FUNCTION
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setToken(null);
  };

  // ✅ AUTHENTICATED REQUEST HELPER
  const authRequest = async (config) => {
    if (!token) throw new Error("No auth token found");
    return await apiFetch({
      ...config,
      headers: { Authorization: `Bearer ${token}` },
    });
  };

  return (
    <AuthContext.Provider
      value={{ user, token, login, logout, authRequest, loading }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
