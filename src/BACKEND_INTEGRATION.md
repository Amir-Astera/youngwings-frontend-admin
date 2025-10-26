# Интеграция Admin Panel с Backend API

Этот документ описывает, как интегрировать админ-панель с вашим Kotlin Spring WebFlux бэкендом.

## Содержание
- [Быстрый старт](#быстрый-старт)
- [Конфигурация](#конфигурация)
- [API Endpoints](#api-endpoints)
- [Структуры данных](#структуры-данных)
- [Аутентификация](#аутентификация)
- [Загрузка файлов](#загрузка-файлов)

---

## Быстрый старт

### 1. Настройка API URL

Создайте файл `.env` в корне проекта:

```env
VITE_API_URL=http://localhost:8080/api
```

Или измените в файле `/lib/config.ts`:

```typescript
export const API_CONFIG = {
  BASE_URL: 'http://your-backend-url.com/api',
  // ...
};
```

### 2. Включение/отключение mock данных

В файле `/lib/config.ts`:

```typescript
SETTINGS: {
  USE_MOCK_DATA: false,  // false для работы с реальным API
}
```

### 3. Запуск

```bash
npm install
npm run dev
```

---

## Конфигурация

Все настройки находятся в файле `/lib/config.ts`:

```typescript
export const API_CONFIG = {
  BASE_URL: 'http://localhost:8080/api',
  
  ENDPOINTS: {
    LOGIN: '/auth/login',
    POSTS: '/posts',
    EVENTS: '/events',
    TRANSLATORS: '/translators',
    UPLOAD: '/upload',
  },
  
  SETTINGS: {
    REQUEST_TIMEOUT: 30000,
    USE_MOCK_DATA: true,  // true - использовать моки, false - реальный API
  }
};
```

---

## API Endpoints

### Authentication

#### POST /api/auth/login
Авторизация администратора

**Request:**
```json
{
  "email": "admin@youngwings.ru",
  "password": "admin123"
}
```

**Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "1",
    "email": "admin@youngwings.ru",
    "name": "Администратор"
  }
}
```

**Errors:**
- 401: Неверные учетные данные
- 500: Внутренняя ошибка сервера

---

### Posts (Посты)

#### GET /api/posts
Получить список постов

**Query Parameters:**
- `section` (optional): Фильтр по разделу
- `subsection` (optional): Фильтр по подразделу
- `page` (optional): Номер страницы (default: 1)
- `limit` (optional): Количество постов (default: 20)

**Example:**
```
GET /api/posts?section=Технологии и инновации&page=1&limit=10
```

**Response (200):**
```json
{
  "posts": [
    {
      "id": "1",
      "title": "Заголовок поста",
      "content": "{\"type\":\"doc\",\"content\":[...]}",
      "excerpt": "Краткое описание",
      "imageUrl": "https://example.com/image.jpg",
      "category": "Технологии",
      "section": "Технологии и инновации",
      "subsection": "AI и машинное обучение",
      "author": "OrientVentus",
      "publishedAt": "2025-01-15T10:00:00Z",
      "readTime": "5 мин",
      "views": 1234,
      "likes": 89,
      "commentsCount": 23,
      "tags": ["AI", "Технологии"],
      "status": "published"
    }
  ],
  "total": 42
}
```

#### GET /api/posts/{id}
Получить пост по ID

**Response (200):**
```json
{
  "id": "1",
  "title": "Заголовок поста",
  "content": "{\"type\":\"doc\",\"content\":[...]}",
  // ... остальные поля как в списке
}
```

**Errors:**
- 404: Пост не найден

#### POST /api/posts
Создать новый пост

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "Заголовок поста",
  "content": "{\"type\":\"doc\",\"content\":[{\"type\":\"paragraph\",\"content\":[{\"type\":\"text\",\"text\":\"Текст поста\"}]}]}",
  "excerpt": "Краткое описание для карточки",
  "imageUrl": "https://example.com/image.jpg",
  "category": "Технологии",
  "section": "Технологии и инновации",
  "subsection": "AI и машинное обучение",
  "author": "OrientVentus",
  "readTime": "5 мин",
  "tags": ["AI", "Технологии"],
  "status": "published"
}
```

**Response (201):**
```json
{
  "id": "123",
  "title": "Заголовок поста",
  // ... все поля поста
  "publishedAt": "2025-01-15T10:00:00Z",
  "views": 0,
  "likes": 0,
  "commentsCount": 0
}
```

**Важно о поле `content`:**
- `content` - это TipTap JSON сериализованный в строку
- Содержит полный контент статьи с форматированием
- На сайте отображается только при открытии полной статьи
- `excerpt` - отдельное поле для краткого описания в карточках

#### PUT /api/posts/{id}
Обновить пост

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "Обновленный заголовок",
  "status": "draft"
  // ... любые поля для обновления
}
```

**Response (200):**
```json
{
  "id": "123",
  // ... обновленный пост
}
```

#### DELETE /api/posts/{id}
Удалить пост

**Headers:**
```
Authorization: Bearer {token}
```

**Response (204):**
No content

---

### Events (События)

#### POST /api/admin/events
Создать событие (доступно только для администраторов).

**Request Body:**
```json
{
  "title": "AI Summit 2025",
  "description": "Главная конференция по ИИ в ЦА.",
  "eventDate": "2025-11-12",
  "eventTime": "10:00",
  "location": "Алматы, Дворец Республики",
  "format": "HYBRID",
  "region": "Казахстан",
  "sphere": "Технологии",
  "coverUrl": "https://orientventus.com/uploads/2025/10/cover.jpg",
  "registrationUrl": "https://example.com/register"
}
```

**Response (201):**
```json
{
  "id": "0b6a8a9b-1a3a-4c1a-9a9e-7c7f5a2d1a11",
  "title": "AI Summit 2025",
  "description": "Главная конференция по ИИ в ЦА.",
  "eventDate": "2025-11-12",
  "eventTime": "10:00",
  "location": "Алматы, Дворец Республики",
  "format": "HYBRID",
  "region": "Казахстан",
  "sphere": "Технологии",
  "coverUrl": "https://orientventus.com/uploads/2025/10/cover.jpg",
  "registrationUrl": "https://example.com/register",
  "createdAt": "2025-10-18T01:02:03",
  "updatedAt": "2025-10-18T01:02:03"
}
```

#### PUT /api/admin/events/{id}
Обновить существующее событие. Тело запроса совпадает со схемой создания. Успешный ответ возвращает обновлённый объект события.

#### DELETE /api/admin/events/{id}
Удалить событие. При успехе возвращает `204 No Content`.

#### GET /api/events/{id}
Получить одно событие по идентификатору.

**Response (200):**
```json
{
  "id": "0b6a8a9b-1a3a-4c1a-9a9e-7c7f5a2d1a11",
  "title": "AI Summit 2025",
  "description": "Главная конференция по ИИ в ЦА.",
  "eventDate": "2025-11-12",
  "eventTime": "10:00",
  "location": "Алматы, Дворец Республики",
  "format": "HYBRID",
  "region": "Казахстан",
  "sphere": "Технологии",
  "coverUrl": "https://orientventus.com/uploads/2025/10/cover.jpg",
  "registrationUrl": "https://example.com/register",
  "createdAt": "2025-10-18T01:02:03",
  "updatedAt": "2025-10-18T01:02:03"
}
```

#### GET /api/events
Получить список событий с пагинацией.

**Query Parameters:**
- `page` (number, default: 1)
- `size` (number, default: 20)

**Response (200):**
```json
{
  "total": 57,
  "page": 1,
  "size": 20,
  "items": [
    {
      "id": "0b6a8a9b-1a3a-4c1a-9a9e-7c7f5a2d1a11",
      "title": "AI Summit 2025",
      "description": "Главная конференция по ИИ в ЦА.",
      "eventDate": "2025-11-12",
      "eventTime": "10:00",
      "location": "Алматы, Дворец Республики",
      "format": "HYBRID",
      "region": "Казахстан",
      "sphere": "Технологии",
      "coverUrl": null,
      "registrationUrl": null,
      "createdAt": "2025-10-18T01:02:03",
      "updatedAt": "2025-10-18T01:02:03"
    }
  ]
}
```

---

### Comments (Комментарии)

#### GET /api/comment/admin/getPageComment
Получить список комментариев с пагинацией и фильтрами.

**Query Parameters:**
- `page` (number, ≥ 1, default: 1)
- `size` (number, 1..100, default: 20)
- `statuses` (string, повторяющийся параметр или CSV): `PENDING`, `APPROVED`, `REJECTED`
- `q` (string, optional): поиск по `content` и `authorName` (ILIKE)
- `dateFrom` (string, optional, формат `YYYY-MM-DD`)
- `dateTo` (string, optional, формат `YYYY-MM-DD`)

**Response (200):**
```json
{
  "total": 123,
  "page": 1,
  "size": 20,
  "items": [
    {
      "id": "c123",
      "postId": "p789",
      "authorName": "Иван Петров",
      "content": "Отличная статья!",
      "status": "APPROVED",
      "likeCount": 5,
      "dislikeCount": 0,
      "createdAt": "2025-10-18T01:00:00"
    }
  ]
}
```

#### GET /api/comment/admin/comment/{id}
Получить один комментарий.

**Response (200):**
```json
{
  "id": "c123",
  "postId": "p789",
  "authorName": "Иван Петров",
  "content": "Отличная статья!",
  "status": "APPROVED",
  "likeCount": 5,
  "dislikeCount": 0,
  "createdAt": "2025-10-18T01:00:00"
}
```

#### PUT /api/comment/admin/{postId}/comments/{commentId}/status
Изменить статус комментария.

**Request Body:**
```json
{
  "status": "APPROVED"
}
```

**Response (200):**
```json
{
  "id": "c123",
  "postId": "p789",
  "authorName": "Иван Петров",
  "content": "Отличная статья!",
  "status": "APPROVED",
  "likeCount": 5,
  "dislikeCount": 0,
  "createdAt": "2025-10-18T01:00:00"
}
```

`status` может принимать значения `PENDING`, `APPROVED`, `REJECTED`.

---

### Translators (Переводчики)

#### GET /api/translators
Получить список переводчиков

**Response (200):**
```json
[
  {
    "id": "1",
    "name": "Анна Петрова",
    "languages": ["Русский", "Английский", "Казахский"],
    "specialization": ["Технический перевод", "Юридический перевод"],
    "experience": "8+ лет",
    "hourlyRate": "8000 ₸",
    "available": true,
    "rating": 4.9,
    "completedProjects": 156
  }
]
```

#### POST /api/translators
Создать переводчика

**Request Body:**
```json
{
  "name": "Иван Иванов",
  "languages": ["Русский", "Английский"],
  "specialization": ["Технический перевод"],
  "experience": "5+ лет",
  "hourlyRate": "7000 ₸",
  "available": true
}
```

#### PUT /api/translators/{id}
Обновить переводчика

#### DELETE /api/translators/{id}
Удалить переводчика

---

## Структуры данных

### Post (Пост)

```typescript
interface Post {
  id?: string;              // UUID или String (генерируется на бэке)
  title: string;            // Заголовок поста
  content: string;          // TipTap JSON как строка
  excerpt: string;          // Краткое описание для карточки
  imageUrl?: string;        // URL главного изображения
  category: string;         // Категория (например: "Технологии")
  section: string;          // Раздел (например: "Технологии и инновации")
  subsection?: string;      // Подраздел (опционально)
  author: string;           // Автор поста
  publishedAt?: string;     // ISO 8601 дата публикации
  readTime: string;         // Время чтения (например: "5 мин")
  views?: number;           // Количество просмотров
  likes?: number;           // Количество лайков
  commentsCount?: number;   // Количество комментариев
  tags: string[];           // Массив тегов
  status: 'draft' | 'published';  // Статус публикации
}
```

### Event (Событие)

```typescript
interface Event {
  id?: string;
  title: string;
  description: string;
  eventDate: string;        // Формат: YYYY-MM-DD
  eventTime: string;        // Формат: HH:MM
  location: string;
  format: 'ONLINE' | 'OFFLINE' | 'HYBRID';
  region: string;
  sphere: string;
  coverUrl?: string | null;
  registrationUrl?: string | null;
  createdAt?: string;
  updatedAt?: string;
}
```

### Comment (Комментарий)

```typescript
interface Comment {
  id: string;
  postId: string;
  authorName: string;
  content: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  likeCount: number;
  dislikeCount: number;
  createdAt: string;        // ISO 8601 дата и время
}
```

### Translator (Переводчик)

```typescript
interface Translator {
  id?: string;
  name: string;
  languages: string[];
  specialization: string[];
  experience: string;
  hourlyRate: string;
  available: boolean;
  rating?: number;
  completedProjects?: number;
}
```

---

## Аутентификация

### JWT Token
Админ-панель использует JWT токены для аутентификации.

**Процесс:**
1. Пользователь вводит email и пароль
2. POST запрос на `/api/auth/login`
3. Сервер возвращает JWT токен
4. Токен сохраняется в `localStorage` с ключом `admin_token`
5. Все последующие запросы включают заголовок: `Authorization: Bearer {token}`

**Проверка токена:**
```typescript
// Проверить авторизацию
if (authApi.isAuthenticated()) {
  // Пользователь авторизован
}

// Выйти
authApi.logout(); // Удаляет токен из localStorage
```

---

## Загрузка файлов

### POST /api/upload
Загрузка изображений

**Headers:**
```
Authorization: Bearer {token}
Content-Type: multipart/form-data
```

**Request:**
```
FormData: {
  file: <binary>
}
```

**Response (200):**
```json
{
  "url": "https://your-cdn.com/images/abc123.jpg"
}
```

**Поддерживаемые форматы:**
- image/jpeg
- image/png
- image/webp
- image/gif

**Ограничения:**
- Максимальный размер: 5MB (настраивается на бэкенде)

---

## CORS настройки

Ваш Spring WebFlux бэкенд должен разрешать CORS запросы:

```kotlin
@Configuration
class CorsConfig {
    @Bean
    fun corsConfigurer(): WebFluxConfigurer {
        return object : WebFluxConfigurer {
            override fun addCorsMappings(registry: CorsRegistry) {
                registry.addMapping("/api/**")
                    .allowedOrigins("http://localhost:5173") // URL админки
                    .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                    .allowedHeaders("*")
                    .allowCredentials(true)
            }
        }
    }
}
```

---

## Примеры использования

### Создание поста из админки

```typescript
// 1. Пользователь заполняет форму в PostEditor
// 2. Нажимает "Опубликовать"
// 3. Вызывается:

const newPost = await postsApi.create({
  title: "Новый пост",
  content: '{"type":"doc","content":[...]}', // TipTap JSON
  excerpt: "Краткое описание",
  imageUrl: "https://...",
  category: "Технологии",
  section: "Технологии и инновации",
  author: "OrientVentus",
  readTime: "5 мин",
  tags: ["AI", "Технологии"],
  status: "published"
});

// 4. Пост сохраняется на бэкенде в базу данных
// 5. Возвращается созданный пост с ID
// 6. Админка показывает уведомление об успехе
```

### Обновление поста

```typescript
await postsApi.update("123", {
  title: "Обновленный заголовок",
  status: "draft"
});
```

---

## Troubleshooting

### Проблема: CORS ошибки
**Решение:** Проверьте настройки CORS на бэкенде

### Проблема: 401 Unauthorized
**Решение:** 
- Проверьте токен в localStorage
- Токен может быть истекшим - переавторизуйтесь

### Проблема: Не сохраняется TipTap контент
**Решение:**
- Убедитесь что `content` приходит как JSON строка
- Проверьте формат: `'{"type":"doc","content":[...]}'`

### Проблема: Изображения не загружаются
**Решение:**
- Проверьте endpoint `/api/upload`
- Убедитесь что сервер возвращает публичный URL

---

## Контакты

Если нужна помощь с интеграцией, обращайтесь к документации Spring WebFlux или создайте issue в репозитории проекта.
