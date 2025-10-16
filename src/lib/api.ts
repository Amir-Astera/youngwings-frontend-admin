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
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
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
    const response = await fetch(`${this.baseUrl}${API_ENDPOINTS.UPLOAD}`, {
      method: 'POST',
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` }),
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

// Auth API
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

    return response.json() as Promise<{ token: string; user: any }>;
  },
  
  logout: () => {
    localStorage.removeItem('admin_token');
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

const applyPostListParams = (posts: Post[], params?: PostListParams) => {
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

  if (params.limit) {
    result = result.slice(0, params.limit);
  }

  return result;
};

export const postsApi = {
  getAll: async (params?: PostListParams) => {
    const posts = await api.get<ApiPost[]>(API_ENDPOINTS.POSTS.LIST);
    const normalized = posts.map(mapApiPostToPost);
    return applyPostListParams(normalized, params);
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
export const eventsApi = {
  getAll: async () => {
    return api.get<Event[]>(API_ENDPOINTS.EVENTS.LIST);
  },

  getById: async (id: string) => {
    return api.get<Event>(API_ENDPOINTS.EVENTS.GET(id));
  },

  create: async (event: Partial<Event>) => {
    return api.post<Event>(API_ENDPOINTS.EVENTS.CREATE, event);
  },

  update: async (id: string, event: Partial<Event>) => {
    return api.put<Event>(API_ENDPOINTS.EVENTS.UPDATE(id), event);
  },

  delete: async (id: string) => {
    return api.delete<void>(API_ENDPOINTS.EVENTS.DELETE(id));
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
export const commentsApi = {
  getAll: async () => {
    return api.get<Comment[]>(API_ENDPOINTS.COMMENTS.LIST);
  },

  getById: async (id: string) => {
    return api.get<Comment>(API_ENDPOINTS.COMMENTS.GET(id));
  },

  approve: async (id: string) => {
    return api.put<Comment>(API_ENDPOINTS.COMMENTS.APPROVE(id), {});
  },

  reject: async (id: string) => {
    return api.put<Comment>(API_ENDPOINTS.COMMENTS.REJECT(id), {});
  },

  delete: async (id: string) => {
    return api.delete<void>(API_ENDPOINTS.COMMENTS.DELETE(id));
  },
};

// Settings API
export const settingsApi = {
  getRegions: async () => {
    return api.get<string[]>(API_ENDPOINTS.SETTINGS.REGIONS.LIST);
  },

  getSpheres: async () => {
    return api.get<string[]>(API_ENDPOINTS.SETTINGS.SPHERES.LIST);
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
  postTitle: string;
  author: string;
  email: string;
  content: string;
  createdAt: string; // ISO 8601 date string
  status: 'pending' | 'approved' | 'rejected';
}
