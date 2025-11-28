import type {
  User,
  CreateUser,
  Service,
  CreateService,
  Product,
  CreateProduct,
  Quote,
  CreateQuote,
  QuoteWithDetails,
  ContactMessage,
  CreateContactMessage,
  Image,
  CreateImage,
  Testimonial,
  CreateTestimonial,
  QuoteStatistics,
  ContactStatistics,
  StorageStatistics,
  TestimonialStatistics,
  AuthResponse,
  LoginCredentials,
  CompanyInfo,
  CompanyContacts,
  CompanyStats,
  CompanyRegistration,
  BlogPost,
  CreateBlogPost,
  ApiResponse,
  AnalyticsOverview,
  RealTimeData,
  ConversionData
} from "@shared/api";

export interface SupabaseAuthClient {
  login(email: string, password: string): Promise<ApiResponse<AuthResponse>>;
  logout(): Promise<ApiResponse<{ message: string }>>;
  getCurrentUser(): Promise<ApiResponse<User>>;
  signup(email: string, password: string, metadata?: any): Promise<ApiResponse<AuthResponse>>;
  verify(): Promise<ApiResponse<any>>;
}

export interface SupabaseUsersClient {
  getAll(): Promise<ApiResponse<User[]>>;
}

export interface SupabaseImagesClient {
  upload(file: File, entityType: string, entityId: number, altText?: string): Promise<ApiResponse<string>>;
  uploadMultiple(files: File[], entityType: string, entityId: number, altTexts?: string[]): Promise<ApiResponse<string[]>>;
}

export interface SupabaseBlogClient {
  getAll(params?: { page?: number; limit?: number; category?: string; status?: string }): Promise<ApiResponse<BlogPost[]>>;
  getBySlug(slug: string): Promise<ApiResponse<BlogPost>>;
  listAll(): Promise<ApiResponse<BlogPost[]>>;
  create(data: CreateBlogPost): Promise<ApiResponse<BlogPost>>;
  update(id: number, data: Partial<BlogPost>): Promise<ApiResponse<BlogPost>>;
  delete(id: number): Promise<ApiResponse<{}>>;
  getComments(postId: number): Promise<ApiResponse<BlogComment[]>>;
  createComment(data: CreateBlogComment): Promise<ApiResponse<BlogComment>>;
  approveComment(commentId: number): Promise<ApiResponse<BlogComment>>;
  deleteComment(commentId: number): Promise<ApiResponse<{}>>;
  getCategories(): Promise<ApiResponse<BlogCategory[]>>;
  createCategory(data: CreateBlogCategory): Promise<ApiResponse<BlogCategory>>;
  updateCategory(id: number, data: Partial<BlogCategory>): Promise<ApiResponse<BlogCategory>>;
  deleteCategory(id: number): Promise<ApiResponse<{}>>;
}

export interface SupabaseProductsClient {
  getAll(params?: { page?: number; limit?: number; search?: string; category?: string; active?: boolean }): Promise<ApiResponse<Product[]>>;
  getFeatured(limit?: number): Promise<ApiResponse<Product[]>>;
  getById(id: number): Promise<ApiResponse<Product>>;
  create(data: CreateProduct): Promise<ApiResponse<Product>>;
  update(id: number, data: Partial<Product>): Promise<ApiResponse<Product>>;
  delete(id: number): Promise<ApiResponse<{}>>;
  subscribeToStock(productId: number, email: string): Promise<ApiResponse<any>>;
}

export interface SupabaseTestimonialsClient {
  getAll(params?: { page?: number; limit?: number; activeOnly?: boolean }): Promise<ApiResponse<Testimonial[]>>;
  getFeatured(limit?: number): Promise<ApiResponse<Testimonial[]>>;
  getById(id: number): Promise<ApiResponse<Testimonial>>;
  create(data: CreateTestimonial): Promise<ApiResponse<Testimonial>>;
  update(id: number, data: Partial<Testimonial>): Promise<ApiResponse<Testimonial>>;
  delete(id: number): Promise<ApiResponse<{}>>;
}

export interface SupabaseServicesClient {
  getAll(params?: { page?: number; limit?: number; active?: boolean; category?: string }): Promise<ApiResponse<Service[]>>;
  getFeatured(limit?: number): Promise<ApiResponse<Service[]>>;
  getById(id: number): Promise<ApiResponse<Service>>;
  create(data: CreateService): Promise<ApiResponse<Service>>;
  update(id: number, data: Partial<Service>): Promise<ApiResponse<Service>>;
  delete(id: number): Promise<ApiResponse<{}>>;
}

export interface SupabaseCompanyClient {
  getStats(): Promise<ApiResponse<CompanyStats>>;
}

export interface SupabaseQuotesClient {
  getAll(params?: { page?: number; limit?: number; status?: string }): Promise<ApiResponse<Quote[]>>;
  getById(id: number): Promise<ApiResponse<Quote>>;
  create(data: CreateQuote): Promise<ApiResponse<Quote>>;
  update(id: number, data: Partial<Quote>): Promise<ApiResponse<Quote>>;
  delete(id: number): Promise<ApiResponse<{}>>;
}

export interface SupabaseContactClient {
  create(data: CreateContactMessage): Promise<ApiResponse<ContactMessage>>;
  getAll(params?: { page?: number; limit?: number; status?: string }): Promise<ApiResponse<ContactMessage[]>>;
  update(id: number, data: Partial<ContactMessage>): Promise<ApiResponse<ContactMessage>>;
  delete(id: number): Promise<ApiResponse<{}>>;
}

export interface SupabaseAnalyticsClient {
  getGoogleAnalytics(): Promise<ApiResponse<AnalyticsOverview>>;
  getRealTimeData(): Promise<ApiResponse<RealTimeData>>;
  getConversionData(): Promise<ApiResponse<ConversionData>>;
  refresh(): Promise<ApiResponse<any>>;
}

export interface SupabaseApiClient {
  auth: SupabaseAuthClient;
  users: SupabaseUsersClient;
  images: SupabaseImagesClient;
  blog: SupabaseBlogClient;
  products: SupabaseProductsClient;
  testimonials: SupabaseTestimonialsClient;
  services: SupabaseServicesClient;
  company: SupabaseCompanyClient;
  analytics: SupabaseAnalyticsClient;
  quotes: SupabaseQuotesClient;
  contact: SupabaseContactClient;
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
