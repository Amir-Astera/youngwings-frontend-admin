import { Search, Mail, Settings } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { navigateTo, routes } from "../Router";

export function TopHeader() {
  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-200">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-8">
        <div className="flex lg:grid lg:grid-cols-[240px_1fr_340px] gap-2 sm:gap-4 lg:gap-8 h-14 items-center">
          {/* Logo - aligned with left sidebar */}
          <div className="flex-shrink-0">
            <button onClick={() => navigateTo(routes.home())} className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[rgb(21,93,252)] rounded-lg flex items-center justify-center">
                <span className="text-white text-sm">OV</span>
              </div>
              <span className="text-lg hidden sm:inline">OrientVentus</span>
            </button>
          </div>

          {/* Search - centered in posts column */}
          <div className="flex-1 flex justify-center">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Поиск..."
                className="pl-10 bg-gray-50 border-gray-200 w-full"
              />
            </div>
          </div>

          {/* Write to author button - aligned with right sidebar */}
          <div className="hidden lg:flex justify-end flex-shrink-0 gap-2">
            <Button
              variant="outline"
              className="gap-2 border-blue-600 text-blue-600 hover:bg-blue-50"
              onClick={() => navigateTo(routes.admin())}
            >
              <Settings className="w-4 h-4" />
              Админка
            </Button>
            <Button variant="outline" className="gap-2 border-gray-200">
              <Mail className="w-4 h-4" />
              Написать автору
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
