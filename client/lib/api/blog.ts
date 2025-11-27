import { BlogPost, BlogCategory, BlogComment, BlogListParams, PaginatedResponse } from '@/types/blog';
import { ApiResponse } from '@/types/api';

interface BlogApi {
  list: (params?: BlogListParams) => Promise<ApiResponse<PaginatedResponse<BlogPost>>>;
  getBySlug: (slug: string) => Promise<ApiResponse<BlogPost>>;
  getCategories: () => Promise<ApiResponse<BlogCategory[]>>;
  getComments: (postId: number) => Promise<ApiResponse<BlogComment[]>>;
  createComment: (postId: number, data: Partial<BlogComment>) => Promise<ApiResponse<BlogComment>>;
  // Admin endpoints
  listAll: () => Promise<ApiResponse<PaginatedResponse<BlogPost>>>;
  create: (data: Partial<BlogPost>) => Promise<ApiResponse<BlogPost>>;
  update: (id: number, data: Partial<BlogPost>) => Promise<ApiResponse<BlogPost>>;
  delete: (id: number) => Promise<ApiResponse<void>>;
  createCategory: (data: Partial<BlogCategory>) => Promise<ApiResponse<BlogCategory>>;
  updateCategory: (id: number, data: Partial<BlogCategory>) => Promise<ApiResponse<BlogCategory>>;
  deleteCategory: (id: number) => Promise<ApiResponse<void>>;
  approveComment: (id: number) => Promise<ApiResponse<BlogComment>>;
  deleteComment: (id: number) => Promise<ApiResponse<void>>;
}

export const blogApi: BlogApi = {
  list: async (params = {}) => {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.append('page', String(params.page));
    if (params.limit) searchParams.append('limit', String(params.limit));
    if (params.search) searchParams.append('search', params.search);
    if (params.category) searchParams.append('category', params.category);
    if (typeof params.featured === 'boolean') searchParams.append('featured', String(params.featured));

    const response = await fetch(`/api/blog?${searchParams.toString()}`);
    return response.json();
  },

  getBySlug: async (slug: string) => {
    const response = await fetch(`/api/blog/post/${slug}`);
    return response.json();
  },

  getCategories: async () => {
    const response = await fetch('/api/blog/categories');
    return response.json();
  },

  getComments: async (postId: number) => {
    const response = await fetch(`/api/blog/post/${postId}/comments`);
    return response.json();
  },

  createComment: async (postId: number, data: Partial<BlogComment>) => {
    const response = await fetch(`/api/blog/post/${postId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  listAll: async () => {
    const response = await fetch('/api/blog/all');
    return response.json();
  },

  create: async (data: Partial<BlogPost>) => {
    const response = await fetch('/api/blog/post', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  update: async (id: number, data: Partial<BlogPost>) => {
    const response = await fetch(`/api/blog/post/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  delete: async (id: number) => {
    const response = await fetch(`/api/blog/post/${id}`, {
      method: 'DELETE',
    });
    return response.json();
  },

  createCategory: async (data: Partial<BlogCategory>) => {
    const response = await fetch('/api/blog/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  updateCategory: async (id: number, data: Partial<BlogCategory>) => {
    const response = await fetch(`/api/blog/categories/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  deleteCategory: async (id: number) => {
    const response = await fetch(`/api/blog/categories/${id}`, {
      method: 'DELETE',
    });
    return response.json();
  },

  approveComment: async (id: number) => {
    const response = await fetch(`/api/blog/comments/${id}/approve`, {
      method: 'PUT',
    });
    return response.json();
  },

  deleteComment: async (id: number) => {
    const response = await fetch(`/api/blog/comments/${id}`, {
      method: 'DELETE',
    });
    return response.json();
  },
};
