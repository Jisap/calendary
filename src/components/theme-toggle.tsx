"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon, Laptop } from "lucide-react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-8 h-8 rounded-xl bg-slate-800/40 animate-pulse" />;
  }

  return (
    <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400">
      <button
        type="button"
        onClick={() => setTheme("light")}
        className={`p-1.5 rounded-lg transition ${
          theme === "light"
            ? "bg-white text-amber-500 shadow-sm"
            : "hover:text-slate-900 dark:hover:text-white"
        }`}
        title="Modo Claro"
      >
        <Sun className="w-3.5 h-3.5" />
      </button>
      <button
        type="button"
        onClick={() => setTheme("dark")}
        className={`p-1.5 rounded-lg transition ${
          theme === "dark"
            ? "bg-slate-800 text-indigo-400 shadow-sm"
            : "hover:text-slate-900 dark:hover:text-white"
        }`}
        title="Modo Oscuro"
      >
        <Moon className="w-3.5 h-3.5" />
      </button>
      <button
        type="button"
        onClick={() => setTheme("system")}
        className={`p-1.5 rounded-lg transition ${
          theme === "system"
            ? "bg-white dark:bg-slate-800 text-indigo-500 shadow-sm"
            : "hover:text-slate-900 dark:hover:text-white"
        }`}
        title="Automático del Sistema"
      >
        <Laptop className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
