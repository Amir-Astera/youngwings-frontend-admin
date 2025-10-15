# TipTap Integration Guide для Kotlin Spring Boot

## Обзор

Админ-панель YoungWings использует TipTap редактор для создания контента постов. TipTap сохраняет контент в формате JSON, который передается на бэкенд.

## Формат данных TipTap

### Структура JSON

TipTap сохраняет контент в виде JSON дерева с узлами (nodes). Каждый узел имеет `type` и может содержать `content` (массив дочерних узлов) и `attrs` (атрибуты).

### Пример простого текста

```json
{
  "type": "doc",
  "content": [
    {
      "type": "paragraph",
      "content": [
        {
          "type": "text",
          "text": "Это простой параграф текста."
        }
      ]
    }
  ]
}
```

### Пример с форматированием

```json
{
  "type": "doc",
  "content": [
    {
      "type": "paragraph",
      "content": [
        {
          "type": "text",
          "text": "Это текст с ",
          "marks": []
        },
        {
          "type": "text",
          "text": "жирным",
          "marks": [
            {
              "type": "bold"
            }
          ]
        },
        {
          "type": "text",
          "text": " и ",
          "marks": []
        },
        {
          "type": "text",
          "text": "курсивом",
          "marks": [
            {
              "type": "italic"
            }
          ]
        },
        {
          "type": "text",
          "text": ".",
          "marks": []
        }
      ]
    }
  ]
}
```

### Пример с изображением

```json
{
  "type": "doc",
  "content": [
    {
      "type": "paragraph",
      "content": [
        {
          "type": "text",
          "text": "Посмотрите на это изображение:"
        }
      ]
    },
    {
      "type": "image",
      "attrs": {
        "src": "https://example.com/image.jpg",
        "alt": null,
        "title": null
      }
    },
    {
      "type": "paragraph",
      "content": [
        {
          "type": "text",
          "text": "Красиво, правда?"
        }
      ]
    }
  ]
}
```

### Пример со списком

```json
{
  "type": "doc",
  "content": [
    {
      "type": "bulletList",
      "content": [
        {
          "type": "listItem",
          "content": [
            {
              "type": "paragraph",
              "content": [
                {
                  "type": "text",
                  "text": "Первый пункт"
                }
              ]
            }
          ]
        },
        {
          "type": "listItem",
          "content": [
            {
              "type": "paragraph",
              "content": [
                {
                  "type": "text",
                  "text": "Второй пункт"
                }
              ]
            }
          ]
        }
      ]
    }
  ]
}
```

### Пример со ссылкой

```json
{
  "type": "doc",
  "content": [
    {
      "type": "paragraph",
      "content": [
        {
          "type": "text",
          "text": "Посетите "
        },
        {
          "type": "text",
          "text": "наш сайт",
          "marks": [
            {
              "type": "link",
              "attrs": {
                "href": "https://youngwings.kz",
                "target": "_blank"
              }
            }
          ]
        },
        {
          "type": "text",
          "text": " для подробностей."
        }
      ]
    }
  ]
}
```

### Пример с цитатой

```json
{
  "type": "doc",
  "content": [
    {
      "type": "blockquote",
      "content": [
        {
          "type": "paragraph",
          "content": [
            {
              "type": "text",
              "text": "Это важная цитата из статьи."
            }
          ]
        }
      ]
    }
  ]
}
```

## Kotlin Data Classes

### Основные классы для парсинга

```kotlin
data class TipTapDocument(
    val type: String = "doc",
    val content: List<TipTapNode>
)

data class TipTapNode(
    val type: String,
    val content: List<TipTapNode>? = null,
    val attrs: Map<String, Any?>? = null,
    val text: String? = null,
    val marks: List<TipTapMark>? = null
)

data class TipTapMark(
    val type: String,
    val attrs: Map<String, Any?>? = null
)
```

### Пример Entity для поста

```kotlin
@Entity
@Table(name = "posts")
data class Post(
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    val id: UUID? = null,
    
    @Column(nullable = false)
    val title: String,
    
    @Column(columnDefinition = "TEXT", nullable = false)
    val content: String, // JSON строка TipTap
    
    @Column(columnDefinition = "TEXT")
    val excerpt: String,
    
    @Column(name = "image_url")
    val imageUrl: String? = null,
    
    @Column(nullable = false)
    val category: String,
    
    @Column(nullable = false)
    val section: String,
    
    val subsection: String? = null,
    
    @Column(nullable = false)
    val author: String,
    
    @Column(name = "published_at")
    val publishedAt: LocalDateTime,
    
    @Column(name = "read_time")
    val readTime: String,
    
    val views: Int = 0,
    val likes: Int = 0,
    
    @Column(name = "comments_count")
    val commentsCount: Int = 0,
    
    @ElementCollection
    val tags: List<String> = emptyList(),
    
    @Enumerated(EnumType.STRING)
    val status: PostStatus = PostStatus.DRAFT,
    
    @Column(name = "created_at")
    val createdAt: LocalDateTime = LocalDateTime.now(),
    
    @Column(name = "updated_at")
    val updatedAt: LocalDateTime = LocalDateTime.now()
)

enum class PostStatus {
    DRAFT, PUBLISHED
}
```

### DTO для создания/обновления

```kotlin
data class CreatePostRequest(
    val title: String,
    val content: String, // JSON строка TipTap
    val excerpt: String,
    val imageUrl: String? = null,
    val category: String,
    val section: String,
    val subsection: String? = null,
    val author: String,
    val readTime: String,
    val tags: List<String> = emptyList(),
    val status: PostStatus = PostStatus.DRAFT
)

data class PostResponse(
    val id: String,
    val title: String,
    val content: String,
    val excerpt: String,
    val imageUrl: String?,
    val category: String,
    val section: String,
    val subsection: String?,
    val author: String,
    val publishedAt: String, // ISO 8601
    val readTime: String,
    val views: Int,
    val likes: Int,
    val commentsCount: Int,
    val tags: List<String>,
    val status: String
)
```

## API Endpoints

### Создание поста

**POST** `/api/posts`

```kotlin
@PostMapping
fun createPost(@RequestBody request: CreatePostRequest): ResponseEntity<PostResponse> {
    // Валидация JSON контента (опционально)
    try {
        objectMapper.readTree(request.content)
    } catch (e: Exception) {
        throw BadRequestException("Invalid TipTap JSON content")
    }
    
    val post = Post(
        title = request.title,
        content = request.content, // Сохраняем как строку
        excerpt = request.excerpt,
        imageUrl = request.imageUrl,
        category = request.category,
        section = request.section,
        subsection = request.subsection,
        author = request.author,
        publishedAt = if (request.status == PostStatus.PUBLISHED) 
            LocalDateTime.now() else LocalDateTime.now(),
        readTime = request.readTime,
        tags = request.tags,
        status = request.status
    )
    
    val saved = postRepository.save(post)
    return ResponseEntity.ok(saved.toResponse())
}
```

### Обновление поста

**PUT** `/api/posts/{id}`

```kotlin
@PutMapping("/{id}")
fun updatePost(
    @PathVariable id: UUID,
    @RequestBody request: CreatePostRequest
): ResponseEntity<PostResponse> {
    val post = postRepository.findById(id)
        .orElseThrow { NotFoundException("Post not found") }
    
    val updated = post.copy(
        title = request.title,
        content = request.content,
        excerpt = request.excerpt,
        imageUrl = request.imageUrl,
        category = request.category,
        section = request.section,
        subsection = request.subsection,
        author = request.author,
        readTime = request.readTime,
        tags = request.tags,
        status = request.status,
        updatedAt = LocalDateTime.now(),
        publishedAt = if (request.status == PostStatus.PUBLISHED && post.status == PostStatus.DRAFT)
            LocalDateTime.now() else post.publishedAt
    )
    
    val saved = postRepository.save(updated)
    return ResponseEntity.ok(saved.toResponse())
}
```

### Получение поста

**GET** `/api/posts/{id}`

```kotlin
@GetMapping("/{id}")
fun getPost(@PathVariable id: UUID): ResponseEntity<PostResponse> {
    val post = postRepository.findById(id)
        .orElseThrow { NotFoundException("Post not found") }
    
    return ResponseEntity.ok(post.toResponse())
}
```

### Получение списка постов

**GET** `/api/posts?section=...&subsection=...&page=0&limit=20`

```kotlin
@GetMapping
fun getPosts(
    @RequestParam(required = false) section: String?,
    @RequestParam(required = false) subsection: String?,
    @RequestParam(defaultValue = "0") page: Int,
    @RequestParam(defaultValue = "20") limit: Int
): ResponseEntity<PagedPostsResponse> {
    val pageable = PageRequest.of(page, limit, Sort.by("publishedAt").descending())
    
    val posts = when {
        section != null && subsection != null -> 
            postRepository.findBySectionAndSubsectionAndStatus(section, subsection, PostStatus.PUBLISHED, pageable)
        section != null -> 
            postRepository.findBySectionAndStatus(section, PostStatus.PUBLISHED, pageable)
        else -> 
            postRepository.findByStatus(PostStatus.PUBLISHED, pageable)
    }
    
    return ResponseEntity.ok(PagedPostsResponse(
        posts = posts.content.map { it.toResponse() },
        total = posts.totalElements,
        page = page,
        totalPages = posts.totalPages
    ))
}
```

### Удаление поста

**DELETE** `/api/posts/{id}`

```kotlin
@DeleteMapping("/{id}")
fun deletePost(@PathVariable id: UUID): ResponseEntity<Void> {
    postRepository.deleteById(id)
    return ResponseEntity.noContent().build()
}
```

## Важные замечания

### 1. Хранение контента

Храните TipTap JSON как **строку** в базе данных в поле типа `TEXT` или `JSONB` (PostgreSQL).

```kotlin
@Column(columnDefinition = "TEXT", nullable = false)
val content: String
```

### 2. Валидация JSON

Рекомендуется валидировать JSON перед сохранением:

```kotlin
fun validateTipTapContent(content: String): Boolean {
    return try {
        val node = objectMapper.readValue(content, TipTapDocument::class.java)
        node.type == "doc" && node.content != null
    } catch (e: Exception) {
        false
    }
}
```

### 3. Excerpt vs Content

- `excerpt` - краткое описание для карточек новостей (обычный текст)
- `content` - полный контент статьи в формате TipTap JSON (показывается на детальной странице)

### 4. Даты

Используйте ISO 8601 формат для дат:

```kotlin
val publishedAt: LocalDateTime

// В DTO
val publishedAt: String = post.publishedAt.format(DateTimeFormatter.ISO_DATE_TIME)
```

### 5. CORS

Не забудьте настроить CORS для админ-панели:

```kotlin
@Configuration
class CorsConfig : WebMvcConfigurer {
    override fun addCorsMappings(registry: CorsRegistry) {
        registry.addMapping("/api/**")
            .allowedOrigins("http://localhost:5173", "https://admin.youngwings.kz")
            .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
            .allowedHeaders("*")
            .allowCredentials(true)
    }
}
```

## Примеры использования

### Парсинг TipTap JSON в HTML (опционально)

Если нужно преобразовать TipTap JSON в HTML на бэкенде:

```kotlin
class TipTapToHtmlConverter {
    fun convert(json: String): String {
        val doc = objectMapper.readValue(json, TipTapDocument::class.java)
        return renderNode(doc)
    }
    
    private fun renderNode(node: TipTapNode): String {
        return when (node.type) {
            "doc" -> node.content?.joinToString("") { renderNode(it) } ?: ""
            "paragraph" -> "<p>${renderContent(node.content)}</p>"
            "text" -> renderText(node)
            "image" -> "<img src=\"${node.attrs?.get("src")}\" />"
            "bulletList" -> "<ul>${renderContent(node.content)}</ul>"
            "listItem" -> "<li>${renderContent(node.content)}</li>"
            "blockquote" -> "<blockquote>${renderContent(node.content)}</blockquote>"
            else -> ""
        }
    }
    
    private fun renderContent(content: List<TipTapNode>?): String {
        return content?.joinToString("") { renderNode(it) } ?: ""
    }
    
    private fun renderText(node: TipTapNode): String {
        var text = node.text ?: ""
        node.marks?.forEach { mark ->
            text = when (mark.type) {
                "bold" -> "<strong>$text</strong>"
                "italic" -> "<em>$text</em>"
                "underline" -> "<u>$text</u>"
                "link" -> "<a href=\"${mark.attrs?.get("href")}\">$text</a>"
                else -> text
            }
        }
        return text
    }
}
```

## Тестирование

### Пример JSON для тестирования

```json
{
  "title": "Тестовый пост",
  "content": "{\"type\":\"doc\",\"content\":[{\"type\":\"paragraph\",\"content\":[{\"type\":\"text\",\"text\":\"Это тестовый пост с \",\"marks\":[]},{\"type\":\"text\",\"text\":\"жирным текстом\",\"marks\":[{\"type\":\"bold\"}]},{\"type\":\"text\",\"text\":\" и \",\"marks\":[]},{\"type\":\"text\",\"text\":\"ссылкой\",\"marks\":[{\"type\":\"link\",\"attrs\":{\"href\":\"https://example.com\"}}]},{\"type\":\"text\",\"text\":\".\",\"marks\":[]}]}]}",
  "excerpt": "Краткое описание тестового поста",
  "category": "Технологии",
  "section": "Технологии и инновации",
  "author": "YoungWings",
  "readTime": "5 мин",
  "tags": ["тест", "пример"],
  "status": "published"
}
```

### cURL команда для тестирования

```bash
curl -X POST http://localhost:8080/api/posts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "title": "Тестовый пост",
    "content": "{\"type\":\"doc\",\"content\":[{\"type\":\"paragraph\",\"content\":[{\"type\":\"text\",\"text\":\"Привет мир!\"}]}]}",
    "excerpt": "Краткое описание",
    "category": "Технологии",
    "section": "Технологии и инновации",
    "author": "YoungWings",
    "readTime": "5 мин",
    "tags": ["тест"],
    "status": "published"
  }'
```

## Поддерживаемые типы узлов

Админ-панель использует следующие типы узлов TipTap:

- `doc` - корневой узел документа
- `paragraph` - параграф
- `text` - текстовый узел
- `heading` - заголовок (levels 1-6)
- `bulletList` - маркированный список
- `orderedList` - нумерованный список
- `listItem` - элемент списка
- `blockquote` - цитата
- `image` - изображение
- `codeBlock` - блок кода
- `hardBreak` - перенос строки

## Поддерживаемые marks (форматирование)

- `bold` - жирный текст
- `italic` - курсив
- `underline` - подчеркнутый текст
- `link` - ссылка
- `code` - inline код
