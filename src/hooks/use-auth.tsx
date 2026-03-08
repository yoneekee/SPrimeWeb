import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface AuthContextType {
  isLoggedIn: boolean;
  user: { name: string; email: string } | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return sessionStorage.getItem("erp_logged_in") === "true";
  });
  const [user, setUser] = useState<{ name: string; email: string } | null>(() => {
    const saved = sessionStorage.getItem("erp_user");
    return saved ? JSON.parse(saved) : null;
  });

  const login = async (email: string, password: string): Promise<boolean> => {
    // Mock: any non-empty email/password succeeds
    if (email && password) {
      const u = { name: email.split("@")[0], email };
      setUser(u);
      setIsLoggedIn(true);
      sessionStorage.setItem("erp_logged_in", "true");
      sessionStorage.setItem("erp_user", JSON.stringify(u));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    setIsLoggedIn(false);
    sessionStorage.removeItem("erp_logged_in");
    sessionStorage.removeItem("erp_user");
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
