export const THEME_STORAGE_KEY = "theme";

export type ThemeSetting = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

export const themeInitScript = `(function(){try{var t=localStorage.getItem("${THEME_STORAGE_KEY}")||"light";var r=t==="system"?(window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"):t;var el=document.documentElement;el.classList.remove("light","dark");el.classList.add(r);el.style.colorScheme=r;}catch(e){}})();`;

export function getSystemTheme(): ResolvedTheme {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function resolveTheme(theme: ThemeSetting): ResolvedTheme {
  return theme === "system" ? getSystemTheme() : theme;
}

export function applyTheme(
  theme: ThemeSetting,
  disableTransition = false,
): ResolvedTheme {
  const resolved = resolveTheme(theme);
  const root = document.documentElement;
  let restoreTransitions: (() => void) | undefined;

  if (disableTransition) {
    const style = document.createElement("style");
    style.appendChild(
      document.createTextNode(
        "*,*::before,*::after{transition:none!important;animation:none!important;}",
      ),
    );
    document.head.appendChild(style);
    restoreTransitions = () => {
      window.getComputedStyle(document.body);
      document.head.removeChild(style);
    };
  }

  root.classList.remove("light", "dark");
  root.classList.add(resolved);
  root.style.colorScheme = resolved;

  if (restoreTransitions) {
    requestAnimationFrame(() => {
      restoreTransitions?.();
    });
  }

  return resolved;
}
