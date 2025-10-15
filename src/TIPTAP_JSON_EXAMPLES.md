# TipTap JSON Examples

Примеры JSON контента, который отправляется из админ-панели в Kotlin API.

## Базовая структура

Все TipTap документы имеют корневой тип `doc`:

```json
{
  "type": "doc",
  "content": [
    // массив узлов
  ]
}
```

## 1. Простой текст

**Что видит пользователь в редакторе:**
```
Привет, мир!
```

**JSON который отправляется на бэкенд:**
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

## 2. Жирный и курсивный текст

**Что видит пользователь:**
```
Это **жирный** и *курсивный* текст.
```

**JSON:**
```json
{
  "type": "doc",
  "content": [
    {
      "type": "paragraph",
      "content": [
        {
          "type": "text",
          "text": "Это "
        },
        {
          "type": "text",
          "text": "жирный",
          "marks": [
            {
              "type": "bold"
            }
          ]
        },
        {
          "type": "text",
          "text": " и "
        },
        {
          "type": "text",
          "text": "курсивный",
          "marks": [
            {
              "type": "italic"
            }
          ]
        },
        {
          "type": "text",
          "text": " текст."
        }
      ]
    }
  ]
}
```

## 3. Заголовки

**Что видит пользователь:**
```
# Заголовок H1
## Заголовок H2
Обычный текст
```

**JSON:**
```json
{
  "type": "doc",
  "content": [
    {
      "type": "heading",
      "attrs": {
        "level": 1
      },
      "content": [
        {
          "type": "text",
          "text": "Заголовок H1"
        }
      ]
    },
    {
      "type": "heading",
      "attrs": {
        "level": 2
      },
      "content": [
        {
          "type": "text",
          "text": "Заголовок H2"
        }
      ]
    },
    {
      "type": "paragraph",
      "content": [
        {
          "type": "text",
          "text": "Обычный текст"
        }
      ]
    }
  ]
}
```

## 4. Список (маркированный)

**Что видит пользователь:**
```
• Первый пункт
• Второй пункт
• Третий пункт
```

**JSON:**
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
        },
        {
          "type": "listItem",
          "content": [
            {
              "type": "paragraph",
              "content": [
                {
                  "type": "text",
                  "text": "Третий пункт"
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

## 5. Нумерованный список

**Что видит пользователь:**
```
1. Первый пункт
2. Второй пункт
3. Третий пункт
```

**JSON:**
```json
{
  "type": "doc",
  "content": [
    {
      "type": "orderedList",
      "attrs": {
        "start": 1
      },
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
        },
        {
          "type": "listItem",
          "content": [
            {
              "type": "paragraph",
              "content": [
                {
                  "type": "text",
                  "text": "Третий пункт"
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

## 6. Цитата

**Что видит пользователь:**
```
> Это важная цитата из статьи.
> Она может занимать несколько строк.
```

**JSON:**
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
        },
        {
          "type": "paragraph",
          "content": [
            {
              "type": "text",
              "text": "Она может занимать несколько строк."
            }
          ]
        }
      ]
    }
  ]
}
```

## 7. Ссылка

**Что видит пользователь:**
```
Посетите [наш сайт](https://youngwings.kz) для деталей.
```

**JSON:**
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
          "text": " для деталей."
        }
      ]
    }
  ]
}
```

## 8. Изображение

**Что видит пользователь:**
```
Текст перед изображением

[Изображение]

Текст после изображения
```

**JSON:**
```json
{
  "type": "doc",
  "content": [
    {
      "type": "paragraph",
      "content": [
        {
          "type": "text",
          "text": "Текст перед изображением"
        }
      ]
    },
    {
      "type": "image",
      "attrs": {
        "src": "https://cdn.youngwings.kz/images/example.jpg",
        "alt": null,
        "title": null
      }
    },
    {
      "type": "paragraph",
      "content": [
        {
          "type": "text",
          "text": "Текст после изображения"
        }
      ]
    }
  ]
}
```

## 9. Комбинированный пример (реальная статья)

**Что видит пользователь:**
```
# Новые технологии в AI

Искусственный интеллект продолжает развиваться с **невероятной скоростью**. 

## Ключевые тренды

• Генеративный AI
• Машинное обучение
• Нейронные сети

> AI - это будущее технологий.

Подробнее на [нашем сайте](https://youngwings.kz).
```

**JSON:**
```json
{
  "type": "doc",
  "content": [
    {
      "type": "heading",
      "attrs": {
        "level": 1
      },
      "content": [
        {
          "type": "text",
          "text": "Новые технологии в AI"
        }
      ]
    },
    {
      "type": "paragraph",
      "content": [
        {
          "type": "text",
          "text": "Искусственный интеллект продолжает развиваться с "
        },
        {
          "type": "text",
          "text": "невероятной скоростью",
          "marks": [
            {
              "type": "bold"
            }
          ]
        },
        {
          "type": "text",
          "text": ". "
        }
      ]
    },
    {
      "type": "heading",
      "attrs": {
        "level": 2
      },
      "content": [
        {
          "type": "text",
          "text": "Ключевые тренды"
        }
      ]
    },
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
                  "text": "Генеративный AI"
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
                  "text": "Машинное обучение"
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
                  "text": "Нейронные сети"
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "type": "blockquote",
      "content": [
        {
          "type": "paragraph",
          "content": [
            {
              "type": "text",
              "text": "AI - это будущее технологий."
            }
          ]
        }
      ]
    },
    {
      "type": "paragraph",
      "content": [
        {
          "type": "text",
          "text": "Подробнее на "
        },
        {
          "type": "text",
          "text": "нашем сайте",
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
          "text": "."
        }
      ]
    }
  ]
}
```

## Как это передается на бэкенд?

### В HTTP запросе

JSON **сериализуется в строку** и отправляется в поле `content`:

```json
{
  "title": "Новые технологии в AI",
  "content": "{\"type\":\"doc\",\"content\":[{\"type\":\"heading\",\"attrs\":{\"level\":1},\"content\":[{\"type\":\"text\",\"text\":\"Новые технологии в AI\"}]},...]}",
  "excerpt": "Краткое описание статьи",
  "category": "Технологии",
  "section": "Технологии и инновации",
  "author": "YoungWings",
  "readTime": "5 мин",
  "tags": ["AI", "Технологии"],
  "status": "published"
}
```

### В Kotlin

```kotlin
data class CreatePostRequest(
    val title: String,
    val content: String,  // ← Строка с JSON
    val excerpt: String,
    val category: String,
    val section: String,
    val author: String,
    val readTime: String,
    val tags: List<String>,
    val status: String
)
```

### Сохранение в базе данных

```kotlin
@Entity
@Table(name = "posts")
data class Post(
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    val id: UUID? = null,
    
    // ... другие поля ...
    
    @Column(columnDefinition = "TEXT", nullable = false)
    val content: String  // ← JSON как строка
)
```

## Валидация JSON в Kotlin

```kotlin
fun validateTipTapContent(content: String): Boolean {
    return try {
        val mapper = ObjectMapper()
        val root = mapper.readTree(content)
        
        // Проверяем что это валидный TipTap документ
        root.has("type") && 
        root.get("type").asText() == "doc" &&
        root.has("content")
    } catch (e: Exception) {
        false
    }
}
```

## Типы узлов (nodes)

| Тип | Описание | Атрибуты |
|-----|----------|----------|
| `doc` | Корневой узел | - |
| `paragraph` | Параграф | - |
| `heading` | Заголовок | `level` (1-6) |
| `text` | Текстовый узел | `text`, `marks` |
| `bulletList` | Маркированный список | - |
| `orderedList` | Нумерованный список | `start` |
| `listItem` | Элемент списка | - |
| `blockquote` | Цитата | - |
| `image` | Изображение | `src`, `alt`, `title` |
| `hardBreak` | Перенос строки | - |

## Типы marks (форматирование)

| Тип | Описание | Атрибуты |
|-----|----------|----------|
| `bold` | Жирный текст | - |
| `italic` | Курсив | - |
| `underline` | Подчеркнутый | - |
| `link` | Ссылка | `href`, `target` |
| `code` | Inline код | - |

## Важно!

1. **JSON передается как строка** в поле `content`
2. На бэкенде сохраняйте как `TEXT` или `JSONB`
3. Не пытайтесь парсить структуру - храните как есть
4. Для отображения на фронтенде новостного сайта - просто отправьте строку обратно
5. Если нужно преобразовать в HTML - используйте конвертер (см. `TIPTAP_INTEGRATION.md`)
