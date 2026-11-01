/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useEffect, useMemo, useState } from "react";
import { STORAGE_KEY } from "../api/axios";
import { getMe } from "../api/authApi";

export const AuthContext = createContext(null);

const readStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY));
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(readStoredUser);

  // Storage is written synchronously so requests fired right after a login
  // (before React re-renders) already carry the new token.
  const login = useCallback((data) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    setUser(data);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  }, []);

  const updateUser = useCallback((patch) => {
    const current = readStoredUser();
    if (!current) return;

    const next = { ...current, ...patch };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setUser(next);
  }, []);

  // The API tells us when the token is no longer valid
  useEffect(() => {
    window.addEventListener("auth:expired", logout);
    return () => window.removeEventListener("auth:expired", logout);
  }, [logout]);

  // Refresh the stored profile once per session (also validates the token)
  const token = user?.token;
  useEffect(() => {
    if (!token) return;
    getMe()
      .then(({ data }) => updateUser(data))
      .catch(() => {});
  }, [token, updateUser]);

  const value = useMemo(
    () => ({ user, login, logout, updateUser }),
    [user, login, logout, updateUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
