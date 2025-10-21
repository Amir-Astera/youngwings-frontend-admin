export type Theme = "color" | "monochrome";

const THEME_STORAGE_KEY = "admin_theme";

export function getStoredTheme(): Theme {
  if (typeof window === "undefined") {
    return "color";
  }

  const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
  return storedTheme === "monochrome" ? "monochrome" : "color";
}

export function persistTheme(theme: Theme) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(THEME_STORAGE_KEY, theme);
}

export function applyTheme(theme: Theme) {
  if (typeof document === "undefined") {
    return;
  }

  const root = document.documentElement;

  if (theme === "monochrome") {
    root.classList.add("bw-theme");
  } else {
    root.classList.remove("bw-theme");
  }

  root.dataset.theme = theme;
}
