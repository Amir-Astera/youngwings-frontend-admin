# YoungWings Admin Panel

Админ-панель для управления контентом новостного сайта YoungWings.

## 🎯 Особенности

- ✨ **Автономная работа** - админка отделена от новостного сайта
- 🔌 **API интеграция** - работает только через REST API с Kotlin Spring Boot
- 📝 **TipTap редактор** - современный WYSIWYG редактор для контента
- 🎨 **Tailwind CSS** - современный дизайн
- 🔐 **JWT авторизация** - безопасный вход в систему
- 📱 **Responsive** - адаптивный дизайн для всех устройств

## 🏗️ Архитектура

```
Admin Panel (React) ←─ REST API ─→ Kotlin Spring Boot ←─ JDBC ─→ PostgreSQL
```

Админка **не содержит** логики новостного сайта. Это отдельное приложение, которое:
- Общается с бэкендом только через API
- Сохраняет посты с TipTap контентом в JSON формате
- Работает полностью независимо

## 🚀 Быстрый старт

### 1. Установка

```bash
# Клонировать репозиторий
git clone https://github.com/your-org/youngwings-admin.git
cd youngwings-admin

# Установить зависимости
npm install

# Создать .env файл
cp .env.example .env
```

### 2. Настройка

Отредактируйте `.env`:

```env
VITE_API_BASE_URL=http://localhost:8080/api
```

Укажите URL вашего Kotlin API.

### 3. Запуск

```bash
npm run dev
```

Админка будет доступна на `http://localhost:5173`

## 📖 Документация

- **[QUICKSTART.md](./QUICKSTART.md)** - Подробный гайд по установке и настройке
- **[INTEGRATION_SUMMARY.md](./INTEGRATION_SUMMARY.md)** - Обзор интеграции с бэкендом
- **[TIPTAP_INTEGRATION.md](./TIPTAP_INTEGRATION.md)** - Интеграция TipTap редактора
- **[TIPTAP_JSON_EXAMPLES.md](./TIPTAP_JSON_EXAMPLES.md)** - Примеры JSON структур
- **[BACKEND_INTEGRATION.md](./BACKEND_INTEGRATION.md)** - Интеграция с Kotlin
- **[KOTLIN_API_EXAMPLES.md](./KOTLIN_API_EXAMPLES.md)** - Примеры Kotlin кода

## 🔧 Технологии

### Frontend
- React 18
- TypeScript
- Tailwind CSS v4
- TipTap (Rich Text Editor)
- Shadcn/ui (UI компоненты)
- Vite (Build tool)

### Backend (требуется реализация)
- Kotlin
- Spring Boot
- PostgreSQL
- JWT Authentication

## 📦 Структура проекта

```
/
├── AdminApp.tsx              # Главный компонент админки
├── App.tsx                   # Точка входа (только AdminApp)
├── components/
│   └── admin/
│       ├── AdminLayout.tsx       # Layout
│       ├── Dashboard.tsx         # Дашборд
│       ├── PostEditor.tsx        # TipTap редактор
│       ├── PostsManager.tsx      # Управление постами
│       ├── EventsManager.tsx     # Управление событиями
│       └── TranslatorsManager.tsx # Управление переводчиками
├── lib/
│   ├── api.ts               # API клиент
│   └── config.ts            # Конфигурация
└── docs/
    └── ... документация
```

## 🔌 API Endpoints

Ваш Kotlin API должен предоставлять:

### Авторизация
```
POST /api/auth/login
POST /api/auth/logout
```

### Посты
```
GET    /api/posts
GET    /api/posts/{id}
POST   /api/posts
PUT    /api/posts/{id}
DELETE /api/posts/{id}
```

### События
```
GET    /api/events
GET    /api/events/{id}
POST   /api/events
PUT    /api/events/{id}
DELETE /api/events/{id}
```

### Переводчики
```
GET    /api/translators
GET    /api/translators/{id}
POST   /api/translators
PUT    /api/translators/{id}
DELETE /api/translators/{id}
```

### Загрузка файлов
```
POST /api/upload
```

## 📝 Формат данных

### Создание поста

```json
{
  "title": "Заголовок",
  "content": "{\"type\":\"doc\",\"content\":[...]}",
  "excerpt": "Краткое описание",
  "imageUrl": "https://...",
  "category": "Технологии",
  "section": "Технологии и инновации",
  "author": "YoungWings",
  "readTime": "5 мин",
  "tags": ["AI", "Tech"],
  "status": "published"
}
```

**Важно:** `content` - это JSON строка от TipTap редактора!

## 🎨 TipTap контент

TipTap сохраняет контент в JSON формате:

```json
{
  "type": "doc",
  "content": [
    {
      "type": "paragraph",
      "content": [
        {
          "type": "text",
          "text": "Привет, мир!"
        }
      ]
    }
  ]
}
```

Этот JSON **сериализуется в строку** и отправляется в поле `content`.

На бэкенде просто сохраняйте как `TEXT` или `JSONB` поле в PostgreSQL.

Подробнее: [TIPTAP_INTEGRATION.md](./TIPTAP_INTEGRATION.md)

## 🔐 Авторизация

### Login Request
```json
{
  "email": "admin@youngwings.kz",
  "password": "password123"
}
```

### Login Response
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "1",
    "email": "admin@youngwings.kz",
    "name": "Администратор"
  }
}
```

Токен сохраняется в `localStorage` и автоматически добавляется ко всем запросам.

## 🚀 Production Build

```bash
# Build
npm run build

# Preview
npm run preview
```

Папка `dist/` содержит готовые файлы для деплоя.

### Deploy на Nginx

```nginx
server {
    listen 80;
    server_name admin.youngwings.kz;
    root /var/www/admin/dist;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

## 🛠️ Development

```bash
# Запустить dev сервер
npm run dev

# Build для продакшена
npm run build

# Preview production build
npm run preview

# Lint
npm run lint
```

## 📋 Checklist для интеграции

### Backend (Kotlin)

- [ ] Создать Entity для Post, Event, Translator
- [ ] Реализовать Controllers
- [ ] Настроить CORS
- [ ] Реализовать JWT аутентификацию
- [ ] Реализовать upload изображений
- [ ] Настроить PostgreSQL

### Frontend (Admin Panel)

- [x] Настроить API URL в .env
- [x] TipTap редактор
- [x] Управление постами
- [x] Управление событиями
- [x] Управление переводчиками
- [x] Upload изображений
- [x] Авторизация

## 🐛 Troubleshooting

### CORS ошибки

Убедитесь что в Kotlin настроен CORS:

```kotlin
@Configuration
class CorsConfig : WebMvcConfigurer {
    override fun addCorsMappings(registry: CorsRegistry) {
        registry.addMapping("/api/**")
            .allowedOrigins("http://localhost:5173")
            .allowedMethods("*")
            .allowedHeaders("*")
    }
}
```

### 401 Unauthorized

Проверьте:
1. Токен в localStorage
2. Header `Authorization: Bearer ${token}`
3. JWT validation на бэкенде

### Контент не сохраняется

Проверьте:
1. TipTap JSON валидный
2. Поле `content` в БД типа TEXT/JSONB
3. Content-Type: application/json

## 📞 Поддержка

- Email: dev@youngwings.kz
- GitHub Issues: [создать issue](https://github.com/your-org/youngwings-admin/issues)

## 📄 Лицензия

© 2025 YoungWings. Все права защищены.

---

**Сделано с ❤️ командой YoungWings**
