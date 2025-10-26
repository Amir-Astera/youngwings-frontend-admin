import { Palette } from "lucide-react";
import { Theme } from "../../lib/theme";
import { Button } from "../ui/button";
import { cn } from "../ui/utils";

interface ThemeToggleProps {
  theme: Theme;
  onThemeChange: (theme: Theme) => void;
  className?: string;
}

export function ThemeToggle({ theme, onThemeChange, className }: ThemeToggleProps) {
  const isMonochrome = theme === "monochrome";

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={() => onThemeChange(isMonochrome ? "color" : "monochrome")}
      className={cn("rounded-full border border-gray-200 bg-white/80 shadow-sm backdrop-blur-sm", className)}
      aria-label={isMonochrome ? "Включить цветную тему" : "Включить чёрно-белую тему"}
    >
      <Palette className="h-4 w-4" aria-hidden />
    </Button>
  );
}
