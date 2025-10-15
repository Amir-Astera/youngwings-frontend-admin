// API Configuration для Kotlin Spring Boot Backend
// Измените VITE_API_BASE_URL в .env файле для настройки URL вашего API

/**
 * Базовый URL вашего Kotlin API
 * 
 * Development: http://localhost:8080/api
 * Production: https://api.youngwings.kz/api
 * 
 * Установите через .env файл:
 * VITE_API_BASE_URL=http://localhost:8080/api
 */
export const API_BASE_URL = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL) || 'http://localhost:8080/api';

/**
 * Конфигурация endpoints
 * Все endpoints относительно API_BASE_URL
 */
export const API_ENDPOINTS = {
  // Авторизация
  AUTH: {
    LOGIN: '/auth/login',      // POST - вход в систему
    LOGOUT: '/auth/logout',    // POST - выход из системы
    ME: '/auth/me',            // GET - получить текущего пользователя
  },
  
  // Посты
  POSTS: {
    LIST: '/posts',                           // GET - список постов
    CREATE: '/posts',                         // POST - создать пост
    GET: (id: string) => `/posts/${id}`,      // GET - получить пост
    UPDATE: (id: string) => `/posts/${id}`,   // PUT - обновить пост
    DELETE: (id: string) => `/posts/${id}`,   // DELETE - удалить пост
  },
  
  // События
  EVENTS: {
    LIST: '/events',                              // GET - список событий
    CREATE: '/events',                            // POST - создать событие
    GET: (id: string) => `/events/${id}`,         // GET - получить событие
    UPDATE: (id: string) => `/events/${id}`,      // PUT - обновить событие
    DELETE: (id: string) => `/events/${id}`,      // DELETE - удалить событие
  },
  
  // Переводчики
  TRANSLATORS: {
    LIST: '/translators',                                 // GET - список переводчиков
    CREATE: '/translators',                               // POST - создать переводчика
    GET: (id: string) => `/translators/${id}`,            // GET - получить переводчика
    UPDATE: (id: string) => `/translators/${id}`,         // PUT - обновить переводчика
    DELETE: (id: string) => `/translators/${id}`,         // DELETE - удалить переводчика
  },
  
  // Загрузка файлов
  UPLOAD: '/upload',  // POST - загрузить изображение (multipart/form-data)
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
