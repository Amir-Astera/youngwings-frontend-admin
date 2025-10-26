import { useState, useEffect } from "react";
import { AdminLayout } from "./components/admin/AdminLayout";
import { Dashboard } from "./components/admin/Dashboard";
import { PostsManager } from "./components/admin/PostsManager";
import { EventsManager } from "./components/admin/EventsManager";
import { TranslatorsManager } from "./components/admin/TranslatorsManager";
import { CommentsManager } from "./components/admin/CommentsManager";
import { SettingsManager } from "./components/admin/SettingsManager";
import { Theme } from "./lib/theme";
import { ThemeToggle } from "./components/admin/ThemeToggle";
import { authApi } from "./lib/api";

// Login Page Component
interface LoginPageProps {
  onLogin: () => void;
  theme: Theme;
  onThemeChange: (theme: Theme) => void;
}

function LoginPage({ onLogin, theme, onThemeChange }: LoginPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await authApi.login({ email, password });
      localStorage.setItem("admin_token", response.access_token);
      localStorage.setItem("admin_token_type", response.token_type);
      onLogin();
    } catch (err) {
      setError("Неверный email или пароль");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="absolute top-4 right-4">
        <ThemeToggle theme={theme} onThemeChange={onThemeChange} />
      </div>
      <div className="w-full max-w-md">
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-8">
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white">OV</span>
            </div>
            <h1 className="text-2xl">OrientVentus Admin</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@orientventus.ru"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm mb-2">
                Пароль
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="admin123"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                required
              />
            </div>

            {error && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {isLoading ? "Вход..." : "Войти"}
            </button>
          </form>

        </div>

        <p className="text-center text-sm text-gray-500 mt-4">
          OrientVentus © 2025. Все права защищены.
        </p>
      </div>
    </div>
  );
}

// Main Admin App
interface AdminAppProps {
  theme: Theme;
  onThemeChange: (theme: Theme) => void;
}

export default function AdminApp({ theme, onThemeChange }: AdminAppProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentPage, setCurrentPage] = useState("dashboard");

  useEffect(() => {
    setIsAuthenticated(authApi.isAuthenticated());
  }, []);

  if (!isAuthenticated) {
    return (
      <LoginPage
        onLogin={() => setIsAuthenticated(true)}
        theme={theme}
        onThemeChange={onThemeChange}
      />
    );
  }

  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":
        return <Dashboard onNavigate={setCurrentPage} />;
      case "posts":
        return <PostsManager />;
      case "events":
        return <EventsManager />;
      case "translators":
        return <TranslatorsManager />;
      case "comments":
        return <CommentsManager />;
      case "settings":
        return <SettingsManager />;
      default:
        return <Dashboard onNavigate={setCurrentPage} />;
    }
  };

  return (
    <AdminLayout
      currentPage={currentPage}
      onPageChange={setCurrentPage}
      theme={theme}
      onThemeChange={onThemeChange}
    >
      {renderPage()}
    </AdminLayout>
  );
}
