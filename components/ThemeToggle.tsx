"use client";

import { useEffect, useState } from "react";

type ThemeMode = "system" | "light" | "dark";

const STORAGE_KEY = "caption-admin-theme";

function getInitialThemeMode(): ThemeMode {
  if (typeof window === "undefined") {
    return "system";
  }

  const stored = localStorage.getItem(STORAGE_KEY);
  return stored === "light" || stored === "dark" ? stored : "system";
}

function resolveTheme(mode: ThemeMode) {
  if (
    mode === "system" &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  ) {
    return "dark";
  }

  return mode === "system" ? "light" : mode;
}

function applyTheme(mode: ThemeMode) {
  const root = document.documentElement;
  root.dataset.themeMode = mode;
  root.dataset.theme = resolveTheme(mode);
}

export default function ThemeToggle() {
  const [themeMode, setThemeMode] = useState<ThemeMode>(getInitialThemeMode);

  useEffect(() => {
    applyTheme(themeMode);

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const syncSystemTheme = () => {
      const current =
        (document.documentElement.dataset.themeMode as ThemeMode) ?? "system";

      if (current === "system") {
        applyTheme("system");
      }
    };

    mediaQuery.addEventListener("change", syncSystemTheme);
    return () => mediaQuery.removeEventListener("change", syncSystemTheme);
  }, [themeMode]);

  function handleChange(mode: ThemeMode) {
    setThemeMode(mode);
    localStorage.setItem(STORAGE_KEY, mode);
    applyTheme(mode);
  }

  return (
    <div className="inline-flex items-center gap-2 rounded-full border-2 border-[var(--ink)] bg-[var(--panel)] p-1 shadow-[6px_6px_0_var(--shadow-strong)]">
      {(["system", "light", "dark"] as const).map((mode) => {
        const active = themeMode === mode;

        return (
          <button
            key={mode}
            type="button"
            onClick={() => handleChange(mode)}
            aria-pressed={active}
            className={`rounded-full px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition ${
              active
                ? "bg-[var(--ink)] text-[var(--panel)]"
                : "bg-transparent text-[var(--ink)]"
            }`}
          >
            {mode}
          </button>
        );
      })}
    </div>
  );
}
