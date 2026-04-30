import { useCallback, useEffect, useState } from "react";

export type Theme = "dark" | "light";
const KEY = "steps_theme";

function readTheme(): Theme {
  if (typeof window === "undefined") return "dark";
  const t = window.localStorage.getItem(KEY);
  return t === "light" ? "light" : "dark";
}

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(readTheme);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    try { localStorage.setItem(KEY, theme); } catch {}
  }, [theme]);

  const setTheme = useCallback((next: Theme) => setThemeState(next), []);
  const toggle = useCallback(() => setThemeState((t) => (t === "dark" ? "light" : "dark")), []);

  return { theme, setTheme, toggle };
}
