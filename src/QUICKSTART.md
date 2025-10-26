# OrientVentus Admin Panel - Quick Start

## Описание

Это админ-панель для управления контентом новостного сайта OrientVentus. Панель работает **независимо** от основного сайта и общается с бэкендом только через API.

## Архитектура

```
┌─────────────────┐         API          ┌──────────────────┐
│  Admin Panel    │ ◄─────────────────► │  Kotlin Backend  │
│  (React + TS)   │                      │  (Spring Boot)   │
└─────────────────┘                      └──────────────────┘
                                                  │
                                                  ▼
                                         ┌──────────────────┐
                                         │    PostgreSQL    │
                                         └──────────────────┘
```

## Технологии

- **Frontend**: React + TypeScript + Tailwind CSS
- **Редактор**: TipTap (rich text editor)
- **Backend**: Kotlin Spring Boot (ваш API)
- **База данных**: PostgreSQL (на стороне бэкенда)

## Установка и запуск

### 1. Настройка окружения

Создайте файл `.env` в корне проекта:

```env
VITE_API_BASE_URL=http://localhost:8080/api
```

### 2. Установка зависимостей

```bash
npm install
```

### 3. Запуск в dev режиме

```bash
npm run dev
```

Админ-панель будет доступна по адресу: `http://localhost:5173`

### 4. Сборка для продакшена

```bash
npm run build
```

## Конфигурация API

Откройте `lib/config.ts`:

```typescript
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
```

Измените URL на адрес вашего Kotlin API.

## Авторизация

### Mock авторизация (для разработки)

По умолчанию используется mock авторизация. Любые credentials принимаются, токен сохраняется в localStorage.

### Настройка реальной авторизации

1. Откройте `lib/api.ts`
2. Найдите функцию `authApi.login`
3. Раскомментируйте реальный API вызов:

```typescript
export const authApi = {
  login: async (credentials: { email: string; password: string }) => {
    return api.post<{ token: string; user: any }>('/auth/login', credentials);
  },
  // ...
};
```

### Формат ответа бэкенда

Ваш Kotlin API должен возвращать:

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

## Основные возможности

### 1. Управление постами

- Создание постов с rich text редактором TipTap
- Сохранение как черновик или публикация
- Редактирование существующих постов
- Удаление постов
- Загрузка изображений

### 2. Управление событиями

- Создание и редактирование событий
- Указание даты, времени, места
- Управление статусом события

### 3. Управление переводчиками

- Добавление переводчиков
- Указание языков и специализации
- Управление доступностью

## Интеграция с Kotlin API

### Необходимые endpoints

Ваш Kotlin Spring Boot API должен предоставлять следующие endpoints:

#### Авторизация
- `POST /api/auth/login` - вход в систему
- `POST /api/auth/logout` - выход из системы

#### Посты
- `GET /api/posts` - получить список постов
- `GET /api/posts/{id}` - получить один пост
- `POST /api/posts` - создать пост
- `PUT /api/posts/{id}` - обновить пост
- `DELETE /api/posts/{id}` - удалить пост

#### События
- `GET /api/events` - получить список событий
- `GET /api/events/{id}` - получить одно событие
- `POST /api/events` - создать событие
- `PUT /api/events/{id}` - обновить событие
- `DELETE /api/events/{id}` - удалить событие

#### Переводчики
- `GET /api/translators` - получить список переводчиков
- `GET /api/translators/{id}` - получить одного переводчика
- `POST /api/translators` - создать переводчика
- `PUT /api/translators/{id}` - обновить переводчика
- `DELETE /api/translators/{id}` - удалить переводчика

#### Загрузка файлов
- `POST /api/upload` - загрузить изображение

### Формат данных поста

Пост отправляется в следующем формате:

```json
{
  "title": "Заголовок поста",
  "content": "{\"type\":\"doc\",\"content\":[...]}",
  "excerpt": "Краткое описание для карточки",
  "imageUrl": "https://example.com/image.jpg",
  "category": "Технологии",
  "section": "Технологии и инновации",
  "subsection": "AI и Machine Learning",
  "author": "OrientVentus",
  "readTime": "5 мин",
  "tags": ["AI", "Технологии"],
  "status": "published"
}
```

**Важно**: `content` - это строка с JSON от TipTap редактора. Подробнее в `TIPTAP_INTEGRATION.md`.

### Пример Kotlin Controller

```kotlin
@RestController
@RequestMapping("/api/posts")
class PostController(
    private val postService: PostService
) {
    @PostMapping
    fun createPost(@RequestBody request: CreatePostRequest): PostResponse {
        return postService.create(request)
    }
    
    @GetMapping("/{id}")
    fun getPost(@PathVariable id: UUID): PostResponse {
        return postService.getById(id)
    }
    
    @PutMapping("/{id}")
    fun updatePost(
        @PathVariable id: UUID,
        @RequestBody request: CreatePostRequest
    ): PostResponse {
        return postService.update(id, request)
    }
    
    @DeleteMapping("/{id}")
    fun deletePost(@PathVariable id: UUID) {
        postService.delete(id)
    }
}
```

## CORS настройка

Добавьте CORS в ваш Kotlin бэкенд:

```kotlin
@Configuration
class CorsConfig : WebMvcConfigurer {
    override fun addCorsMappings(registry: CorsRegistry) {
        registry.addMapping("/api/**")
            .allowedOrigins(
                "http://localhost:5173",  // Dev
                "https://admin.youngwings.kz"  // Prod
            )
            .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
            .allowedHeaders("*")
            .allowCredentials(true)
    }
}
```

## Загрузка изображений

### Frontend

Админ-панель отправляет файл через FormData:

```typescript
async uploadImage(file: File): Promise<{ url: string }> {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch(`${this.baseUrl}/upload`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });
  
  return response.json();
}
```

### Backend (Kotlin)

```kotlin
@PostMapping("/upload")
fun uploadImage(@RequestParam("file") file: MultipartFile): Map<String, String> {
    // Сохраните файл в S3, MinIO или локально
    val url = fileStorageService.save(file)
    return mapOf("url" to url)
}
```

Ответ должен быть:

```json
{
  "url": "https://cdn.youngwings.kz/images/abc123.jpg"
}
```

## Структура проекта

```
/
├── AdminApp.tsx              # Главный компонент админ-панели
├── App.tsx                   # Точка входа (только AdminApp)
├── lib/
│   ├── api.ts               # API клиент и типы
│   └── config.ts            # Конфигурация API
├── components/
│   └── admin/
│       ├── AdminLayout.tsx       # Layout админ-панели
│       ├── Dashboard.tsx         # Главная страница
│       ├── PostEditor.tsx        # TipTap редактор постов
│       ├── PostsManager.tsx      # Управление постами
│       ├── EventsManager.tsx     # Управление событиями
│       └── TranslatorsManager.tsx # Управление переводчиками
├── TIPTAP_INTEGRATION.md    # Документация по TipTap
├── QUICKSTART.md           # Этот файл
└── README.md               # Основная документация
```

## TipTap Content

Контент из TipTap редактора сохраняется в формате JSON:

```json
{
  "type": "doc",
  "content": [
    {
      "type": "paragraph",
      "content": [
        {
          "type": "text",
          "text": "Привет, мир!",
          "marks": [{ "type": "bold" }]
        }
      ]
    }
  ]
}
```

**Важно**: 
- Это JSON **сериализуется в строку** перед отправкой на бэкенд
- На бэкенде храните как `TEXT` или `JSONB` поле
- Подробная документация: `TIPTAP_INTEGRATION.md`

## Troubleshooting

### Ошибка CORS

Убедитесь что в Kotlin настроен CORS для вашего домена админ-панели.

### Ошибка 401 Unauthorized

Проверьте что токен правильно сохраняется в localStorage и отправляется в заголовке `Authorization`.

### Контент не сохраняется

Проверьте что:
1. TipTap JSON правильно сериализуется в строку
2. На бэкенде поле `content` имеет тип `TEXT` или `JSONB`
3. JSON валидный (можно проверить в консоли браузера)

### Изображения не загружаются

Проверьте:
1. Endpoint `/api/upload` существует
2. Возвращает `{ "url": "..." }`
3. CORS настроен для multipart/form-data

## Полезные ссылки

- [TipTap Integration Guide](./TIPTAP_INTEGRATION.md) - детальная документация по TipTap
- [Backend Integration Guide](./BACKEND_INTEGRATION.md) - интеграция с бэкендом
- [Kotlin API Examples](./KOTLIN_API_EXAMPLES.md) - примеры Kotlin кода

## Поддержка

При возникновении проблем:
1. Проверьте консоль браузера (F12)
2. Проверьте Network tab для API запросов
3. Проверьте логи Kotlin бэкенда
4. Убедитесь что API_BASE_URL правильный

## Production Deployment

### 1. Build

```bash
npm run build
```

### 2. Деплой статики

Папка `dist/` содержит готовые статические файлы. Задеплойте их на:
- Nginx
- Apache
- Cloudflare Pages
- Vercel
- Netlify

### 3. Настройка Nginx (пример)

```nginx
server {
    listen 80;
    server_name admin.youngwings.kz;
    
    root /var/www/admin/dist;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Кэширование статики
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### 4. Environment Variables

Для продакшена создайте `.env.production`:

```env
VITE_API_BASE_URL=https://api.youngwings.kz/api
```

И соберите с:

```bash
npm run build
```

## Лицензия

© 2025 OrientVentus. Все права защищены.
