"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  applyTheme,
  getSystemTheme,
  resolveTheme,
  THEME_STORAGE_KEY,
  type ResolvedTheme,
  type ThemeSetting,
} from "@/lib/theme";

interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: ThemeSetting;
  enableSystem?: boolean;
  disableTransitionOnChange?: boolean;
}

interface ThemeContextValue {
  theme: ThemeSetting;
  setTheme: (theme: ThemeSetting) => void;
  resolvedTheme: ResolvedTheme;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function readStoredTheme(defaultTheme: ThemeSetting): ThemeSetting {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY) as ThemeSetting | null;
    return stored ?? defaultTheme;
  } catch {
    return defaultTheme;
  }
}

export function ThemeProvider({
  children,
  defaultTheme = "light",
  enableSystem = true,
  disableTransitionOnChange = false,
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<ThemeSetting>(defaultTheme);
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>(() =>
    resolveTheme(defaultTheme),
  );

  useEffect(() => {
    const stored = readStoredTheme(defaultTheme);
    // Sync React state with localStorage after the blocking script in layout runs.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- client-only theme hydration
    setThemeState(stored);
    setResolvedTheme(applyTheme(stored, disableTransitionOnChange));
  }, [defaultTheme, disableTransitionOnChange]);

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      if (readStoredTheme(defaultTheme) !== "system") {
        return;
      }
      setResolvedTheme(applyTheme("system", disableTransitionOnChange));
    };

    media.addEventListener("change", handleChange);
    return () => media.removeEventListener("change", handleChange);
  }, [defaultTheme, disableTransitionOnChange]);

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== THEME_STORAGE_KEY) {
        return;
      }
      const next = (event.newValue as ThemeSetting | null) ?? defaultTheme;
      setThemeState(next);
      setResolvedTheme(applyTheme(next, disableTransitionOnChange));
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [defaultTheme, disableTransitionOnChange]);

  const setTheme = useCallback(
    (next: ThemeSetting) => {
      const allowed = next === "system" && !enableSystem ? getSystemTheme() : next;

      setThemeState(allowed);
      try {
        localStorage.setItem(THEME_STORAGE_KEY, allowed);
      } catch {
        // Ignore storage failures (private mode, etc.)
      }
      setResolvedTheme(applyTheme(allowed, disableTransitionOnChange));
    },
    [disableTransitionOnChange, enableSystem],
  );

  const value = useMemo(
    () => ({ theme, setTheme, resolvedTheme }),
    [theme, setTheme, resolvedTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}
