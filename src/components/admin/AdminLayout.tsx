import { ReactNode, useState } from "react";
import {
  LayoutDashboard,
  FileText,
  Calendar,
  Image, 
  Languages, 
  TrendingUp, 
  MessageSquare, 
  Settings, 
  LogOut,
  Menu,
  X
} from "lucide-react";
import { Button } from "../ui/button";
import { authApi } from "../../lib/api";
import { Theme } from "../../lib/theme";
import { ThemeToggle } from "./ThemeToggle";

interface AdminLayoutProps {
  children: ReactNode;
  currentPage: string;
  onPageChange: (page: string) => void;
  onExit?: () => void;
  theme: Theme;
  onThemeChange: (theme: Theme) => void;
}

const menuItems = [
  { id: "dashboard", label: "Панель управления", icon: LayoutDashboard },
  { id: "posts", label: "Посты", icon: FileText },
  { id: "events", label: "События и выставки", icon: Calendar },
  { id: "translators", label: "Переводчики", icon: Languages },
  { id: "comments", label: "Комментарии", icon: MessageSquare },
  { id: "settings", label: "Настройки", icon: Settings },
];

export function AdminLayout({
  children,
  currentPage,
  onPageChange,
  onExit,
  theme,
  onThemeChange,
}: AdminLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    authApi.logout();
    window.location.reload();
  };

  const handleExitAdmin = () => {
    if (onExit) {
      onExit();
    } else {
      window.dispatchEvent(new CustomEvent('navigateAdmin', { detail: { isAdmin: false } }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between h-16 px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm">YW</span>
              </div>
              <span className="text-lg">YoungWings Admin</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <ThemeToggle theme={theme} onThemeChange={onThemeChange} />
            <Button
              variant="ghost"
              onClick={handleExitAdmin}
              aria-label="Вернуться на сайт"
              className="text-sm px-3"
            >
              На сайт
            </Button>
            <Button variant="ghost" onClick={handleLogout} className="gap-2">
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Выйти</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="flex pt-16">
        {/* Sidebar */}
        <aside
          className={`fixed lg:sticky top-16 left-0 bottom-0 w-64 bg-white border-r border-gray-200 overflow-y-auto transition-transform duration-300 z-40 ${
            isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          }`}
        >
          <nav className="p-4 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onPageChange(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                    currentPage === item.id
                      ? "bg-gradient-to-r from-blue-500/10 to-blue-600/10 text-blue-600 border border-blue-200/50"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm font-medium">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-30 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
  );
}