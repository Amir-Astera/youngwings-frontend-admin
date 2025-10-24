// API Configuration для Kotlin Spring Boot Backend
// Измените VITE_API_BASE_URL в .env файле для настройки URL вашего API

/**
 * Базовый URL вашего Kotlin API
 * 
 * Development: http://localhost:8080
 * Production: https://api.youngwings.kz
 * 
 * Установите через .env файл:
 * VITE_API_BASE_URL=http://localhost:8080
 */
export const API_BASE_URL =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL) ||
  'http://localhost:8080';

/**
 * Конфигурация endpoints
 * Все endpoints относительно API_BASE_URL
 */
export const API_ENDPOINTS = {
  // Авторизация
  AUTH: {
    LOGIN: '/auth',            // POST - вход в систему
    LOGOUT: '/auth/logout',    // POST - выход из системы
    ME: '/auth/me',            // GET - получить текущего пользователя
  },

  // Панель управления
  ADMIN: {
    DASHBOARD: '/api/admin',
  },

  // Посты
  POSTS: {
    LIST: '/api/post/getAll',                      // GET - список постов
    CREATE: '/api/post',                           // POST - создать пост
    GET: (id: string) => `/api/post/share/${id}`,  // GET - получить пост по публичной ссылке
    UPDATE: (id: string) => `/api/post/${id}`,     // PUT - обновить пост
    DELETE: (id: string) => `/api/post/${id}`,     // DELETE - удалить пост
  },
  
  // События
  EVENTS: {
    LIST: '/api/events',                               // GET - список событий (пагинация)
    CREATE: '/api/admin/events',                       // POST - создать событие
    GET: (id: string) => `/api/admin/events/${id}`,    // GET - получить событие
    UPDATE: (id: string) => `/api/admin/events/${id}`, // PUT - обновить событие
    DELETE: (id: string) => `/api/admin/events/${id}`, // DELETE - удалить событие
  },

  // Переводчики
  TRANSLATORS: {
    LIST: '/api/translator-vacancies',                                   // GET - список переводчиков (вакансии)
    CREATE: '/api/admin/translator-vacancies',                           // POST - создать переводчика
    GET: (id: string) => `/api/translator-vacancies/${id}`,              // GET - получить переводчика
    UPDATE: (id: string) => `/api/admin/translator-vacancies/${id}`,     // PUT - обновить переводчика
    DELETE: (id: string) => `/api/admin/translator-vacancies/${id}`,     // DELETE - удалить переводчика
  },

  // Комментарии
  COMMENTS: {
    LIST: '/api/comment/admin/getPageComment',                               // GET - список комментариев (пагинация и фильтры)
    GET: (id: string) => `/api/comment/admin/comment/${id}`,                  // GET - получить комментарий
    UPDATE_STATUS: (postId: string, commentId: string) =>
      `/api/comment/admin/${postId}/comments/${commentId}/status`,           // PUT - изменить статус комментария
    DELETE: (postId: string, commentId: string) =>
      `/api/comment/admin/${postId}/comments/${commentId}`,                  // DELETE - удалить комментарий
  },

  // Настройки
  SETTINGS: {
    TOPICS: {
      LIST: '/api/settings/topics',
      CREATE: '/api/settings/topics',
      DELETE: (topic: string) => `/api/settings/topics/${encodeURIComponent(topic)}`,
    },
  },

  // Загрузка файлов
  UPLOAD: '/api/upload',  // POST - загрузить изображение (multipart/form-data)
  FILES: {
    UPLOAD: (directory: string) => `/api/files/${directory}`,
  },
};

/**
 * Настройки API
 */
export const API_SETTINGS = {
  // Таймаут запросов в миллисекунд��х
  REQUEST_TIMEOUT: 30000,
  
  // Количество попыток повтора при ошибке
  RETRY_ATTEMPTS: 3,
  
  // Задержка между попытками (мс)
  RETRY_DELAY: 1000,
};
