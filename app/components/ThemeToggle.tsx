"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "theme";

function applyTheme(theme: "light" | "dark") {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("dark", theme === "dark");
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const stored = (typeof window !== "undefined" && localStorage.getItem(STORAGE_KEY)) || "light";
    const nextTheme = stored === "dark" ? "dark" : "light";
    setTheme(nextTheme);
    applyTheme(nextTheme);
  }, []);

  const toggle = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, nextTheme);
    }
    applyTheme(nextTheme);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      className="w-10 h-10 flex items-center justify-center rounded-full border border-outline-variant/40 text-on-surface hover:bg-surface-container-low transition-all"
      aria-label="Toggle theme"
      title={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
    >
      <span className="material-symbols-outlined text-lg">
        {theme === "dark" ? "light_mode" : "dark_mode"}
      </span>
    </button>
  );
}
