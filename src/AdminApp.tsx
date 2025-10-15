import { useState, useEffect } from "react";
import { AdminLayout } from "./components/admin/AdminLayout";
import { Dashboard } from "./components/admin/Dashboard";
import { PostsManager } from "./components/admin/PostsManager";
import { EventsManager } from "./components/admin/EventsManager";
import { TranslatorsManager } from "./components/admin/TranslatorsManager";
import { CommentsManager } from "./components/admin/CommentsManager";
import { SettingsManager } from "./components/admin/SettingsManager";
import { authApi } from "./lib/api";

// Login Page Component
function LoginPage({ onLogin }: { onLogin: () => void }) {
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
      localStorage.setItem("admin_token", response.token);
      onLogin();
    } catch (err) {
      setError("Неверный email или пароль");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-8">
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white">YW</span>
            </div>
            <h1 className="text-2xl">YoungWings Admin</h1>
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
                placeholder="admin@youngwings.kz"
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
                placeholder="••••••••"
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

          {/* Test credentials info */}
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs text-blue-800 mb-2">
              <strong>Тестовые данные для входа:</strong>
            </p>
            <p className="text-xs text-blue-700">
              Email: <code className="bg-white px-1.5 py-0.5 rounded">admin@youngwings.ru</code>
            </p>
            <p className="text-xs text-blue-700">
              Пароль: <code className="bg-white px-1.5 py-0.5 rounded">admin123</code>
            </p>
          </div>
        </div>

        <p className="text-center text-sm text-gray-500 mt-4">
          YoungWings © 2025. Все права защищены.
        </p>
      </div>
    </div>
  );
}

// Main Admin App
export default function AdminApp({ onExit }: { onExit?: () => void }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentPage, setCurrentPage] = useState("dashboard");

  useEffect(() => {
    setIsAuthenticated(authApi.isAuthenticated());
  }, []);

  if (!isAuthenticated) {
    return <LoginPage onLogin={() => setIsAuthenticated(true)} />;
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
    <AdminLayout currentPage={currentPage} onPageChange={setCurrentPage} onExit={onExit}>
      {renderPage()}
    </AdminLayout>
  );
}
