import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { safeStorageGet, safeStorageSet } from "@/lib/utils";

type Theme = "light" | "dark";
const ThemeContext = createContext<{ theme: Theme; toggle: () => void; reset: () => void } | null>(null);
function apply(theme: Theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
  document.documentElement.style.colorScheme = theme;
}
export function ThemeProvider({ children }: { children: ReactNode }) {
  // The same initial state on server and client prevents a hydration mismatch.
  const [theme, setTheme] = useState<Theme>("light");
  useEffect(() => {
    const stored = safeStorageGet("tony-theme");
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const update = () => {
      const preference = safeStorageGet("tony-theme");
      const next = preference === "dark" ? "dark" : "light";
      setTheme(next); apply(next);
    };
    const initial = stored === "dark" ? "dark" : "light";
    setTheme(initial); apply(initial);
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  function toggle() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next); safeStorageSet("tony-theme", next); apply(next);
  }
  function reset() {
    try { localStorage.removeItem("tony-theme"); localStorage.removeItem("tony-locale"); } catch { /* Optional persistence. */ }
    const next = "light";
    setTheme(next); apply(next);
  }
  return <ThemeContext.Provider value={{ theme, toggle, reset }}>{children}</ThemeContext.Provider>;
}
export function useTheme() {
  const value = useContext(ThemeContext);
  if (!value) throw new Error("useTheme must be used within ThemeProvider");
  return value;
}
