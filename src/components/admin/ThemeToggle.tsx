import { Palette } from "lucide-react";
import { Theme } from "../../lib/theme";
import { Switch } from "../ui/switch";
import { cn } from "../ui/utils";

interface ThemeToggleProps {
  theme: Theme;
  onThemeChange: (theme: Theme) => void;
  className?: string;
}

export function ThemeToggle({ theme, onThemeChange, className }: ThemeToggleProps) {
  const isMonochrome = theme === "monochrome";

  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-full border border-gray-200 bg-white/80 px-3 py-1.5 shadow-sm backdrop-blur-sm transition-colors",
        className,
      )}
    >
      <Palette className="h-4 w-4 text-gray-500" aria-hidden />
      <span className="hidden text-xs font-medium text-gray-600 sm:inline">
        {isMonochrome ? "Чёрно-белая тема" : "Цветная тема"}
      </span>
      <Switch
        checked={isMonochrome}
        onCheckedChange={(checked) => onThemeChange(checked ? "monochrome" : "color")}
        aria-label={isMonochrome ? "Отключить чёрно-белую тему" : "Включить чёрно-белую тему"}
      />
    </div>
  );
}
