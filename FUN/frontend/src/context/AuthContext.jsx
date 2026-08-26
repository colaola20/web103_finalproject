import { createContext, useState, useContext, useEffect, useCallback } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    setToken(null);
    localStorage.removeItem("token");
  }, []);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");

    if (storedToken && storedToken !== "undefined" && storedToken !== "null") {
      setToken(storedToken);
    } else {
      localStorage.removeItem("token");
      setToken(null);
    }

    setLoading(false);
  }, []);

  // Listen for automatic logout events triggered outside of React components
  useEffect(() => {
    const handleUnauthorized = () => logout();
    window.addEventListener("auth:logout", handleUnauthorized);

    return () => {
      window.removeEventListener("auth:logout", handleUnauthorized);
    };
  }, [logout]);

  const login = (token) => {
    setToken(token);
    localStorage.setItem("token", token);
  };

  return (
    <AuthContext.Provider value={{ token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};