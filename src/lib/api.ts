// API Configuration
import { API_BASE_URL, API_ENDPOINTS } from './config';

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

  async uploadImage(file: File): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append('file', file);

    const token = localStorage.getItem('admin_token');
    const tokenType = localStorage.getItem('admin_token_type') ?? 'Bearer';
    const response = await fetch(`${this.baseUrl}${API_ENDPOINTS.UPLOAD}`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `${tokenType} ${token}` }),
      },
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error(`Upload Error: ${response.statusText}`);
    }
    
    return response.json();
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

const mapApiPostToPost = (post: ApiPost): Post => ({
  ...post,
  thumbnail: post.thumbnail,
  excerpt: post.description ?? '',
  imageUrl: post.thumbnail ?? undefined,
  category: post.topic ?? '',
  section: post.chapter ?? '',
  publishedAt: post.createdAt,
  status: 'published',
});

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
    imageUrl:
      'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=800&q=80',
    date: '2024-08-15',
    time: '10:00',
    location: 'Москва, ВДНХ',
    format: 'Офлайн',
    status: 'Предстоящее',
    attendees: 250,
    region: 'Москва',
    sphere: 'Наука и технологии',
  },
  {
    id: 'mock-event-2',
    title: 'Онлайн-форум социального предпринимательства',
    description:
      'Серия онлайн-дискуссий о лучших практиках социального предпринимательства и поддержке молодёжных инициатив.',
    imageUrl:
      'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=800&q=80',
    date: '2024-09-05',
    time: '14:00',
    location: 'Онлайн',
    format: 'Онлайн',
    status: 'Предстоящее',
    attendees: 180,
    region: 'Санкт-Петербург',
    sphere: 'Социальные проекты',
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

const MOCK_REGIONS_KEY = 'admin_mock_regions';
const MOCK_SPHERES_KEY = 'admin_mock_spheres';

const DEFAULT_MOCK_REGIONS = [
  'Москва',
  'Санкт-Петербург',
  'Новосибирская область',
  'Татарстан',
  'Краснодарский край',
];

const DEFAULT_MOCK_SPHERES = [
  'Наука и технологии',
  'Социальные проекты',
  'Культура и искусство',
  'Экология',
  'Предпринимательство',
];

const generateMockId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }

  return `mock-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const fallbackEventsApi = {
  getAll: async (): Promise<Event[]> => {
    return loadMockCollection<Event>(MOCK_EVENTS_KEY, DEFAULT_MOCK_EVENTS);
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
    const newEvent: Event = {
      id: generateMockId(),
      title: event.title ?? 'Новое событие',
      description: event.description ?? '',
      imageUrl: event.imageUrl ?? '',
      date: event.date ?? new Date().toISOString().slice(0, 10),
      time: event.time ?? '09:00',
      location: event.location ?? '',
      format: event.format ?? 'Онлайн',
      status: event.status ?? 'Предстоящее',
      attendees: event.attendees ?? 0,
      region: event.region ?? '',
      sphere: event.sphere ?? '',
    };

    events.unshift(newEvent);
    saveMockCollection(MOCK_EVENTS_KEY, events);

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
  getAll: async () => {
    try {
      const data = await api.get<Event[] | { items: Event[] }>(API_ENDPOINTS.EVENTS.LIST);

      if (Array.isArray(data)) {
        return data;
      }

      if (data && Array.isArray((data as { items?: Event[] }).items)) {
        return (data as { items: Event[] }).items;
      }

      return fallbackEventsApi.getAll();
    } catch (error) {
      return fallbackEventsApi.getAll();
    }
  },

  getById: async (id: string) => {
    try {
      return await api.get<Event>(API_ENDPOINTS.EVENTS.GET(id));
    } catch (error) {
      return fallbackEventsApi.getById(id);
    }
  },

  create: async (event: Partial<Event>) => {
    try {
      return await api.post<Event>(API_ENDPOINTS.EVENTS.CREATE, event);
    } catch (error) {
      return fallbackEventsApi.create(event);
    }
  },

  update: async (id: string, event: Partial<Event>) => {
    try {
      return await api.put<Event>(API_ENDPOINTS.EVENTS.UPDATE(id), event);
    } catch (error) {
      return fallbackEventsApi.update(id, event);
    }
  },

  delete: async (id: string) => {
    try {
      await api.delete<void>(API_ENDPOINTS.EVENTS.DELETE(id));
    } catch (error) {
      await fallbackEventsApi.delete(id);
    }
  },
};

// Translators API
export const translatorsApi = {
  getAll: async () => {
    return api.get<Translator[]>(API_ENDPOINTS.TRANSLATORS.LIST);
  },

  getById: async (id: string) => {
    return api.get<Translator>(API_ENDPOINTS.TRANSLATORS.GET(id));
  },

  create: async (translator: Partial<Translator>) => {
    return api.post<Translator>(API_ENDPOINTS.TRANSLATORS.CREATE, translator);
  },

  update: async (id: string, translator: Partial<Translator>) => {
    return api.put<Translator>(API_ENDPOINTS.TRANSLATORS.UPDATE(id), translator);
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
  getRegions: async () => {
    try {
      const data = await api.get<string[]>(API_ENDPOINTS.SETTINGS.REGIONS.LIST);

      if (Array.isArray(data)) {
        return data;
      }

      return loadMockCollection<string>(MOCK_REGIONS_KEY, DEFAULT_MOCK_REGIONS);
    } catch (error) {
      return loadMockCollection<string>(MOCK_REGIONS_KEY, DEFAULT_MOCK_REGIONS);
    }
  },

  getSpheres: async () => {
    try {
      const data = await api.get<string[]>(API_ENDPOINTS.SETTINGS.SPHERES.LIST);

      if (Array.isArray(data)) {
        return data;
      }

      return loadMockCollection<string>(MOCK_SPHERES_KEY, DEFAULT_MOCK_SPHERES);
    } catch (error) {
      return loadMockCollection<string>(MOCK_SPHERES_KEY, DEFAULT_MOCK_SPHERES);
    }
  },

  getTopics: async () => {
    return api.get<string[]>(API_ENDPOINTS.SETTINGS.TOPICS.LIST);
  },

  addRegion: async (region: string) => {
    return api.post<string>(API_ENDPOINTS.SETTINGS.REGIONS.CREATE, { region });
  },

  addSphere: async (sphere: string) => {
    return api.post<string>(API_ENDPOINTS.SETTINGS.SPHERES.CREATE, { sphere });
  },

  addTopic: async (topic: string) => {
    return api.post<string>(API_ENDPOINTS.SETTINGS.TOPICS.CREATE, { topic });
  },

  deleteRegion: async (region: string) => {
    return api.delete<void>(API_ENDPOINTS.SETTINGS.REGIONS.DELETE(region));
  },

  deleteSphere: async (sphere: string) => {
    return api.delete<void>(API_ENDPOINTS.SETTINGS.SPHERES.DELETE(sphere));
  },

  deleteTopic: async (topic: string) => {
    return api.delete<void>(API_ENDPOINTS.SETTINGS.TOPICS.DELETE(topic));
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
  imageUrl: string;
  date: string; // ISO 8601 date string
  time: string;
  location: string;
  format: string;
  status: string;
  attendees: number;
  region: string;
  sphere: string;
}

export interface Translator {
  id: string;
  name: string;
  languages: string[];
  specialization: string[];
  experience: string;
  hourlyRate: string;
  available: boolean;
  rating: number;
  completedProjects: number;
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
