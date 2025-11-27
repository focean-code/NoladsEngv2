export interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featured_image: string;
  category: string;
  author_id: number;
  author_name?: string;
  author_email?: string;
  is_published: boolean;
  is_featured: boolean;
  published_at: string;
  meta_title?: string;
  meta_description?: string;
  views: number;
  created_at: string;
  updated_at: string;
}

export interface CreateBlogPost {
  title: string;
  excerpt: string;
  content: string;
  featured_image?: string;
  category: string;
  meta_title?: string;
  meta_description?: string;
  is_published?: boolean;
  is_featured?: boolean;
}

export interface BlogCategory {
  id: number;
  name: string;
  slug: string;
  description?: string;
  is_active: boolean;
  post_count?: number;
  created_at: string;
  updated_at: string;
}

export interface CreateBlogCategory {
  name: string;
  description?: string;
  is_active?: boolean;
}

export interface BlogComment {
  id: number;
  post_id: number;
  user_id: number | null;
  author_name: string | null;
  author_email: string | null;
  content: string;
  is_approved: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateBlogComment {
  post_id: number;
  user_id?: number;
  author_name?: string;
  author_email?: string;
  content: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  };
}

export interface BlogListParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  featured?: boolean;
}
