import { User, Session } from '@supabase/supabase-js';
import { ApiResponse } from './api';
import { Quote, CreateQuote } from '@shared/api';

interface AuthResponse {
  user: User | null;
  session: Session | null;
}

interface Service {
  id: number;
  name: string;
  description?: string;
  short_description?: string;
  price_range?: string;
  category?: string;
  image_url?: string;
  features?: string; // JSON string
  is_active: boolean;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  featured_image?: string;
  category?: string;
  status: 'draft' | 'published' | 'archived';
  author_id: number;
  created_at: string;
  updated_at: string;
}

interface BlogComment {
  id: number;
  post_id: number;
  author_id: number;
  content: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

interface BlogCategory {
  id: number;
  name: string;
  slug: string;
  description?: string;
}

interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  category?: string;
  image_url?: string;
  images?: string[];
  specifications?: any;
  stock_quantity: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface Testimonial {
  id: number;
  user_id?: number;
  name: string;
  company?: string;
  position?: string;
  content: string;
  rating: number;
  is_featured: boolean;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

interface CompanyStats {
  totalProducts: number;
  totalServices: number;
  totalQuotes: number;
  totalTestimonials: number;
  yearsInBusiness: number;
  satisfactionRate: number;
  projectsCompleted: number;
}

export type { SupabaseApiClient } from './supabase.d';