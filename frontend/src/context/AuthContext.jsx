import { createContext, useContext, useState, useCallback } from "react";

const AuthContext = createContext(null);
const KEY = "paperfolio_user";

function loadUser() {
  try {
    return JSON.parse(localStorage.getItem(KEY));
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(loadUser);
  // authModal: null (closed) | "login" | "signup"
  const [authModal, setAuthModal] = useState(null);

  const signIn = useCallback((u) => {
    setUser(u);
    localStorage.setItem(KEY, JSON.stringify(u));
    setAuthModal(null);
  }, []);

  const signOut = useCallback(() => {
    setUser(null);
    localStorage.removeItem(KEY);
  }, []);

  const value = {
    user,
    signIn,
    signOut,
    authModal,
    openAuth: setAuthModal, // openAuth("login") or openAuth("signup")
    closeAuth: () => setAuthModal(null),
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
