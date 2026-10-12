"use client";

import { useCallback, useSyncExternalStore } from "react";
import { Sun, Moon, Laptop } from "lucide-react";

type ThemeMode = "light" | "dark" | "system";

const THEME_EVENT = "hematin-theme-change";

function readTheme(): ThemeMode {
  const saved = localStorage.getItem("hematin_theme");
  return saved === "light" || saved === "dark" ? saved : "system";
}

function subscribeTheme(onChange: () => void) {
  window.addEventListener(THEME_EVENT, onChange);
  return () => window.removeEventListener(THEME_EVENT, onChange);
}

export function ThemeSelector() {
  const currentTheme = useSyncExternalStore<ThemeMode>(
    subscribeTheme,
    readTheme,
    () => "system"
  );

  const setTheme = useCallback((mode: ThemeMode) => {
    if (mode === "system") {
      localStorage.removeItem("hematin_theme");
      const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      if (isDark) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    } else {
      localStorage.setItem("hematin_theme", mode);
      if (mode === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
    window.dispatchEvent(new Event(THEME_EVENT));
  }, []);

  const options: { mode: ThemeMode; label: string; icon: typeof Sun }[] = [
    { mode: "light", label: "Terang", icon: Sun },
    { mode: "dark", label: "Gelap", icon: Moon },
    { mode: "system", label: "Sistem", icon: Laptop },
  ];

  return (
    <div className="grid grid-cols-3 gap-2 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-2xl">
      {options.map((opt) => {
        const Icon = opt.icon;
        const isActive = currentTheme === opt.mode;
        return (
          <button
            key={opt.mode}
            type="button"
            onClick={() => setTheme(opt.mode)}
            className={`py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 text-xs font-semibold transition-all cursor-pointer ${
              isActive
                ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-2xs"
                : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            <span>{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}
