/**
 * Shared code between client and server
 * Useful to share types between client and server
 * and/or small pure JS functions that can be used on both client and server
 */

/**
 * Example response type for /api/demo
 */
export interface DemoResponse {
  message: string;
}

/**
 * Standard API Response wrapper
 */
export type ApiResponse<T = any> = {
  success: boolean;
  data?: T;
  error?: string;
  details?: any;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

/**
 * User types
 */
export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  role: 'user' | 'admin';
  avatar_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateUser {
  email: string;
  password_hash: string;
  first_name: string;
  last_name: string;
  phone?: string;
  role?: 'user' | 'admin';
  avatar_url?: string;
  is_active?: boolean;
}

/**
 * Service types
 */
export interface Service {
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

export interface CreateService {
  name: string;
  description?: string;
  short_description?: string;
  price_range?: string;
  category?: string;
  image_url?: string;
  features?: string;
  is_active?: boolean;
  is_featured?: boolean;
}

/**
 * Product types
 */
export interface Product {
  id: number;
  name: string;
  description?: string;
  price?: number;
  category?: string;
  image_url?: string;
  images?: string[]; // JSON array of image URLs
  specifications?: string; // JSON string
  stock_quantity: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateProduct {
  name: string;
  description?: string;
  price?: number;
  category?: string;
  image_url?: string;
  images?: string;
  specifications?: string;
  stock_quantity?: number;
  is_active?: boolean;
}

/**
 * Quote types
 */
export interface Quote {
  id: number;
  user_id?: number;
  service_id?: number;
  project_name: string;
  description?: string;
  requirements?: string; // JSON string
  budget_range?: string;
  timeline?: string;
  status: 'pending' | 'reviewed' | 'approved' | 'rejected';
  estimated_cost?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface QuoteWithDetails extends Quote {
  user_name?: string;
  user_email?: string;
  service_name?: string;
}

export interface CreateQuote {
  user_id?: number;
  service_id?: number;
  project_name: string;
  description?: string;
  requirements?: string;
  budget_range?: string;
  timeline?: string;
  status?: 'pending' | 'reviewed' | 'approved' | 'rejected';
  estimated_cost?: number;
  notes?: string;
}

/**
 * Contact Message types
 */
export interface ContactMessage {
  id: number;
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  status: 'unread' | 'read' | 'replied';
  created_at: string;
}

export interface CreateContactMessage {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  status?: 'unread' | 'read' | 'replied';
}

/**
 * Image types
 */
export interface Image {
  id: number;
  filename: string;
  original_name: string;
  mime_type: string;
  size: number;
  path: string;
  url: string;
  alt_text?: string;
  entity_type?: 'user' | 'service' | 'product' | 'quote';
  entity_id?: number;
  created_at: string;
}

export interface CreateImage {
  filename: string;
  original_name: string;
  mime_type: string;
  size: number;
  path: string;
  url: string;
  alt_text?: string;
  entity_type?: 'user' | 'service' | 'product' | 'quote';
  entity_id?: number;
}

/**
 * Testimonial types
 */
export interface Testimonial {
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
  updated_at: string;
}

export interface CreateTestimonial {
  user_id?: number;
  name: string;
  company?: string;
  position?: string;
  content: string;
  rating: number;
  is_featured?: boolean;
  is_active?: boolean;
}

/**
 * Authentication types
 */
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SessionData {
  id: string;
  expires_at: string;
}

export interface AuthResponse {
  user: User;
  session: SessionData;
}

/**
 * Statistics types
 */
export interface QuoteStatistics {
  total: number;
  pending: number;
  reviewed: number;
  approved: number;
  rejected: number;
}

export interface ContactStatistics {
  total: number;
  unread: number;
  read: number;
  replied: number;
}

export interface StorageStatistics {
  total_images: number;
  total_size: number;
  by_type: {
    entity_type: string;
    count: number;
    size: number;
  }[];
}

export interface TestimonialStatistics {
  total: number;
  active: number;
  featured: number;
  average_rating: number;
  rating_distribution: {
    rating: number;
    count: number;
  }[];
}

/**
 * Company Information types
 */
export interface CompanyInfo {
  name: string;
  tagline: string;
  website: string;
  vision: string;
  mission: string;
  stats: CompanyStats;
  certifications: string[];
}

export interface CompanyStats {
  established: number;
  incorporated: number;
  citiesCovered: string;
  workforce: string;
  clientBase: string;
  completedProjects: string;
}

export interface CompanyOffice {
  office: string;
  address?: string;
  poBox?: string;
  phone: string[];
  email: string;
}

export interface ContactPerson {
  name: string;
  phone: string[];
}

export interface CompanyContacts {
  offices: {
    main: CompanyOffice;
    nairobi: CompanyOffice;
    genparts: CompanyOffice;
    western: CompanyOffice;
  };
  keyPersonnel: {
    general: ContactPerson;
    financial: ContactPerson;
    technical: ContactPerson;
  };
}

export interface CompanyRegistration {
  incorporationCertificate: string;
  vatRegistration: string;
  pinCertificate: string;
  taxCompliance: string;
  etrSerial: string;
}

/**
 * Blog types
 */
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
  status: 'draft' | 'published' | 'archived';
  is_published: boolean;
  is_featured: boolean;
  published_at?: string;
  views: number;
  created_at: string;
  updated_at: string;
  meta_title?: string;
  meta_description?: string;
}

export interface CreateBlogPost {
  title: string;
  slug?: string;
  content: string;
  excerpt?: string;
  featured_image?: string;
  category?: string;
  tags?: string[];
  author_id: number;
  status?: 'draft' | 'published' | 'archived';
  is_published?: boolean;
  is_featured?: boolean;
  published_at?: string;
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

export interface CreateBlogCategory {
  name: string;
  slug?: string;
  description?: string;
  is_active?: boolean;
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

export interface CreateBlogComment {
  post_id: number;
  user_id?: number;
  author_name: string;
  author_email: string;
  content: string;
  parent_id?: number;
}
