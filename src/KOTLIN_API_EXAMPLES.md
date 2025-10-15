# Примеры API для Kotlin Spring WebFlux

Этот документ содержит примеры кода для создания REST API на Kotlin Spring WebFlux, который будет работать с админ-панелью YoungWings.

## Структуры данных (Data Classes)

```kotlin
// Post.kt
package com.youngwings.models

import org.springframework.data.annotation.Id
import org.springframework.data.mongodb.core.mapping.Document
import java.time.Instant

@Document(collection = "posts")
data class Post(
    @Id
    val id: String? = null,
    val title: String,
    val content: String,  // TipTap JSON as String
    val excerpt: String,
    val imageUrl: String? = null,
    val category: String,
    val section: String,
    val subsection: String? = null,
    val author: String,
    val publishedAt: Instant? = null,
    val readTime: String,
    val views: Long = 0,
    val likes: Long = 0,
    val commentsCount: Long = 0,
    val tags: List<String> = emptyList(),
    val status: PostStatus = PostStatus.DRAFT
)

enum class PostStatus {
    DRAFT, PUBLISHED
}

// DTO для создания/обновления
data class CreatePostRequest(
    val title: String,
    val content: String,
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

// Response для списка постов
data class PostsResponse(
    val posts: List<Post>,
    val total: Long
)
```

```kotlin
// Event.kt
package com.youngwings.models

import org.springframework.data.annotation.Id
import org.springframework.data.mongodb.core.mapping.Document
import java.time.LocalDate
import java.time.LocalTime

@Document(collection = "events")
data class Event(
    @Id
    val id: String? = null,
    val title: String,
    val description: String,
    val imageUrl: String? = null,
    val date: LocalDate,
    val time: LocalTime,
    val location: String,
    val format: String,
    val status: String,
    val attendees: Int = 0,
    val region: String,
    val sphere: String
)
```

```kotlin
// Translator.kt
package com.youngwings.models

import org.springframework.data.annotation.Id
import org.springframework.data.mongodb.core.mapping.Document

@Document(collection = "translators")
data class Translator(
    @Id
    val id: String? = null,
    val name: String,
    val languages: List<String>,
    val specialization: List<String>,
    val experience: String,
    val hourlyRate: String,
    val available: Boolean = true,
    val rating: Double = 0.0,
    val completedProjects: Int = 0
)
```

```kotlin
// Auth.kt
package com.youngwings.models

data class LoginRequest(
    val email: String,
    val password: String
)

data class LoginResponse(
    val token: String,
    val user: UserInfo
)

data class UserInfo(
    val id: String,
    val email: String,
    val name: String
)
```

## Repository

```kotlin
// PostRepository.kt
package com.youngwings.repositories

import com.youngwings.models.Post
import com.youngwings.models.PostStatus
import org.springframework.data.mongodb.repository.ReactiveMongoRepository
import reactor.core.publisher.Flux

interface PostRepository : ReactiveMongoRepository<Post, String> {
    fun findByStatus(status: PostStatus): Flux<Post>
    fun findBySection(section: String): Flux<Post>
    fun findBySectionAndStatus(section: String, status: PostStatus): Flux<Post>
}
```

## Service

```kotlin
// PostService.kt
package com.youngwings.services

import com.youngwings.models.*
import com.youngwings.repositories.PostRepository
import org.springframework.stereotype.Service
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono
import java.time.Instant

@Service
class PostService(private val postRepository: PostRepository) {
    
    fun getAllPosts(
        section: String? = null,
        subsection: String? = null,
        page: Int = 0,
        limit: Int = 20
    ): Mono<PostsResponse> {
        val posts = when {
            section != null -> postRepository.findBySection(section)
            else -> postRepository.findAll()
        }
        
        return posts
            .filter { subsection == null || it.subsection == subsection }
            .skip((page * limit).toLong())
            .take(limit.toLong())
            .collectList()
            .zipWith(postRepository.count())
            .map { tuple -> PostsResponse(tuple.t1, tuple.t2) }
    }
    
    fun getPostById(id: String): Mono<Post> {
        return postRepository.findById(id)
    }
    
    fun createPost(request: CreatePostRequest): Mono<Post> {
        val post = Post(
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
            publishedAt = if (request.status == PostStatus.PUBLISHED) Instant.now() else null
        )
        return postRepository.save(post)
    }
    
    fun updatePost(id: String, request: CreatePostRequest): Mono<Post> {
        return postRepository.findById(id)
            .flatMap { existingPost ->
                val updatedPost = existingPost.copy(
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
                    publishedAt = if (request.status == PostStatus.PUBLISHED && existingPost.publishedAt == null) 
                        Instant.now() 
                    else 
                        existingPost.publishedAt
                )
                postRepository.save(updatedPost)
            }
    }
    
    fun deletePost(id: String): Mono<Void> {
        return postRepository.deleteById(id)
    }
}
```

## Controller

```kotlin
// PostController.kt
package com.youngwings.controllers

import com.youngwings.models.*
import com.youngwings.services.PostService
import org.springframework.http.HttpStatus
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.*
import reactor.core.publisher.Mono

@RestController
@RequestMapping("/api/posts")
@CrossOrigin(origins = ["http://localhost:5173"]) // URL админки
class PostController(private val postService: PostService) {
    
    @GetMapping
    fun getAllPosts(
        @RequestParam(required = false) section: String?,
        @RequestParam(required = false) subsection: String?,
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "20") limit: Int
    ): Mono<PostsResponse> {
        return postService.getAllPosts(section, subsection, page, limit)
    }
    
    @GetMapping("/{id}")
    fun getPostById(@PathVariable id: String): Mono<Post> {
        return postService.getPostById(id)
    }
    
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.CREATED)
    fun createPost(@RequestBody request: CreatePostRequest): Mono<Post> {
        return postService.createPost(request)
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    fun updatePost(
        @PathVariable id: String,
        @RequestBody request: CreatePostRequest
    ): Mono<Post> {
        return postService.updatePost(id, request)
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun deletePost(@PathVariable id: String): Mono<Void> {
        return postService.deletePost(id)
    }
}
```

## Authentication Controller

```kotlin
// AuthController.kt
package com.youngwings.controllers

import com.youngwings.models.*
import com.youngwings.security.JwtTokenProvider
import com.youngwings.services.UserService
import org.springframework.security.authentication.ReactiveAuthenticationManager
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.web.bind.annotation.*
import reactor.core.publisher.Mono

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = ["http://localhost:5173"])
class AuthController(
    private val authenticationManager: ReactiveAuthenticationManager,
    private val jwtTokenProvider: JwtTokenProvider,
    private val userService: UserService
) {
    
    @PostMapping("/login")
    fun login(@RequestBody request: LoginRequest): Mono<LoginResponse> {
        return authenticationManager
            .authenticate(
                UsernamePasswordAuthenticationToken(request.email, request.password)
            )
            .flatMap { authentication ->
                val email = authentication.name
                userService.findByEmail(email)
                    .map { user ->
                        val token = jwtTokenProvider.generateToken(user.id!!)
                        LoginResponse(
                            token = token,
                            user = UserInfo(
                                id = user.id!!,
                                email = user.email,
                                name = user.name
                            )
                        )
                    }
            }
    }
}
```

## File Upload Controller

```kotlin
// UploadController.kt
package com.youngwings.controllers

import org.springframework.http.HttpStatus
import org.springframework.http.codec.multipart.FilePart
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.*
import reactor.core.publisher.Mono
import java.nio.file.Paths
import java.util.*

@RestController
@RequestMapping("/api/upload")
@CrossOrigin(origins = ["http://localhost:5173"])
class UploadController {
    
    private val uploadDir = Paths.get("uploads")
    
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.OK)
    fun uploadFile(@RequestPart("file") filePart: FilePart): Mono<Map<String, String>> {
        val filename = UUID.randomUUID().toString() + "_" + filePart.filename()
        val filepath = uploadDir.resolve(filename)
        
        return filePart.transferTo(filepath)
            .then(Mono.just(mapOf(
                "url" to "http://localhost:8080/uploads/$filename"
            )))
    }
}
```

## CORS Configuration

```kotlin
// CorsConfig.kt
package com.youngwings.config

import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.web.cors.CorsConfiguration
import org.springframework.web.cors.reactive.CorsWebFilter
import org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource

@Configuration
class CorsConfig {
    
    @Bean
    fun corsWebFilter(): CorsWebFilter {
        val corsConfig = CorsConfiguration().apply {
            addAllowedOrigin("http://localhost:5173") // URL админки
            addAllowedMethod("*")
            addAllowedHeader("*")
            allowCredentials = true
        }
        
        val source = UrlBasedCorsConfigurationSource().apply {
            registerCorsConfiguration("/api/**", corsConfig)
        }
        
        return CorsWebFilter(source)
    }
}
```

## Security Configuration

```kotlin
// SecurityConfig.kt
package com.youngwings.config

import com.youngwings.security.JwtAuthenticationFilter
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.http.HttpMethod
import org.springframework.security.config.annotation.method.configuration.EnableReactiveMethodSecurity
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity
import org.springframework.security.config.web.server.SecurityWebFiltersOrder
import org.springframework.security.config.web.server.ServerHttpSecurity
import org.springframework.security.web.server.SecurityWebFilterChain

@Configuration
@EnableWebFluxSecurity
@EnableReactiveMethodSecurity
class SecurityConfig(
    private val jwtAuthenticationFilter: JwtAuthenticationFilter
) {
    
    @Bean
    fun securityWebFilterChain(http: ServerHttpSecurity): SecurityWebFilterChain {
        return http
            .csrf { it.disable() }
            .authorizeExchange { exchanges ->
                exchanges
                    .pathMatchers("/api/auth/**").permitAll()
                    .pathMatchers(HttpMethod.GET, "/api/posts/**").permitAll()
                    .pathMatchers(HttpMethod.GET, "/api/events/**").permitAll()
                    .pathMatchers(HttpMethod.GET, "/api/translators/**").permitAll()
                    .pathMatchers("/api/**").authenticated()
                    .anyExchange().permitAll()
            }
            .addFilterAt(jwtAuthenticationFilter, SecurityWebFiltersOrder.AUTHENTICATION)
            .build()
    }
}
```

## application.yml

```yaml
spring:
  data:
    mongodb:
      uri: mongodb://localhost:27017/youngwings
      
  servlet:
    multipart:
      max-file-size: 5MB
      max-request-size: 5MB

server:
  port: 8080

jwt:
  secret: your-secret-key-here-change-in-production
  expiration: 86400000 # 24 hours

upload:
  directory: uploads
```

## Примечания

1. **TipTap Content**: Поле `content` в Post должно сохраняться как String (JSON сериализованный)
2. **Авторизация**: Используйте JWT токены для защиты endpoints
3. **CORS**: Настройте правильные origins для админ-панели
4. **Загрузка файлов**: Можно использовать S3, MinIO или локальное хранилище
5. **Валидация**: Добавьте `@Valid` и bean validation для проверки данных

## Тестирование API

Используйте curl или Postman для тестирования:

```bash
# Login
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@youngwings.ru","password":"admin123"}'

# Create Post
curl -X POST http://localhost:8080/api/posts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "title": "Test Post",
    "content": "{\"type\":\"doc\",\"content\":[]}",
    "excerpt": "Test excerpt",
    "category": "Test",
    "section": "Test Section",
    "author": "Admin",
    "readTime": "5 мин",
    "tags": ["test"],
    "status": "PUBLISHED"
  }'
```
