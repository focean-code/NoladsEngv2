import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY!;

if (!supabaseUrl) {
  throw new Error("Missing VITE_SUPABASE_URL environment variable");
}

if (!supabaseAnonKey) {
  throw new Error("Missing VITE_SUPABASE_ANON_KEY environment variable");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

// Debug: log authentication status
supabase.auth.onAuthStateChange((event, session) => {
  console.log('Supabase auth event:', event);
  console.log('Session:', session);
});

// Database types (inferred from shared API types)
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: number;
          email: string;
          first_name: string;
          last_name: string;
          phone?: string;
          role: "user" | "admin";
          avatar_url?: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          email: string;
          first_name: string;
          last_name: string;
          phone?: string;
          role?: "user" | "admin";
          avatar_url?: string;
          is_active?: boolean;
        };
        Update: {
          email?: string;
          first_name?: string;
          last_name?: string;
          phone?: string;
          role?: "user" | "admin";
          avatar_url?: string;
          is_active?: boolean;
        };
      };
      services: {
        Row: {
          id: number;
          name: string;
          description?: string;
          short_description?: string;
          price_range?: string;
          category?: string;
          image_url?: string;
          features?: string;
          is_active: boolean;
          is_featured: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          name: string;
          description?: string;
          short_description?: string;
          price_range?: string;
          category?: string;
          image_url?: string;
          features?: string;
          is_active?: boolean;
          is_featured?: boolean;
        };
        Update: {
          name?: string;
          description?: string;
          short_description?: string;
          price_range?: string;
          category?: string;
          image_url?: string;
          features?: string;
          is_active?: boolean;
          is_featured?: boolean;
        };
      };
      products: {
        Row: {
          id: number;
          name: string;
          description?: string;
          price?: number;
          category?: string;
          image_url?: string;
          images?: string;
          specifications?: string;
          stock_quantity: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          name: string;
          description?: string;
          price?: number;
          category?: string;
          image_url?: string;
          images?: string;
          specifications?: string;
          stock_quantity?: number;
          is_active?: boolean;
        };
        Update: {
          name?: string;
          description?: string;
          price?: number;
          category?: string;
          image_url?: string;
          images?: string;
          specifications?: string;
          stock_quantity?: number;
          is_active?: boolean;
        };
      };
      quotes: {
        Row: {
          id: number;
          user_id?: number;
          service_id?: number;
          project_name: string;
          description?: string;
          requirements?: string;
          budget_range?: string;
          timeline?: string;
          status: "pending" | "reviewed" | "approved" | "rejected";
          estimated_cost?: number;
          notes?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id?: number;
          service_id?: number;
          project_name: string;
          description?: string;
          requirements?: string;
          budget_range?: string;
          timeline?: string;
          status?: "pending" | "reviewed" | "approved" | "rejected";
          estimated_cost?: number;
          notes?: string;
        };
        Update: {
          user_id?: number;
          service_id?: number;
          project_name?: string;
          description?: string;
          requirements?: string;
          budget_range?: string;
          timeline?: string;
          status?: "pending" | "reviewed" | "approved" | "rejected";
          estimated_cost?: number;
          notes?: string;
        };
      };
      contact_messages: {
        Row: {
          id: number;
          name: string;
          email: string;
          phone?: string;
          subject?: string;
          message: string;
          status: "unread" | "read" | "replied";
          created_at: string;
        };
        Insert: {
          name: string;
          email: string;
          phone?: string;
          subject?: string;
          message: string;
          status?: "unread" | "read" | "replied";
        };
        Update: {
          name?: string;
          email?: string;
          phone?: string;
          subject?: string;
          message?: string;
          status?: "unread" | "read" | "replied";
        };
      };
      testimonials: {
        Row: {
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
        };
        Insert: {
          user_id?: number;
          name: string;
          company?: string;
          position?: string;
          content: string;
          rating: number;
          is_featured?: boolean;
          is_active?: boolean;
        };
        Update: {
          user_id?: number;
          name?: string;
          company?: string;
          position?: string;
          content?: string;
          rating?: number;
          is_featured?: boolean;
          is_active?: boolean;
        };
      };
      images: {
        Row: {
          id: number;
          filename: string;
          original_name: string;
          mime_type: string;
          size: number;
          path: string;
          url: string;
          alt_text?: string;
          entity_type?: "user" | "service" | "product" | "quote";
          entity_id?: number;
          created_at: string;
        };
        Insert: {
          filename: string;
          original_name: string;
          mime_type: string;
          size: number;
          path: string;
          url: string;
          alt_text?: string;
          entity_type?: "user" | "service" | "product" | "quote";
          entity_id?: number;
        };
        Update: {
          filename?: string;
          original_name?: string;
          mime_type?: string;
          size?: number;
          path?: string;
          url?: string;
          alt_text?: string;
          entity_type?: "user" | "service" | "product" | "quote";
          entity_id?: number;
        };
      };
      blog_posts: {
        Row: {
          id: number;
          title: string;
          slug: string;
          content: string;
          excerpt?: string;
          featured_image?: string;
          category?: string;
          tags?: string[];
          author_id: number;
          status: "draft" | "published" | "archived";
          published_at?: string;
          created_at: string;
          updated_at: string;
          meta_title?: string;
          meta_description?: string;
        };
        Insert: {
          title: string;
          slug?: string;
          content: string;
          excerpt?: string;
          featured_image?: string;
          category?: string;
          tags?: string[];
          author_id: number;
          status?: "draft" | "published" | "archived";
          published_at?: string;
          meta_title?: string;
          meta_description?: string;
        };
        Update: {
          title?: string;
          slug?: string;
          content?: string;
          excerpt?: string;
          featured_image?: string;
          category?: string;
          tags?: string[];
          author_id?: number;
          status?: "draft" | "published" | "archived";
          published_at?: string;
          meta_title?: string;
          meta_description?: string;
        };
      };
    };
  };
}
