# OrientVentus Admin Panel - Integration Summary

## Что было сделано

### 1. Упрощена архитектура

✅ **Убрана вся логика новостного сайта** из админ-панели  
✅ **App.tsx теперь показывает только AdminApp** - никакого роутинга, никаких зависимостей от сайта  
✅ **Админка работает полностью автономно** - только через API с бэкендом

### 2. Чистая интеграция с Kotlin API

✅ **lib/api.ts** - убраны все моки, остались только реальные API вызовы  
✅ **lib/config.ts** - простая конфигурация через .env файл  
✅ **Все данные передаются через REST API** в JSON формате

### 3. TipTap редактор

✅ **PostEditor** сохраняет контент как JSON строку  
✅ **Формат данных подготовлен для Kotlin** - просто сохраняйте в TEXT/JSONB поле  
✅ **Подробная документация** по структуре JSON и примерам

## Как это работает

```
┌─────────────────────┐
│   Браузер           │
│   (Admin Panel)     │
└──────────┬──────────┘
           │ HTTP/JSON
           ▼
┌─────────────────────┐
│   Kotlin Spring     │
│   Boot API          │
└──────────┬──────────┘
           │ JDBC
           ▼
┌─────────────────────┐
│   PostgreSQL        │
└─────────────────────┘
```

### Поток данных при создании поста:

1. **Пользователь** создает пост в TipTap редакторе
2. **TipTap** генерирует JSON контент
3. **PostEditor** сериализует JSON в строку
4. **API клиент** отправляет POST запрос на `/api/posts`
5. **Kotlin controller** получает данные
6. **Service** валидирует и сохраняет в PostgreSQL
7. **Response** возвращается обратно в админ-панель

## Структура проекта

```
OrientVentus Admin Panel/
├── App.tsx                    # Только AdminApp
├── AdminApp.tsx               # Главный компонент админки
│
├── lib/
│   ├── api.ts                # API клиент (без моков)
│   └── config.ts             # Конфигурация API URL
│
├── components/admin/
│   ├── PostEditor.tsx        # TipTap редактор
│   ├── PostsManager.tsx      # Управление постами
│   ├── EventsManager.tsx     # Управление событиями
│   └── TranslatorsManager.tsx # Управление переводчиками
│
└── Documentation/
    ├── QUICKSTART.md              # Быстрый старт
    ├── TIPTAP_INTEGRATION.md      # Интеграция TipTap
    ├── TIPTAP_JSON_EXAMPLES.md    # Примеры JSON
    └── INTEGRATION_SUMMARY.md     # Этот файл
```

## Что нужно сделать на бэкенде (Kotlin)

### 1. Создать Entity для Post

```kotlin
@Entity
@Table(name = "posts")
data class Post(
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    val id: UUID? = null,
    
    val title: String,
    
    @Column(columnDefinition = "TEXT")
    val content: String,  // ← TipTap JSON как строка
    
    val excerpt: String,
    val imageUrl: String? = null,
    val category: String,
    val section: String,
    val subsection: String? = null,
    val author: String,
    val publishedAt: LocalDateTime,
    val readTime: String,
    val views: Int = 0,
    val likes: Int = 0,
    val commentsCount: Int = 0,
    
    @ElementCollection
    val tags: List<String> = emptyList(),
    
    @Enumerated(EnumType.STRING)
    val status: PostStatus = PostStatus.DRAFT
)

enum class PostStatus {
    DRAFT, PUBLISHED
}
```

### 2. Создать Controller

```kotlin
@RestController
@RequestMapping("/api/posts")
class PostController(private val postService: PostService) {
    
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
    
    @GetMapping
    fun getPosts(
        @RequestParam(required = false) section: String?,
        @RequestParam(required = false) subsection: String?,
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "20") limit: Int
    ): PagedResponse<PostResponse> {
        return postService.getAll(section, subsection, page, limit)
    }
}
```

### 3. Настроить CORS

```kotlin
@Configuration
class CorsConfig : WebMvcConfigurer {
    override fun addCorsMappings(registry: CorsRegistry) {
        registry.addMapping("/api/**")
            .allowedOrigins(
                "http://localhost:5173",
                "https://admin.youngwings.kz"
            )
            .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
            .allowedHeaders("*")
            .allowCredentials(true)
    }
}
```

### 4. Реализовать Upload

```kotlin
@PostMapping("/upload")
fun uploadImage(@RequestParam("file") file: MultipartFile): Map<String, String> {
    // Сохраните в S3, MinIO или локально
    val url = fileService.save(file)
    return mapOf("url" to url)
}
```

## Настройка админ-панели

### 1. Создайте .env файл

```bash
cp .env.example .env
```

Содержимое `.env`:
```
VITE_API_BASE_URL=http://localhost:8080/api
```

### 2. Установите зависимости

```bash
npm install
```

### 3. Запустите в dev режиме

```bash
npm run dev
```

Админка будет на `http://localhost:5173`

## Формат данных

### Создание поста (POST /api/posts)

```json
{
  "title": "Заголовок поста",
  "content": "{\"type\":\"doc\",\"content\":[{\"type\":\"paragraph\",\"content\":[{\"type\":\"text\",\"text\":\"Текст статьи\"}]}]}",
  "excerpt": "Краткое описание для карточки",
  "imageUrl": "https://cdn.youngwings.kz/image.jpg",
  "category": "Технологии",
  "section": "Технологии и инновации",
  "author": "OrientVentus",
  "readTime": "5 мин",
  "tags": ["AI", "Технологии"],
  "status": "published"
}
```

**Важно:** `content` - это строка с JSON от TipTap!

### Ответ от API

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Заголовок поста",
  "content": "{\"type\":\"doc\",...}",
  "excerpt": "Краткое описание",
  "imageUrl": "https://...",
  "category": "Технологии",
  "section": "Технологии и инновации",
  "author": "OrientVentus",
  "publishedAt": "2025-01-15T10:00:00Z",
  "readTime": "5 мин",
  "views": 0,
  "likes": 0,
  "commentsCount": 0,
  "tags": ["AI", "Технологии"],
  "status": "published"
}
```

## Ключевые особенности TipTap

### 1. Контент хранится как JSON строка

```typescript
// В админ-панели
const contentJSON = editor.getJSON();
const contentString = JSON.stringify(contentJSON);

// Отправляется на бэкенд
{
  "content": "{\"type\":\"doc\",\"content\":[...]}"
}
```

### 2. В Kotlin просто сохраняйте строку

```kotlin
@Column(columnDefinition = "TEXT")
val content: String  // Храните как есть
```

### 3. Для отображения в основном приложении

Просто отправьте строку обратно - фронтенд сайта сам распарсит JSON и отрендерит контент.

## Безопасность

### 1. JWT Authentication

```kotlin
// В Kotlin
@PostMapping("/auth/login")
fun login(@RequestBody request: LoginRequest): LoginResponse {
    val user = authService.authenticate(request.email, request.password)
    val token = jwtService.generateToken(user)
    return LoginResponse(token, user)
}
```

### 2. В админ-панели

Токен автоматически добавляется к каждому запросу:

```typescript
private getHeaders(): HeadersInit {
  const token = localStorage.getItem('admin_token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
}
```

## Deployment

### Frontend (Админка)

```bash
npm run build
```

Deploy папку `dist/` на:
- Nginx
- Cloudflare Pages
- Vercel
- Netlify

### Backend (Kotlin)

```bash
./gradlew bootJar
```

Deploy `.jar` на сервер и запустите:

```bash
java -jar app.jar
```

## Полезные команды

```bash
# Development
npm run dev

# Build
npm run build

# Preview production build
npm run preview

# Lint
npm run lint
```

## Документация

- **QUICKSTART.md** - Быстрый старт и установка
- **TIPTAP_INTEGRATION.md** - Детальная документация по TipTap
- **TIPTAP_JSON_EXAMPLES.md** - Примеры JSON структур
- **BACKEND_INTEGRATION.md** - Интеграция с бэкендом
- **KOTLIN_API_EXAMPLES.md** - Примеры Kotlin кода

## Поддержка

При проблемах:

1. Проверьте консоль браузера (F12 → Console)
2. Проверьте Network tab (F12 → Network)
3. Проверьте что API_BASE_URL правильный
4. Проверьте CORS настройки в Kotlin
5. Проверьте логи Kotlin приложения

## Итог

✨ **Админка полностью готова к интеграции с Kotlin Spring Boot API**

✅ Чистая архитектура без зависимостей от новостного сайта  
✅ Простая конфигурация через .env  
✅ TipTap контент готов для сохранения в БД  
✅ Полная документация и примеры  
✅ Готово к продакшену  

Просто реализуйте endpoints на Kotlin и админка заработает! 🚀
