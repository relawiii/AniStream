import React, { createContext, useContext, useState, useEffect } from "react";

interface AppSettingsContextType {
  showJST: boolean;
  setShowJST: (show: boolean) => void;
}

const AppSettingsContext = createContext<AppSettingsContextType | undefined>(undefined);

export function AppSettingsProvider({ children }: { children: React.ReactNode }) {
  const [showJST, setShowJST] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("anistream_show_jst") === "true";
    }
    return false;
  });

  useEffect(() => {
    localStorage.setItem("anistream_show_jst", String(showJST));
  }, [showJST]);

  return (
    <AppSettingsContext.Provider value={{ showJST, setShowJST }}>
      {children}
    </AppSettingsContext.Provider>
  );
}

export function useAppSettings() {
  const context = useContext(AppSettingsContext);
  if (!context) {
    throw new Error("useAppSettings must be used within an AppSettingsProvider");
  }
  return context;
}
