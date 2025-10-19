import { useEffect, useState, type ReactNode } from "react";
import {
  Calendar,
  Eye,
  FileText,
  Languages,
  MessageSquare,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react";
import {
  adminApi,
  type DashboardCommentStatus,
  type DashboardResponse,
} from "../../lib/api";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: string;
}

interface DashboardProps {
  onNavigate: (page: string) => void;
}

const COMMENT_STATUS_STYLES: Record<DashboardCommentStatus, { label: string; className: string }> = {
  PENDING: {
    label: "На модерации",
    className: "bg-yellow-100 text-yellow-700",
  },
  APPROVED: {
    label: "Опубликован",
    className: "bg-green-100 text-green-700",
  },
  REJECTED: {
    label: "Отклонен",
    className: "bg-red-100 text-red-700",
  },
};

function StatCard({ title, value, icon, trend }: StatCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
          {icon}
        </div>
        {trend && <span className="text-sm text-blue-600 font-medium">{trend}</span>}
      </div>
      <div className="text-2xl mb-1">{value}</div>
      <div className="text-sm text-gray-600">{title}</div>
    </div>
  );
}

const formatNumber = (value?: number) =>
  typeof value === "number" ? value.toLocaleString("ru-RU") : "—";

const formatDateTime = (value?: string) => {
  if (!value) {
    return "";
  }

  return new Date(value).toLocaleString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export function Dashboard({ onNavigate }: DashboardProps) {
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await adminApi.getDashboard();
        setData(response);
      } catch (err) {
        console.error("Failed to load dashboard data", err);
        setError("Не удалось загрузить данные панели управления");
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const counters = data?.counters;

  const stats: StatCardProps[] = [
    {
      title: "Всего постов",
      value: formatNumber(counters?.totalPosts),
      icon: <FileText className="w-6 h-6 text-blue-600" />,
      trend: counters ? `За месяц: ${formatNumber(counters.monthPosts)}` : undefined,
    },
    {
      title: "События",
      value: formatNumber(counters?.totalEvents),
      icon: <Calendar className="w-6 h-6 text-blue-600" />,
      trend: counters ? `За месяц: ${formatNumber(counters.monthEvents)}` : undefined,
    },
    {
      title: "Комментарии",
      value: formatNumber(counters?.totalComments),
      icon: <MessageSquare className="w-6 h-6 text-blue-600" />,
      trend: counters ? `За месяц: ${formatNumber(counters.monthComments)}` : undefined,
    },
    {
      title: "Переводчики",
      value: formatNumber(counters?.totalTranslatorVacancies),
      icon: <Languages className="w-6 h-6 text-blue-600" />,
      trend: counters
        ? `За месяц: ${formatNumber(counters.monthTranslatorVacancies)}`
        : undefined,
    },
  ];

  const latestPosts = data?.latestPosts ?? [];
  const latestComments = data?.latestComments ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl">Панель управления</h1>
        {data?.generatedAt && (
          <span className="text-xs text-gray-500">
            Обновлено: {formatDateTime(data.generatedAt)}
          </span>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3">
          {error}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Posts */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3>Последние посты</h3>
            <span className="text-xs text-gray-500">Показываются последние 10 постов</span>
          </div>
          {isLoading ? (
            <div className="text-sm text-gray-500">Загрузка данных...</div>
          ) : latestPosts.length === 0 ? (
            <div className="text-sm text-gray-500">Посты отсутствуют</div>
          ) : (
            <div className="space-y-4">
              {latestPosts.map((post) => (
                <div
                  key={post.id}
                  className="pb-4 border-b border-gray-100 last:border-0 last:pb-0"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 line-clamp-2">
                        {post.title}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatDateTime(post.createdAt)}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {formatNumber(post.viewCount)}
                    </span>
                    <span className="flex items-center gap-1">
                      <ThumbsUp className="w-3 h-3" />
                      {formatNumber(post.likeCount)}
                    </span>
                    <span className="flex items-center gap-1">
                      <ThumbsDown className="w-3 h-3" />
                      {formatNumber(post.dislikeCount)}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageSquare className="w-3 h-3" />
                      {formatNumber(post.commentCount)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Comments */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3>Последние комментарии</h3>
            <span className="text-xs text-gray-500">Показываются последние 20 комментариев</span>
          </div>
          {isLoading ? (
            <div className="text-sm text-gray-500">Загрузка данных...</div>
          ) : latestComments.length === 0 ? (
            <div className="text-sm text-gray-500">Комментарии отсутствуют</div>
          ) : (
            <div className="space-y-4">
              {latestComments.map((comment) => {
                const statusConfig =
                  COMMENT_STATUS_STYLES[comment.status] ?? COMMENT_STATUS_STYLES.PENDING;

                return (
                  <div
                    key={comment.id}
                    className="pb-4 border-b border-gray-100 last:border-0 last:pb-0"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex flex-col gap-1">
                        <span className="text-sm">
                          {comment.authorName || "Аноним"}
                        </span>
                        <span className="text-xs text-gray-500 break-all">
                          Пост: {comment.postId}
                        </span>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span
                          className={`px-2 py-0.5 text-xs rounded ${statusConfig.className}`}
                        >
                          {statusConfig.label}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatDateTime(comment.createdAt)}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-3">
                      {comment.content}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
        <h3 className="mb-4">Быстрые действия</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <button
            onClick={() => onNavigate("posts")}
            className="p-4 bg-white rounded-lg hover:shadow-md transition-shadow text-left"
          >
            <FileText className="w-5 h-5 text-blue-600 mb-2" />
            <div className="text-sm">Создать пост</div>
          </button>
          <button
            onClick={() => onNavigate("events")}
            className="p-4 bg-white rounded-lg hover:shadow-md transition-shadow text-left"
          >
            <Calendar className="w-5 h-5 text-blue-600 mb-2" />
            <div className="text-sm">Добавить событие</div>
          </button>
          <button
            onClick={() => onNavigate("translators")}
            className="p-4 bg-white rounded-lg hover:shadow-md transition-shadow text-left"
          >
            <Languages className="w-5 h-5 text-blue-600 mb-2" />
            <div className="text-sm">Добавить переводчика</div>
          </button>
          <button
            onClick={() => onNavigate("comments")}
            className="p-4 bg-white rounded-lg hover:shadow-md transition-shadow text-left"
          >
            <MessageSquare className="w-5 h-5 text-blue-600 mb-2" />
            <div className="text-sm">Модерация</div>
          </button>
        </div>
      </div>
    </div>
  );
}
