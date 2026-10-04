import { useState, useEffect } from "react";
import { AuthContext } from "./context";
import {
  generateLinkService,
  loginService,
  registerService,
  verifyLinkService,
} from "../api/services/userService";
import { useNavigate } from "react-router-dom";

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // Load user safely on mount
  // Load user from localStorage on mount
  const [loading, setLoading] = useState(true); // prevents redirect on reload

  // Load user from localStorage on initial load
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem("user");
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    } catch (err) {
      console.error("Invalid user in localStorage. Clearing...", err);
      localStorage.removeItem("user");
    }
    setLoading(false); // hydration complete
  }, []);

  // Save user whenever it changes
  useEffect(() => {
    if (!user) return;

    try {
      localStorage.setItem("user", JSON.stringify(user));
    } catch (err) {
      console.error("Failed to store user:", err);
    }
  }, [user]);

  const saveUser = (userData) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const login = async (email, password) => {
    try {
      const res = await loginService(email, password);
      if (res?.user) {
        saveUser(res.user);
        if (res?.user?.role == "super-admin") {
          navigate("/admin/dashboard");
        } else {
          navigate("/home");
        }
        return true;
      }
      return false;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  };

  const register = async (form) => {
    try {
      const res = await registerService(form);
      return res?.success || false;
    } catch (error) {
      console.error("Register error:", error);
      return false;
    }
  };

  const verifyLink = async (email, token) => {
    try {
      const res = await verifyLinkService(email, token);
      if (res.ok && res.user) {
        saveUser(res.user);
      }
      return true;
    } catch (err) {
      console.error("Email verification error:", err);
      return false;
    }
  };

  const generateLink = async (email) => {
    try {
      const res = await generateLinkService(email);
      if (res.ok && res.user) {
        saveUser(res.user);
      }
      return true;
    } catch (err) {
      console.error("Email verification error:", err);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        login,
        register,
        logout,
        verifyLink,
        generateLink,
        loading,
        setLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;
