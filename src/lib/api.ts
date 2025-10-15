// API Configuration
import { API_BASE_URL } from './config';

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
    const response = await fetch(`${this.baseUrl}/upload`, {
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
    return api.post<{ token: string; user: any }>('/auth/login', credentials);
  },
  
  logout: () => {
    localStorage.removeItem('admin_token');
  },
  
  isAuthenticated: () => {
    return !!localStorage.getItem('admin_token');
  },
};

// Posts API
export const postsApi = {
  getAll: async (params?: { section?: string; subsection?: string; page?: number; limit?: number }) => {
    const queryParams = new URLSearchParams();
    if (params?.section) queryParams.append('section', params.section);
    if (params?.subsection) queryParams.append('subsection', params.subsection);
    if (params?.page) queryParams.append('page', String(params.page));
    if (params?.limit) queryParams.append('limit', String(params.limit));
    
    const query = queryParams.toString();
    return api.get<{ posts: Post[]; total: number }>(`/posts${query ? `?${query}` : ''}`);
  },
  
  getById: async (id: string) => {
    return api.get<Post>(`/posts/${id}`);
  },
  
  create: async (post: Partial<Post>) => {
    return api.post<Post>('/posts', post);
  },
  
  update: async (id: string, post: Partial<Post>) => {
    return api.put<Post>(`/posts/${id}`, post);
  },
  
  delete: async (id: string) => {
    return api.delete<void>(`/posts/${id}`);
  },
};

// Events API
export const eventsApi = {
  getAll: async () => {
    return api.get<Event[]>('/events');
  },
  
  getById: async (id: string) => {
    return api.get<Event>(`/events/${id}`);
  },
  
  create: async (event: Partial<Event>) => {
    return api.post<Event>('/events', event);
  },
  
  update: async (id: string, event: Partial<Event>) => {
    return api.put<Event>(`/events/${id}`, event);
  },
  
  delete: async (id: string) => {
    return api.delete<void>(`/events/${id}`);
  },
};

// Translators API
export const translatorsApi = {
  getAll: async () => {
    return api.get<Translator[]>('/translators');
  },
  
  getById: async (id: string) => {
    return api.get<Translator>(`/translators/${id}`);
  },
  
  create: async (translator: Partial<Translator>) => {
    return api.post<Translator>('/translators', translator);
  },
  
  update: async (id: string, translator: Partial<Translator>) => {
    return api.put<Translator>(`/translators/${id}`, translator);
  },
  
  delete: async (id: string) => {
    return api.delete<void>(`/translators/${id}`);
  },
};

// Comments API
export const commentsApi = {
  getAll: async () => {
    return api.get<Comment[]>('/comments');
  },
  
  getById: async (id: string) => {
    return api.get<Comment>(`/comments/${id}`);
  },
  
  approve: async (id: string) => {
    return api.put<Comment>(`/comments/${id}/approve`, {});
  },
  
  reject: async (id: string) => {
    return api.put<Comment>(`/comments/${id}/reject`, {});
  },
  
  delete: async (id: string) => {
    return api.delete<void>(`/comments/${id}`);
  },
};

// Settings API
export const settingsApi = {
  getRegions: async () => {
    return api.get<string[]>('/settings/regions');
  },
  
  getSpheres: async () => {
    return api.get<string[]>('/settings/spheres');
  },
  
  getTopics: async () => {
    return api.get<string[]>('/settings/topics');
  },
  
  addRegion: async (region: string) => {
    return api.post<string>('/settings/regions', { region });
  },
  
  addSphere: async (sphere: string) => {
    return api.post<string>('/settings/spheres', { sphere });
  },
  
  addTopic: async (topic: string) => {
    return api.post<string>('/settings/topics', { topic });
  },
  
  deleteRegion: async (region: string) => {
    return api.delete<void>(`/settings/regions/${encodeURIComponent(region)}`);
  },
  
  deleteSphere: async (sphere: string) => {
    return api.delete<void>(`/settings/spheres/${encodeURIComponent(sphere)}`);
  },
  
  deleteTopic: async (topic: string) => {
    return api.delete<void>(`/settings/topics/${encodeURIComponent(topic)}`);
  },
};

// Types
export interface Post {
  id: string;
  title: string;
  content: string; // TipTap JSON content as string
  excerpt: string;
  imageUrl?: string;
  category: string;
  section: string;
  subsection?: string;
  author: string;
  publishedAt: string; // ISO 8601 date string
  readTime: string;
  views: number;
  likes: number;
  commentsCount: number;
  tags: string[];
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
