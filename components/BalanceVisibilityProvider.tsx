"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface BalanceVisibilityContextType {
  isHidden: boolean;
  toggleHideBalance: () => void;
  setHideBalance: (hidden: boolean) => void;
  isReady: boolean;
}

const STORAGE_KEY = "hematin_hide_balance";

const BalanceVisibilityContext = createContext<BalanceVisibilityContextType>({
  isHidden: false,
  toggleHideBalance: () => {},
  setHideBalance: () => {},
  isReady: false,
});

export function BalanceVisibilityProvider({ children }: { children: ReactNode }) {
  const [isHidden, setIsHidden] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored !== null) {
        setIsHidden(stored === "true");
      }
    } catch {
      // Handle cases where localStorage is disabled/unavailable
    }
    setIsReady(true);
  }, []);

  const toggleHideBalance = () => {
    setIsHidden((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(STORAGE_KEY, String(next));
      } catch {}
      return next;
    });
  };

  const setHideBalance = (val: boolean) => {
    setIsHidden(val);
    try {
      localStorage.setItem(STORAGE_KEY, String(val));
    } catch {}
  };

  return (
    <BalanceVisibilityContext.Provider
      value={{
        isHidden,
        toggleHideBalance,
        setHideBalance,
        isReady,
      }}
    >
      {children}
    </BalanceVisibilityContext.Provider>
  );
}

export function useBalanceVisibility() {
  const context = useContext(BalanceVisibilityContext);
  if (!context) {
    throw new Error("useBalanceVisibility must be used within a BalanceVisibilityProvider");
  }
  return context;
}
