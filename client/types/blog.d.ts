export interface BlogPost {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  featured_image?: string;
  category?: string;
  tags?: string[];
  author_id: number;
  is_published: boolean;
  is_featured: boolean;
  published_at?: string;
  views: number;
  created_at: string;
  updated_at: string;
  meta_title?: string;
  meta_description?: string;
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

export interface BlogComment {
  id: number;
  post_id: number;
  user_id: number;
  author_name: string;
  author_email: string;
  content: string;
  is_approved: boolean;
  is_spam?: boolean;
  parent_id?: number;
  created_at: string;
  updated_at: string;
}
