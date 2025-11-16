// API Configuration
import { API_BASE_URL, API_ENDPOINTS } from './config';
import { resolveFileUrl } from './files';

// API Client
class ApiClient {
  private baseUrl: string;
  
  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private getHeaders(): HeadersInit {
    const token = localStorage.getItem('admin_token');
    const tokenType = localStorage.getItem('admin_token_type') ?? 'Bearer';
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `${tokenType} ${token}` }),
    };
  }

  async get<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }
    
    return response.json();
  }

  async post<T>(endpoint: string, data: any): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }
    
    return response.json();
  }

  async put<T>(endpoint: string, data: any): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }
    
    return response.json();
  }

  async delete<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }
    
    return response.json();
  }

  private async uploadWithField(
    endpoint: string,
    file: File,
    fieldName: string
  ): Promise<Response> {
    const formData = new FormData();
    formData.append(fieldName, file, file.name);

    const token = localStorage.getItem('admin_token');
    const tokenType = localStorage.getItem('admin_token_type') ?? 'Bearer';

    return fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: {
        Accept: '*/*',
        ...(token && { Authorization: `${tokenType} ${token}` }),
      },
      body: formData,
    });
  }

  private async normalizeUploadResponse(response: Response): Promise<{ url: string }> {
    try {
      const payload = await response.clone().json();

      if (payload && typeof payload === 'object') {
        const url = payload.url ?? payload.path ?? payload.location;
        if (typeof url === 'string' && url.length > 0) {
          const normalizedUrl = resolveFileUrl(url) ?? url;
          return { url: normalizedUrl };
        }
      }
    } catch (error) {
      const fallbackText = await response.text();
      throw new Error(
        `Upload Error: ${
          fallbackText || (error instanceof Error ? error.message : 'не удалось обработать ответ')
        }`
      );
    }

    throw new Error('Upload Error: не удалось получить ссылку на файл');
  }

  private async uploadWithFallback(endpoint: string, file: File): Promise<{ url: string }> {
    let response = await this.uploadWithField(endpoint, file, 'file');

    if (!response.ok) {
      const errorText = await response.text();

      if (response.status >= 400 && response.status < 500) {
        const retryResponse = await this.uploadWithField(endpoint, file, 'part');

        if (!retryResponse.ok) {
          const retryText = await retryResponse.text();
          throw new Error(
            `Upload Error: ${retryText || retryResponse.statusText || 'неизвестная ошибка'}`
          );
        }

        return this.normalizeUploadResponse(retryResponse);
      }

      throw new Error(`Upload Error: ${errorText || response.statusText}`);
    }

    return this.normalizeUploadResponse(response);
  }

  async uploadImage(file: File): Promise<{ url: string }> {
    return this.uploadWithFallback(API_ENDPOINTS.UPLOAD, file);
  }

  async uploadFile(directory: string, file: File): Promise<{ url: string }> {
    return this.uploadWithFallback(API_ENDPOINTS.FILES.UPLOAD(directory), file);
  }
}

export const api = new ApiClient(API_BASE_URL);

// Admin API
export interface DashboardCounters {
  totalPosts: number;
  monthPosts: number;
  totalEvents: number;
  monthEvents: number;
  totalComments: number;
  monthComments: number;
  totalTranslatorVacancies: number;
  monthTranslatorVacancies: number;
}

export interface DashboardPostSummary {
  id: string;
  title: string;
  createdAt: string;
  likeCount: number;
  dislikeCount: number;
  commentCount: number;
  viewCount: number;
}

export type DashboardCommentStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface DashboardCommentSummary {
  id: string;
  postId: string;
  authorName: string;
  content: string;
  status: DashboardCommentStatus;
  createdAt: string;
}

export interface DashboardResponse {
  counters: DashboardCounters;
  latestPosts: DashboardPostSummary[];
  latestComments: DashboardCommentSummary[];
  generatedAt: string;
}

export const adminApi = {
  getDashboard: async (params?: { latestPosts?: number; latestComments?: number }) => {
    const { latestPosts = 10, latestComments = 20 } = params ?? {};
    const searchParams = new URLSearchParams({
      latestPosts: String(latestPosts),
      latestComments: String(latestComments),
    });

    const endpoint = `${API_ENDPOINTS.ADMIN.DASHBOARD}?${searchParams.toString()}`;
    return api.get<DashboardResponse>(endpoint);
  },
};

// Auth API
interface AuthResponse {
  token_type: string;
  access_token: string;
  refresh_token: string;
  expires_in: string;
}

export const authApi = {
  login: async (credentials: { email: string; password: string }) => {
    const basicToken = btoa(`${credentials.email}:${credentials.password}`);
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.AUTH.LOGIN}`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${basicToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Auth Error: ${response.statusText}`);
    }

    return response.json() as Promise<AuthResponse>;
  },

  logout: () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_token_type');
  },
  
  isAuthenticated: () => {
    return !!localStorage.getItem('admin_token');
  },
};

// Posts API
interface ApiPost {
  id: string;
  title: string;
  description: string;
  thumbnail: string | null;
  chapter: string;
  topic: string;
  author: string;
  content: string;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface PostRequest {
  title: string;
  description: string;
  chapter: string;
  topic: string;
  author: string;
  content: string;
  thumbnail?: string | null;
}

interface PostListParams {
  section?: string;
  subsection?: string;
  page?: number;
  limit?: number;
}

interface ApiPaginatedResponse<T> {
  total: number;
  page: number;
  size: number;
  items: T[];
}

const mapApiPostToPost = (post: ApiPost): Post => {
  const rawThumbnail = typeof post.thumbnail === 'string' ? post.thumbnail.trim() : '';
  const normalizedThumbnail = resolveFileUrl(rawThumbnail);

  const thumbnailValue = normalizedThumbnail ?? (rawThumbnail || null);
  const imageUrl = normalizedThumbnail ?? (rawThumbnail || undefined);

  return {
    ...post,
    thumbnail: thumbnailValue,
    excerpt: post.description ?? '',
    imageUrl,
    category: post.topic ?? '',
    section: post.chapter ?? '',
    publishedAt: post.createdAt,
    status: 'published',
  };
};

const applyPostListFilters = (
  posts: Post[],
  params?: Pick<PostListParams, 'section' | 'subsection'>
) => {
  if (!params) {
    return posts;
  }

  let result = [...posts];

  if (params.section) {
    result = result.filter(
      (post) => post.section === params.section || post.chapter === params.section
    );
  }

  if (params.subsection) {
    result = result.filter((post) => post.subsection === params.subsection);
  }

  return result;
};

export const postsApi = {
  getAll: async (params?: PostListParams): Promise<PaginatedResult<Post>> => {
    const searchParams = new URLSearchParams();
    const page = params?.page ?? 1;
    const size = params?.limit ?? 1000;

    searchParams.set('page', String(page));
    searchParams.set('size', String(size));

    const endpoint = `${API_ENDPOINTS.POSTS.LIST}?${searchParams.toString()}`;
    const response = await api.get<ApiPaginatedResponse<ApiPost>>(endpoint);
    const normalized = response.items.map(mapApiPostToPost);
    const filtered = applyPostListFilters(normalized, params);

    return {
      total: params?.section || params?.subsection ? filtered.length : response.total,
      page: response.page,
      size: response.size,
      items: filtered,
    };
  },

  getById: async (id: string) => {
    const post = await api.get<ApiPost>(API_ENDPOINTS.POSTS.GET(id));
    return mapApiPostToPost(post);
  },

  create: async (post: PostRequest) => {
    const response = await api.post<ApiPost>(API_ENDPOINTS.POSTS.CREATE, {
      ...post,
      thumbnail: post.thumbnail ?? null,
    });
    return mapApiPostToPost(response);
  },

  update: async (id: string, post: PostRequest) => {
    const response = await api.put<ApiPost>(API_ENDPOINTS.POSTS.UPDATE(id), {
      ...post,
      thumbnail: post.thumbnail ?? null,
    });
    return mapApiPostToPost(response);
  },

  delete: async (id: string) => {
    return api.delete<void>(API_ENDPOINTS.POSTS.DELETE(id));
  },
};

// Events API
const MOCK_EVENTS_KEY = 'admin_mock_events';
const DEFAULT_MOCK_EVENTS: Event[] = [
  {
    id: 'mock-event-1',
    title: 'Международная выставка молодых исследователей',
    description:
      'Двухдневная выставка проектов молодых ученых и инженеров с мастер-классами и нетворкингом.',
    eventDate: '2024-08-15',
    eventEndDate: '2024-08-16',
    eventTime: '10:00',
    location: 'Алматы',
    format: 'OFFLINE',
    region: 'Казахстан',
    sphere: 'Наука и технологии',
    coverUrl:
      'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=800&q=80',
    registrationUrl: 'https://example.com/register',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'mock-event-2',
    title: 'Онлайн-форум социального предпринимательства',
    description:
      'Серия онлайн-дискуссий о лучших практиках социального предпринимательства и поддержке молодёжных инициатив.',
    eventDate: '2024-09-05',
    eventEndDate: '2024-09-05',
    eventTime: '14:00',
    location: 'Ташкент',
    format: 'ONLINE',
    region: 'Узбекистан',
    sphere: 'Социальные проекты',
    coverUrl:
      'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=800&q=80',
    registrationUrl: 'https://example.com/register-online',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const loadMockCollection = <T>(key: string, defaults: T[]): T[] => {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return [...defaults];
    }

    const storedValue = window.localStorage.getItem(key);
    if (!storedValue) {
      window.localStorage.setItem(key, JSON.stringify(defaults));
      return [...defaults];
    }

    const parsed = JSON.parse(storedValue) as unknown;
    if (Array.isArray(parsed)) {
      return parsed as T[];
    }

    window.localStorage.setItem(key, JSON.stringify(defaults));
    return [...defaults];
  } catch (error) {
    return [...defaults];
  }
};

const saveMockCollection = <T>(key: string, data: T[]) => {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return;
    }

    window.localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    // Ignore write errors for mock data
  }
};

export type RegionCityMap = Record<string, string[]>;

const normalizeCityList = (value: unknown): string[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  const unique = new Set<string>();
  value.forEach((item) => {
    if (typeof item === 'string') {
      const trimmed = item.trim();
      if (trimmed.length > 0) {
        unique.add(trimmed);
      }
    }
  });

  return Array.from(unique).sort((a, b) => a.localeCompare(b, 'ru'));
};

const sortRegionCityMap = (map: RegionCityMap): RegionCityMap => {
  const normalizedEntries = Object.entries(map).reduce<RegionCityMap>((acc, [region, cities]) => {
    const trimmedRegion = region.trim();
    if (!trimmedRegion) {
      return acc;
    }

    acc[trimmedRegion] = normalizeCityList(cities);
    return acc;
  }, {});

  const sortedRegions = Object.keys(normalizedEntries).sort((a, b) => a.localeCompare(b, 'ru'));
  const sortedMap: RegionCityMap = {};
  sortedRegions.forEach((region) => {
    sortedMap[region] = normalizedEntries[region];
  });

  return sortedMap;
};

const toRegionCityMap = (value: unknown): RegionCityMap | null => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null;
  }

  const entries = Object.entries(value as Record<string, unknown>);
  if (entries.length === 0) {
    return null;
  }

  const map: RegionCityMap = {};
  entries.forEach(([region, cities]) => {
    if (typeof region !== 'string') {
      return;
    }

    const trimmedRegion = region.trim();
    if (!trimmedRegion) {
      return;
    }

    map[trimmedRegion] = normalizeCityList(cities);
  });

  return sortRegionCityMap(map);
};

const loadMockRegionCityMap = (key: string, defaults: RegionCityMap): RegionCityMap => {
  const normalizedDefaults = sortRegionCityMap(defaults);

  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return normalizedDefaults;
    }

    const storedValue = window.localStorage.getItem(key);
    if (!storedValue) {
      window.localStorage.setItem(key, JSON.stringify(normalizedDefaults));
      return normalizedDefaults;
    }

    const parsed = JSON.parse(storedValue) as unknown;

    if (Array.isArray(parsed)) {
      const map: RegionCityMap = {};
      parsed.forEach((region) => {
        if (typeof region === 'string') {
          const trimmedRegion = region.trim();
          if (trimmedRegion.length > 0) {
            map[trimmedRegion] = normalizedDefaults[trimmedRegion] ?? [];
          }
        }
      });

      const normalized = Object.keys(map).length > 0 ? sortRegionCityMap(map) : normalizedDefaults;
      window.localStorage.setItem(key, JSON.stringify(normalized));
      return normalized;
    }

    const normalized = toRegionCityMap(parsed) ?? normalizedDefaults;
    window.localStorage.setItem(key, JSON.stringify(normalized));
    return normalized;
  } catch (error) {
    return normalizedDefaults;
  }
};

const saveMockRegionCityMap = (key: string, data: RegionCityMap) => {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return;
    }

    const normalized = sortRegionCityMap(data);
    window.localStorage.setItem(key, JSON.stringify(normalized));
  } catch (error) {
    // Ignore write errors for mock data
  }
};

const findRegionKey = (map: RegionCityMap, region: string): string | undefined => {
  const normalizedRegion = region.trim().toLowerCase();
  if (!normalizedRegion) {
    return undefined;
  }

  return Object.keys(map).find((key) => key.toLowerCase() === normalizedRegion);
};

const createPaginatedResult = <T>(items: T[], page = 1, size?: number): PaginatedResult<T> => {
  const effectiveSize = size ?? (items.length || 1);
  return {
    total: items.length,
    page,
    size: effectiveSize,
    items,
  };
};

const addToMockCollection = (key: string, defaults: string[], value: string): string[] => {
  const trimmed = value.trim();
  if (!trimmed) {
    return loadMockCollection<string>(key, defaults);
  }

  const collection = loadMockCollection<string>(key, defaults);
  const exists = collection.some((item) => item.toLowerCase() === trimmed.toLowerCase());

  if (exists) {
    return collection;
  }

  const updated = [trimmed, ...collection];
  saveMockCollection(key, updated);
  return updated;
};

const removeFromMockCollection = (key: string, defaults: string[], value: string): string[] => {
  const trimmed = value.trim();
  if (!trimmed) {
    return loadMockCollection<string>(key, defaults);
  }

  const collection = loadMockCollection<string>(key, defaults);
  const updated = collection.filter((item) => item.toLowerCase() !== trimmed.toLowerCase());
  saveMockCollection(key, updated);
  return updated;
};

const MOCK_REGIONS_KEY = 'admin_mock_regions';
const MOCK_SPHERES_KEY = 'admin_mock_spheres';
const MOCK_TOPICS_KEY = 'admin_mock_topics';

const DEFAULT_REGION_CITY_MAP: RegionCityMap = {
  Казахстан: ['Астана', 'Алматы', 'Шымкент', 'Караганда'],
  Россия: ['Москва', 'Санкт-Петербург', 'Новосибирск', 'Екатеринбург'],
  Кыргызстан: ['Бишкек', 'Ош', 'Джалал-Абад'],
  Узбекистан: ['Ташкент', 'Самарканд', 'Бухара'],
  Беларусь: ['Минск', 'Гомель', 'Брест'],
  Армения: ['Ереван', 'Гюмри', 'Ванадзор'],
  Азербайджан: ['Баку', 'Гянджа', 'Сумгайыт'],
  Молдова: ['Кишинев', 'Бельцы', 'Тирасполь'],
  Таджикистан: ['Душанбе', 'Худжанд', 'Бохтар'],
  Туркменистан: ['Ашхабад', 'Туркменабат', 'Дашогуз'],
  Китай: ['Пекин', 'Шанхай', 'Урумчи'],
};

const DEFAULT_MOCK_SPHERES = [
  'Зеленая экономика',
  'Экология Центральной Азии',
  'Социальные инновации',
  'Технологическое развитие',
  'Городская устойчивость',
];

const DEFAULT_MOCK_TOPICS = [
  'Устойчивое развитие в Центральной Азии',
  'Зеленые технологии',
  'Экологические стартапы',
  'Городская мобильность',
  'Социальные инициативы',
];

const generateMockId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }

  return `mock-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const mapApiEventToEvent = (event: any): Event => {
  const coverSource =
    (typeof event.coverUrl === 'string' && event.coverUrl) ||
    (typeof event.imageUrl === 'string' && event.imageUrl) ||
    '';
  const normalizedCover = resolveFileUrl(coverSource)?.trim() ?? coverSource.trim();

  return {
    id: event.id,
    title: event.title,
    description: event.description ?? '',
    eventDate: event.eventDate ?? event.date ?? '',
    eventEndDate: event.eventEndDate ?? event.dateEnd ?? event.eventDate ?? event.date ?? '',
    eventTime: event.eventTime ?? event.time ?? '',
    location: event.location ?? '',
    format: event.format ?? '',
    region: event.region ?? '',
    sphere: event.sphere ?? '',
    coverUrl: normalizedCover || undefined,
    registrationUrl: event.registrationUrl ?? '',
    createdAt: event.createdAt,
    updatedAt: event.updatedAt,
  };
};

interface ApiTranslatorVacancy {
  id: string;
  fullName: string;
  languages: string;
  specialization: string;
  experience: string;
  location: string;
  photoUrl: string;
  qrUrl: string;
  nickname: string;
  version: number;
  createdAt: string;
  updatedAt: string;
}

const mapApiTranslatorToTranslator = (translator: ApiTranslatorVacancy): Translator => {
  const normalizedPhotoUrl = resolveFileUrl(translator.photoUrl) ?? translator.photoUrl ?? '';
  const normalizedQrUrl = resolveFileUrl(translator.qrUrl) ?? translator.qrUrl ?? '';

  return {
    id: translator.id,
    fullName: translator.fullName,
    languages: translator.languages ?? '',
    specialization: translator.specialization ?? '',
    experience: translator.experience ?? '',
    location: translator.location ?? '',
    photoUrl: normalizedPhotoUrl,
    qrUrl: normalizedQrUrl,
    nickname: translator.nickname ?? '',
    version: translator.version ?? 0,
    createdAt: translator.createdAt ?? '',
    updatedAt: translator.updatedAt ?? '',
  };
};

const trimValue = (value: unknown): string =>
  typeof value === 'string' ? value.trim() : '';

const normalizeOptionalField = (value: unknown): string | null => {
  const trimmed = trimValue(value);
  return trimmed.length > 0 ? trimmed : null;
};

const buildEventRequestPayload = (event: Partial<Event>) => ({
  title: trimValue(event.title),
  description: trimValue(event.description),
  eventDate: trimValue(event.eventDate),
  eventEndDate: trimValue(event.eventEndDate),
  eventTime: trimValue(event.eventTime),
  location: trimValue(event.location),
  format: trimValue(event.format),
  region: trimValue(event.region),
  sphere: trimValue(event.sphere),
  coverUrl: normalizeOptionalField(event.coverUrl),
  registrationUrl: normalizeOptionalField(event.registrationUrl),
});

const fallbackEventsApi = {
  getAll: async (): Promise<PaginatedResult<Event>> => {
    const events = loadMockCollection<Event>(MOCK_EVENTS_KEY, DEFAULT_MOCK_EVENTS);
    return createPaginatedResult(events);
  },

  getById: async (id: string): Promise<Event> => {
    const events = loadMockCollection<Event>(MOCK_EVENTS_KEY, DEFAULT_MOCK_EVENTS);
    const event = events.find((item) => item.id === id);

    if (!event) {
      throw new Error('Event not found');
    }

    return event;
  },

  create: async (event: Partial<Event>): Promise<Event> => {
    const events = loadMockCollection<Event>(MOCK_EVENTS_KEY, DEFAULT_MOCK_EVENTS);
    const timestamp = new Date().toISOString();
    const newEvent: Event = {
      id: generateMockId(),
      title: event.title ?? 'Новое событие',
      description: event.description ?? '',
      eventDate: event.eventDate ?? new Date().toISOString().slice(0, 10),
      eventEndDate: event.eventEndDate ?? event.eventDate ?? new Date().toISOString().slice(0, 10),
      eventTime: event.eventTime ?? '09:00',
      location: event.location ?? '',
      format: event.format ?? 'ONLINE',
      region: event.region ?? '',
      sphere: event.sphere ?? '',
      coverUrl: event.coverUrl ?? '',
      registrationUrl: event.registrationUrl ?? '',
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    const updatedEvents = [newEvent, ...events];
    saveMockCollection(MOCK_EVENTS_KEY, updatedEvents);

    return newEvent;
  },

  update: async (id: string, event: Partial<Event>): Promise<Event> => {
    const events = loadMockCollection<Event>(MOCK_EVENTS_KEY, DEFAULT_MOCK_EVENTS);
    const index = events.findIndex((item) => item.id === id);

    if (index === -1) {
      throw new Error('Event not found');
    }

    const updatedEvent: Event = {
      ...events[index],
      ...event,
      id,
      updatedAt: new Date().toISOString(),
    };

    events[index] = updatedEvent;
    saveMockCollection(MOCK_EVENTS_KEY, events);

    return updatedEvent;
  },

  delete: async (id: string): Promise<void> => {
    const events = loadMockCollection<Event>(MOCK_EVENTS_KEY, DEFAULT_MOCK_EVENTS);
    const filtered = events.filter((item) => item.id !== id);
    saveMockCollection(MOCK_EVENTS_KEY, filtered);
  },
};

export const eventsApi = {
  getAll: async (params?: { page?: number; size?: number }): Promise<PaginatedResult<Event>> => {
    try {
      const searchParams = new URLSearchParams();
      const page = params?.page ?? 1;
      const size = params?.size ?? 20;

      searchParams.set('page', String(page));
      searchParams.set('size', String(size));

      const endpoint = `${API_ENDPOINTS.EVENTS.LIST}?${searchParams.toString()}`;
      const data = await api.get<PaginatedResult<any>>(endpoint);

      if (data && Array.isArray(data.items)) {
        return {
          total: Number(data.total) || data.items.length,
          page: Number(data.page) || page,
          size: Number(data.size) || size,
          items: data.items.map(mapApiEventToEvent),
        };
      }

      return fallbackEventsApi.getAll();
    } catch (error) {
      return fallbackEventsApi.getAll();
    }
  },

  getById: async (id: string) => {
    try {
      const data = await api.get<Event>(API_ENDPOINTS.EVENTS.GET(id));
      return mapApiEventToEvent(data);
    } catch (error) {
      return fallbackEventsApi.getById(id);
    }
  },

  create: async (event: Partial<Event>) => {
    try {
      const payload = buildEventRequestPayload(event);
      const data = await api.post<Event>(API_ENDPOINTS.EVENTS.CREATE, payload);
      return mapApiEventToEvent(data);
    } catch (error) {
      console.error('Failed to create event', error);
      throw error;
    }
  },

  update: async (id: string, event: Partial<Event>) => {
    try {
      const payload = buildEventRequestPayload(event);
      const data = await api.put<Event>(API_ENDPOINTS.EVENTS.UPDATE(id), payload);
      return mapApiEventToEvent(data);
    } catch (error) {
      console.error('Failed to update event', error);
      throw error;
    }
  },

  delete: async (id: string) => {
    try {
      await api.delete<void>(API_ENDPOINTS.EVENTS.DELETE(id));
    } catch (error) {
      console.error('Failed to delete event', error);
      throw error;
    }
  },
};

// Translators API
export const translatorsApi = {
  getAll: async (
    params?: TranslatorQueryParams
  ): Promise<PaginatedResult<Translator>> => {
    const searchParams = new URLSearchParams();
    const page = params?.page ?? 1;
    const size = params?.size ?? 20;

    searchParams.set('page', String(page));
    searchParams.set('size', String(size));

    if (params?.q) {
      searchParams.set('q', params.q);
    }

    if (params?.languages?.length) {
      searchParams.set('languages', params.languages.join(','));
    }

    if (params?.specializations?.length) {
      searchParams.set('specializations', params.specializations.join(','));
    }

    if (params?.experience) {
      searchParams.set('experience', params.experience);
    }

    const endpoint = `${API_ENDPOINTS.TRANSLATORS.LIST}?${searchParams.toString()}`;
    const data = await api.get<PaginatedResult<ApiTranslatorVacancy>>(endpoint);

    return {
      total: Number(data.total) || data.items.length,
      page: Number(data.page) || page,
      size: Number(data.size) || size,
      items: data.items.map(mapApiTranslatorToTranslator),
    };
  },

  getById: async (id: string) => {
    const data = await api.get<ApiTranslatorVacancy>(API_ENDPOINTS.TRANSLATORS.GET(id));
    return mapApiTranslatorToTranslator(data);
  },

  create: async (translator: TranslatorRequest) => {
    const payload = {
      fullName: translator.fullName.trim(),
      languages: translator.languages.trim(),
      specialization: translator.specialization.trim(),
      experience: translator.experience.trim(),
      location: translator.location.trim(),
      photoUrl: translator.photoUrl.trim(),
      qrUrl: translator.qrUrl.trim(),
      nickname: translator.nickname.trim(),
    };

    const data = await api.post<ApiTranslatorVacancy>(API_ENDPOINTS.TRANSLATORS.CREATE, payload);
    return mapApiTranslatorToTranslator(data);
  },

  update: async (id: string, translator: TranslatorRequest) => {
    const payload = {
      fullName: translator.fullName.trim(),
      languages: translator.languages.trim(),
      specialization: translator.specialization.trim(),
      experience: translator.experience.trim(),
      location: translator.location.trim(),
      photoUrl: translator.photoUrl.trim(),
      qrUrl: translator.qrUrl.trim(),
      nickname: translator.nickname.trim(),
    };

    const data = await api.put<ApiTranslatorVacancy>(API_ENDPOINTS.TRANSLATORS.UPDATE(id), payload);
    return mapApiTranslatorToTranslator(data);
  },

  delete: async (id: string) => {
    return api.delete<void>(API_ENDPOINTS.TRANSLATORS.DELETE(id));
  },
};

// Comments API
export interface CommentQueryParams {
  page?: number;
  size?: number;
  statuses?: DashboardCommentStatus[];
  q?: string;
  dateFrom?: string;
  dateTo?: string;
}

export const commentsApi = {
  getPage: async (params: CommentQueryParams = {}) => {
    const searchParams = new URLSearchParams();

    if (params.page) {
      searchParams.set('page', String(params.page));
    }

    if (params.size) {
      searchParams.set('size', String(params.size));
    }

    if (params.statuses && params.statuses.length > 0) {
      params.statuses.forEach((status) => {
        searchParams.append('statuses', status);
      });
    }

    if (params.q) {
      searchParams.set('q', params.q);
    }

    if (params.dateFrom) {
      searchParams.set('dateFrom', params.dateFrom);
    }

    if (params.dateTo) {
      searchParams.set('dateTo', params.dateTo);
    }

    const queryString = searchParams.toString();
    const endpoint = queryString
      ? `${API_ENDPOINTS.COMMENTS.LIST}?${queryString}`
      : API_ENDPOINTS.COMMENTS.LIST;

    return api.get<PaginatedResult<Comment>>(endpoint);
  },

  getById: async (id: string) => {
    return api.get<Comment>(API_ENDPOINTS.COMMENTS.GET(id));
  },

  updateStatus: async (postId: string, commentId: string, status: DashboardCommentStatus) => {
    return api.put<Comment>(API_ENDPOINTS.COMMENTS.UPDATE_STATUS(postId, commentId), {
      status,
    });
  },

  delete: async (postId: string, commentId: string) => {
    return api.delete<void>(API_ENDPOINTS.COMMENTS.DELETE(postId, commentId));
  },
};

// Settings API
export const settingsApi = {
  getRegionsWithCities: async (): Promise<RegionCityMap> => {
    return loadMockRegionCityMap(MOCK_REGIONS_KEY, DEFAULT_REGION_CITY_MAP);
  },

  getRegions: async () => {
    const regionsMap = await settingsApi.getRegionsWithCities();
    return Object.keys(regionsMap).sort((a, b) => a.localeCompare(b, 'ru'));
  },

  getCities: async (region: string) => {
    const regionsMap = await settingsApi.getRegionsWithCities();
    const key = findRegionKey(regionsMap, region);
    return key ? regionsMap[key] : [];
  },

  getSpheres: async () => {
    return loadMockCollection<string>(MOCK_SPHERES_KEY, DEFAULT_MOCK_SPHERES);
  },

  getTopics: async () => {
    try {
      const response = await api.get<string[]>(API_ENDPOINTS.SETTINGS.TOPICS.LIST);
      const normalizedTopics = Array.isArray(response)
        ? response
            .filter((topic) => typeof topic === 'string')
            .map((topic) => topic.trim())
            .filter((topic) => topic.length > 0)
        : [];

      if (normalizedTopics.length > 0) {
        saveMockCollection(MOCK_TOPICS_KEY, normalizedTopics);
        return normalizedTopics;
      }

      return loadMockCollection<string>(MOCK_TOPICS_KEY, DEFAULT_MOCK_TOPICS);
    } catch (error) {
      console.warn('Failed to load topics from API, falling back to local data', error);
      return loadMockCollection<string>(MOCK_TOPICS_KEY, DEFAULT_MOCK_TOPICS);
    }
  },

  addRegion: async (region: string) => {
    const trimmedRegion = region.trim();
    if (!trimmedRegion) {
      return loadMockRegionCityMap(MOCK_REGIONS_KEY, DEFAULT_REGION_CITY_MAP);
    }

    const regionsMap = loadMockRegionCityMap(MOCK_REGIONS_KEY, DEFAULT_REGION_CITY_MAP);
    const existingKey = findRegionKey(regionsMap, trimmedRegion);

    if (existingKey) {
      const normalized = sortRegionCityMap(regionsMap);
      saveMockRegionCityMap(MOCK_REGIONS_KEY, normalized);
      return normalized;
    }

    const updatedMap = sortRegionCityMap({ ...regionsMap, [trimmedRegion]: [] });
    saveMockRegionCityMap(MOCK_REGIONS_KEY, updatedMap);
    return updatedMap;
  },

  addCity: async (region: string, city: string) => {
    const trimmedRegion = region.trim();
    const trimmedCity = city.trim();

    if (!trimmedRegion || !trimmedCity) {
      return loadMockRegionCityMap(MOCK_REGIONS_KEY, DEFAULT_REGION_CITY_MAP);
    }

    const regionsMap = loadMockRegionCityMap(MOCK_REGIONS_KEY, DEFAULT_REGION_CITY_MAP);
    const key = findRegionKey(regionsMap, trimmedRegion) ?? trimmedRegion;
    const cities = regionsMap[key] ?? [];
    const hasCity = cities.some((value) => value.toLowerCase() === trimmedCity.toLowerCase());

    const updatedCities = hasCity ? cities : [...cities, trimmedCity];
    const updatedMap = sortRegionCityMap({ ...regionsMap, [key]: updatedCities });
    saveMockRegionCityMap(MOCK_REGIONS_KEY, updatedMap);
    return updatedMap;
  },

  addSphere: async (sphere: string) => {
    return addToMockCollection(MOCK_SPHERES_KEY, DEFAULT_MOCK_SPHERES, sphere);
  },

  addTopic: async (topic: string) => {
    const trimmedTopic = topic.trim();
    if (!trimmedTopic) {
      return trimmedTopic;
    }

    try {
      await api.post<string>(API_ENDPOINTS.SETTINGS.TOPICS.CREATE, { topic: trimmedTopic });
    } catch (error) {
      console.warn('Failed to add topic via API, storing locally instead', error);
    }

    addToMockCollection(MOCK_TOPICS_KEY, DEFAULT_MOCK_TOPICS, trimmedTopic);
    return trimmedTopic;
  },

  deleteRegion: async (region: string) => {
    const trimmedRegion = region.trim();
    if (!trimmedRegion) {
      return loadMockRegionCityMap(MOCK_REGIONS_KEY, DEFAULT_REGION_CITY_MAP);
    }

    const regionsMap = loadMockRegionCityMap(MOCK_REGIONS_KEY, DEFAULT_REGION_CITY_MAP);
    const key = findRegionKey(regionsMap, trimmedRegion);

    if (!key) {
      const normalized = sortRegionCityMap(regionsMap);
      saveMockRegionCityMap(MOCK_REGIONS_KEY, normalized);
      return normalized;
    }

    const { [key]: _removed, ...rest } = regionsMap;
    const updatedMap = sortRegionCityMap(rest);
    saveMockRegionCityMap(MOCK_REGIONS_KEY, updatedMap);
    return updatedMap;
  },

  deleteCity: async (region: string, city: string) => {
    const trimmedRegion = region.trim();
    const trimmedCity = city.trim();

    if (!trimmedRegion || !trimmedCity) {
      return loadMockRegionCityMap(MOCK_REGIONS_KEY, DEFAULT_REGION_CITY_MAP);
    }

    const regionsMap = loadMockRegionCityMap(MOCK_REGIONS_KEY, DEFAULT_REGION_CITY_MAP);
    const key = findRegionKey(regionsMap, trimmedRegion);

    if (!key) {
      const normalized = sortRegionCityMap(regionsMap);
      saveMockRegionCityMap(MOCK_REGIONS_KEY, normalized);
      return normalized;
    }

    const updatedCities = (regionsMap[key] ?? []).filter(
      (value) => value.toLowerCase() !== trimmedCity.toLowerCase()
    );

    const updatedMap = sortRegionCityMap({ ...regionsMap, [key]: updatedCities });
    saveMockRegionCityMap(MOCK_REGIONS_KEY, updatedMap);
    return updatedMap;
  },

  deleteSphere: async (sphere: string) => {
    return removeFromMockCollection(MOCK_SPHERES_KEY, DEFAULT_MOCK_SPHERES, sphere);
  },

  deleteTopic: async (topic: string) => {
    const trimmedTopic = topic.trim();
    if (!trimmedTopic) {
      return;
    }

    try {
      await api.delete<void>(API_ENDPOINTS.SETTINGS.TOPICS.DELETE(trimmedTopic));
    } catch (error) {
      console.warn('Failed to delete topic via API, removing locally instead', error);
    }

    removeFromMockCollection(MOCK_TOPICS_KEY, DEFAULT_MOCK_TOPICS, trimmedTopic);
  },
};

// Types
export interface PaginatedResult<T> {
  total: number;
  page: number;
  size: number;
  items: T[];
}

export interface Post {
  id: string;
  title: string;
  description: string;
  thumbnail: string | null;
  chapter: string;
  topic: string;
  author: string;
  content: string; // TipTap JSON content as string
  version: number;
  createdAt: string; // ISO 8601 date string
  updatedAt: string; // ISO 8601 date string

  // Derived fields for UI compatibility
  excerpt: string;
  imageUrl?: string | null;
  category: string;
  section: string;
  subsection?: string;
  publishedAt: string; // ISO 8601 date string
  readTime?: string;
  views?: number;
  likes?: number;
  commentsCount?: number;
  tags?: string[];
  status: 'draft' | 'published';
}

export interface Event {
  id: string;
  title: string;
  description: string;
  eventDate: string; // ISO 8601 date string
  eventEndDate: string; // ISO 8601 date string
  eventTime: string;
  location: string;
  format: string;
  region: string;
  sphere: string;
  coverUrl?: string | null;
  registrationUrl?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface Translator {
  id: string;
  fullName: string;
  languages: string;
  specialization: string;
  experience: string;
  location: string;
  photoUrl: string;
  qrUrl: string;
  nickname: string;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface TranslatorRequest {
  fullName: string;
  languages: string;
  specialization: string;
  experience: string;
  location: string;
  photoUrl: string;
  qrUrl: string;
  nickname: string;
}

export interface TranslatorQueryParams {
  page?: number;
  size?: number;
  q?: string;
  languages?: string[];
  specializations?: string[];
  experience?: string;
}

export interface Comment {
  id: string;
  postId: string;
  authorName: string;
  content: string;
  status: DashboardCommentStatus;
  likeCount: number;
  dislikeCount: number;
  createdAt: string; // ISO 8601 date string
}
