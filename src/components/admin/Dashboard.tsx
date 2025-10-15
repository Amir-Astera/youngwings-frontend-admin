import { FileText, Calendar, MessageSquare, TrendingUp, Eye, ThumbsUp, Languages } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
}

interface DashboardProps {
  onNavigate: (page: string) => void;
}

function StatCard({ title, value, icon, trend }: StatCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
          {icon}
        </div>
        {trend && (
          <span className="text-sm text-green-600 font-medium">{trend}</span>
        )}
      </div>
      <div className="text-2xl mb-1">{value}</div>
      <div className="text-sm text-gray-600">{title}</div>
    </div>
  );
}

export function Dashboard({ onNavigate }: DashboardProps) {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl">Панель управления</h1>

      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Всего постов"
          value="127"
          icon={<FileText className="w-6 h-6 text-blue-600" />}
        />
        <StatCard
          title="События"
          value="24"
          icon={<Calendar className="w-6 h-6 text-blue-600" />}
        />
        <StatCard
          title="Комментарии"
          value="1,543"
          icon={<MessageSquare className="w-6 h-6 text-blue-600" />}
          trend="+18%"
        />
        <StatCard
          title="Переводчики"
          value="12"
          icon={<Languages className="w-6 h-6 text-blue-600" />}
        />
      </div>

      {/* Recent Activity */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Posts */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h3 className="mb-4">Последние посты</h3>
          <div className="space-y-4">
            {[
              { title: "Новые технологии в машинном обучении", views: 1245, likes: 89, comments: 23 },
              { title: "Экономический форум 2025: главные выводы", views: 892, likes: 67, comments: 15 },
              { title: "Стартап из Казахстана получил инвестиции", views: 756, likes: 54, comments: 12 },
              { title: "Тренды digital-маркетинга в 2025 году", views: 634, likes: 43, comments: 8 },
            ].map((post, i) => (
              <div key={i} className="flex items-start gap-3 pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                <div className="w-16 h-12 bg-gray-100 rounded flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm mb-1 line-clamp-1">
                    {post.title}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {post.views}
                    </span>
                    <span className="flex items-center gap-1">
                      <ThumbsUp className="w-3 h-3" />
                      {post.likes}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageSquare className="w-3 h-3" />
                      {post.comments}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Comments */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h3 className="mb-4">Последние комментарии</h3>
          <div className="space-y-4">
            {[
              { user: "Айдар Нурланов", time: "2 ч. назад", text: "Отличная статья! Очень актуальная информация для нашего рынка.", status: "pending" },
              { user: "Марина Петрова", time: "3 ч. назад", text: "Согласен с автором. Мы уже внедрили подобные решения в нашей компании.", status: "approved" },
              { user: "Даулет Смагулов", time: "5 ч. назад", text: "Было бы интересно узнать больше деталей о реализации этого проекта.", status: "pending" },
              { user: "Елена Ким", time: "8 ч. назад", text: "Спасибо за полезный материал! Поделилась с коллегами.", status: "approved" },
            ].map((comment, i) => (
              <div key={i} className="pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-sm">{comment.user}</span>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 text-xs rounded ${
                      comment.status === 'pending' 
                        ? 'bg-yellow-100 text-yellow-700' 
                        : 'bg-green-100 text-green-700'
                    }`}>
                      {comment.status === 'pending' ? 'На модерации' : 'Опубликован'}
                    </span>
                    <span className="text-xs text-gray-500">{comment.time}</span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 line-clamp-2">
                  {comment.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
        <h3 className="mb-4">Быстрые действия</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <button 
            onClick={() => onNavigate('posts')}
            className="p-4 bg-white rounded-lg hover:shadow-md transition-shadow text-left"
          >
            <FileText className="w-5 h-5 text-blue-600 mb-2" />
            <div className="text-sm">Создать пост</div>
          </button>
          <button 
            onClick={() => onNavigate('events')}
            className="p-4 bg-white rounded-lg hover:shadow-md transition-shadow text-left"
          >
            <Calendar className="w-5 h-5 text-blue-600 mb-2" />
            <div className="text-sm">Добавить событие</div>
          </button>
          <button 
            onClick={() => onNavigate('translators')}
            className="p-4 bg-white rounded-lg hover:shadow-md transition-shadow text-left"
          >
            <Languages className="w-5 h-5 text-blue-600 mb-2" />
            <div className="text-sm">Добавить переводчика</div>
          </button>
          <button 
            onClick={() => onNavigate('comments')}
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
