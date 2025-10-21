import { useEffect, useState } from "react";
import AdminApp from "./AdminApp";
import { Toaster } from "./components/ui/sonner";
import { Theme, applyTheme, getStoredTheme, persistTheme } from "./lib/theme";

export default function App() {
  const [theme, setTheme] = useState<Theme>(() => {
    const storedTheme = getStoredTheme();
    applyTheme(storedTheme);
    return storedTheme;
  });

  useEffect(() => {
    applyTheme(theme);
    persistTheme(theme);
  }, [theme]);

  const handleThemeChange = (nextTheme: Theme) => {
    setTheme(nextTheme);
  };

  return (
    <>
      <AdminApp theme={theme} onThemeChange={handleThemeChange} />
      <Toaster />
    </>
  );
}
