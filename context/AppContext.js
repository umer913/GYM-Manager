'use client';
import { createContext, useContext, useState, useEffect } from "react";
import { usePathname } from "next/navigation";

const AppContext = createContext();

export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState("dark");
  const pathname = usePathname();

  // Load saved theme on mount
  useEffect(() => {
    applyTheme("dark");
  }, []);

  // Reset to dark on auth/other pages
  useEffect(() => {
    applyTheme("dark");
  }, [pathname]);

  const applyTheme = (t) => {
    const root = document.documentElement;
    root.classList.add("dark");
  };

  const toggleTheme = () => {
    // Single theme mode, locked to dark
  };

  return (
    <AppContext.Provider value={{ user, setUser, theme, toggleTheme }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  return useContext(AppContext);
}
