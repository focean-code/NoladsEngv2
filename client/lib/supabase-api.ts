import { supabase } from "./supabase";
import { mockServices, mockProducts, mockCompanyStats } from "./mock-data";
import type {
  ApiResponse,
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
  Testimonial,
  CreateTestimonial,
  BlogPost,
  CreateBlogPost,
  QuoteStatistics,
  ContactStatistics,
  TestimonialStatistics,
  CompanyInfo,
  CompanyStats,
  CompanyContacts,
  CompanyRegistration,
} from "@shared/api";

// Helper function to format Supabase responses as ApiResponse
function formatResponse<T>(data: T | null, error: any = null): ApiResponse<T> {
  if (error) {
    return {
      success: false,
      error: error.message || "An error occurred",
      details: error,
    };
  }

  return {
    success: true,
    data: data as T,
  };
}

class SupabaseApiClient {
  // Services
  services = {
    getAll: async (params?: {
      page?: number;
      limit?: number;
      search?: string;
      category?: string;
      active?: boolean;
    }): Promise<ApiResponse<Service[]>> => {
      try {
        // Prefer server-admin API when available (ensures consistent data + bypasses RLS for admin)
        try {
          const { data: sess } = await supabase.auth.getSession();
          const token = sess.session?.access_token;
          if (token) {
            const search = new URLSearchParams();
            if (params?.active !== undefined) search.set('active', String(params.active));
            if (params?.category) search.set('category', params.category);
            if (params?.search) search.set('search', params.search);
            if (params?.limit) search.set('limit', String(params.limit));
            if (params?.page) search.set('page', String(params.page));
            const resp = await fetch(`/api/admin/services${search.toString() ? `?${search.toString()}` : ''}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            if (resp.ok) {
              const json = await resp.json();
              return json as ApiResponse<Service[]>;
            }
          }
        } catch {}

        // Fallback to direct Supabase client (works for public reads with RLS)
        let query = supabase.from("services").select("*");

        if (params?.active !== undefined) {
          query = query.eq("is_active", params.active);
        }

        if (params?.category) {
          query = query.eq("category", params.category);
        }

        if (params?.search) {
          query = query.or(
            `name.ilike.%${params.search}%,description.ilike.%${params.search}%`,
          );
        }

        if (params?.limit) {
          const offset = ((params?.page || 1) - 1) * params.limit;
          query = query.range(offset, offset + params.limit - 1);
        }

        const { data, error } = await query.order("created_at", {
          ascending: false,
        });

        // If table doesn't exist, fall back to mock data
        if (error && error.code === "PGRST116") {
          console.warn(
            "Services table not found, using mock data. Please run the database schema.",
          );
          let filteredServices = mockServices;

          if (params?.active !== undefined) {
            filteredServices = filteredServices.filter(
              (s) => s.is_active === params.active,
            );
          }

          if (params?.category) {
            filteredServices = filteredServices.filter(
              (s) => s.category === params.category,
            );
          }

          if (params?.search) {
            const searchTerm = params.search.toLowerCase();
            filteredServices = filteredServices.filter(
              (s) =>
                s.name.toLowerCase().includes(searchTerm) ||
                s.description?.toLowerCase().includes(searchTerm),
            );
          }

          if (params?.limit) {
            const offset = ((params?.page || 1) - 1) * params.limit;
            filteredServices = filteredServices.slice(
              offset,
              offset + params.limit,
            );
          }

          return formatResponse(filteredServices);
        }

        return formatResponse(data, error);
      } catch (error) {
        return formatResponse(null, error);
      }
    },

    getFeatured: async (limit?: number): Promise<ApiResponse<Service[]>> => {
      try {
        let query = supabase
          .from("services")
          .select("*")
          .eq("is_active", true)
          .order("created_at", { ascending: false });

        if (limit) {
          query = query.limit(limit);
        }

        const { data, error } = await query;

        // If table doesn't exist, fall back to mock data
        if (error && error.code === "PGRST116") {
          console.warn(
            "Services table not found, using mock data. Please run the database schema.",
          );
          let services = mockServices.filter((s) => s.is_active);
          if (limit) {
            services = services.slice(0, limit);
          }
          return formatResponse(services);
        }

        return formatResponse(data, error);
      } catch (error) {
        return formatResponse(null, error);
      }
    },

    getById: async (id: number): Promise<ApiResponse<Service>> => {
      try {
        const { data, error } = await supabase
          .from("services")
          .select("*")
          .eq("id", id)
          .single();

        return formatResponse(data, error);
      } catch (error) {
        return formatResponse(null, error);
      }
    },

    create: async (
      serviceData: CreateService,
    ): Promise<ApiResponse<Service>> => {
      try {
        const { data: sess } = await supabase.auth.getSession();
        const token = sess.session?.access_token;
        if (!token) return formatResponse(null, { message: 'Not authenticated' });
        const resp = await fetch('/api/admin/services', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(serviceData)
        });
        const json = await resp.json();
        if (!resp.ok) return formatResponse(null, json);
        return json as ApiResponse<Service>;
      } catch (error) {
        return formatResponse(null, error);
      }
    },

    update: async (
      id: number,
      serviceData: Partial<CreateService>,
    ): Promise<ApiResponse<Service>> => {
      try {
        const { data: sess } = await supabase.auth.getSession();
        const token = sess.session?.access_token;
        if (!token) return formatResponse(null, { message: 'Not authenticated' });
        const resp = await fetch(`/api/admin/services/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(serviceData)
        });
        const json = await resp.json();
        if (!resp.ok) return formatResponse(null, json);
        return json as ApiResponse<Service>;
      } catch (error) {
        return formatResponse(null, error);
      }
    },

    delete: async (id: number): Promise<ApiResponse<{ message: string }>> => {
      try {
        const { data: sess } = await supabase.auth.getSession();
        const token = sess.session?.access_token;
        if (!token) return formatResponse(null, { message: 'Not authenticated' });
        const resp = await fetch(`/api/admin/services/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        });
        const json = await resp.json();
        if (!resp.ok) return formatResponse(null, json);
        return json as ApiResponse<{ message: string }>;
      } catch (error) {
        return formatResponse(null, error);
      }
    },
  };

  // Products
  products = {
    getAll: async (params?: {
      page?: number;
      limit?: number;
      search?: string;
      category?: string;
      active?: boolean;
    }): Promise<ApiResponse<Product[]>> => {
      try {
        let query = supabase.from("products").select("*");

        if (params?.active !== undefined) {
          query = query.eq("is_active", params.active);
        }

        if (params?.category) {
          query = query.eq("category", params.category);
        }

        if (params?.search) {
          query = query.or(
            `name.ilike.%${params.search}%,description.ilike.%${params.search}%`,
          );
        }

        if (params?.limit) {
          const offset = ((params?.page || 1) - 1) * params.limit;
          query = query.range(offset, offset + params.limit - 1);
        }

        const { data, error } = await query.order("created_at", {
          ascending: false,
        });

        // If table doesn't exist, fall back to mock data
        if (error && error.code === "PGRST116") {
          console.warn(
            "Products table not found, using mock data. Please run the database schema.",
          );
          let filteredProducts = mockProducts;

          if (params?.active !== undefined) {
            filteredProducts = filteredProducts.filter(
              (p) => p.is_active === params.active,
            );
          }

          if (params?.category) {
            filteredProducts = filteredProducts.filter(
              (p) => p.category === params.category,
            );
          }

          if (params?.search) {
            const searchTerm = params.search.toLowerCase();
            filteredProducts = filteredProducts.filter(
              (p) =>
                p.name.toLowerCase().includes(searchTerm) ||
                p.description?.toLowerCase().includes(searchTerm),
            );
          }

          if (params?.limit) {
            const offset = ((params?.page || 1) - 1) * params.limit;
            filteredProducts = filteredProducts.slice(
              offset,
              offset + params.limit,
            );
          }

          return formatResponse(filteredProducts);
        }

        return formatResponse(data, error);
      } catch (error) {
        return formatResponse(null, error);
      }
    },

    getFeatured: async (limit?: number): Promise<ApiResponse<Product[]>> => {
      try {
        let query = supabase
          .from("products")
          .select("*")
          .eq("is_active", true)
          .order("created_at", { ascending: false });

        if (limit) {
          query = query.limit(limit);
        }

        const { data, error } = await query;

        // If table doesn't exist, fall back to mock data
        if (error && error.code === "PGRST116") {
          console.warn(
            "Products table not found, using mock data. Please run the database schema.",
          );
          let products = mockProducts.filter((p) => p.is_active);
          if (limit) {
            products = products.slice(0, limit);
          }
          return formatResponse(products);
        }

        return formatResponse(data, error);
      } catch (error) {
        return formatResponse(null, error);
      }
    },

    getById: async (id: number): Promise<ApiResponse<Product>> => {
      try {
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .eq("id", id)
          .single();

        return formatResponse(data, error);
      } catch (error) {
        return formatResponse(null, error);
      }
    },

    create: async (
      productData: CreateProduct,
    ): Promise<ApiResponse<Product>> => {
      try {
        // Prefer server-admin endpoint when available (avoids RLS issues)
        try {
          const { data: sess } = await supabase.auth.getSession();
          const token = sess.session?.access_token;
          if (token) {
            const resp = await fetch(`/api/admin/products`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
              body: JSON.stringify(productData)
            });
            const json = await resp.json();
            if (!resp.ok) return formatResponse(null, json);
            return json as ApiResponse<Product>;
          }
        } catch {}

        const { data, error } = await supabase
          .from("products")
          .insert([productData])
          .select()
          .single();

        return formatResponse(data, error);
      } catch (error) {
        return formatResponse(null, error);
      }
    },

    update: async (
      id: number,
      productData: Partial<CreateProduct>,
    ): Promise<ApiResponse<Product>> => {
      try {
        try {
          const { data: sess } = await supabase.auth.getSession();
          const token = sess.session?.access_token;
          if (token) {
            const resp = await fetch(`/api/admin/products/${id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
              body: JSON.stringify(productData)
            });
            const json = await resp.json();
            if (!resp.ok) return formatResponse(null, json);
            return json as ApiResponse<Product>;
          }
        } catch {}

        const { data, error } = await supabase
          .from("products")
          .update(productData)
          .eq("id", id)
          .select()
          .single();

        return formatResponse(data, error);
      } catch (error) {
        return formatResponse(null, error);
      }
    },

    delete: async (id: number): Promise<ApiResponse<{ message: string }>> => {
      try {
        try {
          const { data: sess } = await supabase.auth.getSession();
          const token = sess.session?.access_token;
          if (token) {
            const resp = await fetch(`/api/admin/products/${id}`, {
              method: 'DELETE',
              headers: { Authorization: `Bearer ${token}` }
            });
            const json = await resp.json();
            if (!resp.ok) return formatResponse(null, json);
            return json as ApiResponse<{ message: string }>;
          }
        } catch {}

        const { error } = await supabase.from("products").delete().eq("id", id);

        if (error) {
          return formatResponse(null, error);
        }

        return formatResponse({ message: "Product deleted successfully" });
      } catch (error) {
        return formatResponse(null, error);
      }
    },
  };

  // Company info (mock data for now - can be moved to database later)
  company = {
    getInfo: async (): Promise<ApiResponse<CompanyInfo>> => {
      try {
        const companyInfo: CompanyInfo = {
          name: "Nolads Engineering",
          tagline: "A Pinnacle Of Engineering Excellence",
          website: "https://noladsengineering.com",
          vision:
            "To be the leading provider of innovative electrical engineering solutions across Africa",
          mission:
            "Delivering world-class engineering services that power industrial growth and innovation",
          stats: {
            established: 1998,
            incorporated: 2003,
            citiesCovered: "10+",
            workforce: "500+",
            clientBase: "100+",
            completedProjects: "1000+",
          },
          certifications: [
            "ISO 9001:2015",
            "ISO 14001:2015",
            "OHSAS 18001:2007",
            "IEEE Certified",
          ],
        };

        return formatResponse(companyInfo);
      } catch (error) {
        return formatResponse(null, error);
      }
    },

    getStats: async (): Promise<ApiResponse<CompanyStats>> => {
      try {
        // For now, always return mock data since this is company info
        return formatResponse(mockCompanyStats);
      } catch (error) {
        return formatResponse(null, error);
      }
    },

    getContact: async (): Promise<ApiResponse<CompanyContacts>> => {
      try {
        const contacts: CompanyContacts = {
          offices: {
            main: {
              office: "Main Office - Nairobi",
              address: "Enterprise Road, Industrial Area",
              poBox: "P.O. Box 12345-00100",
              phone: ["+254 20 123 4567"],
              email: "info@noladsengineering.com",
            },
            nairobi: {
              office: "Nairobi Branch",
              phone: ["+254 20 123 4567"],
              email: "nairobi@noladsengineering.com",
            },
            genparts: {
              office: "Genparts Division",
              phone: ["+254 20 123 4568"],
              email: "genparts@noladsengineering.com",
            },
            western: {
              office: "Western Region",
              phone: ["+254 20 123 4569"],
              email: "western@noladsengineering.com",
            },
          },
          keyPersonnel: {
            general: {
              name: "General Manager",
              phone: ["+254 20 123 4567"],
            },
            financial: {
              name: "Financial Controller",
              phone: ["+254 20 123 4567"],
            },
            technical: {
              name: "Technical Director",
              phone: ["+254 20 123 4567"],
            },
          },
        };

        return formatResponse(contacts);
      } catch (error) {
        return formatResponse(null, error);
      }
    },

    getRegistration: async (): Promise<ApiResponse<CompanyRegistration>> => {
      try {
        const registration: CompanyRegistration = {
          incorporationCertificate: "C.123456",
          vatRegistration: "VAT123456789",
          pinCertificate: "P123456789X",
          taxCompliance: "TC-2024-001",
          etrSerial: "ETR-001-2024",
        };

        return formatResponse(registration);
      } catch (error) {
        return formatResponse(null, error);
      }
    },
  };

  // Authentication
  auth = {
    login: async (email: string, password: string) => {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          return formatResponse(null, error);
        }

        return formatResponse({
          user: data.user,
          session: data.session,
        });
      } catch (error) {
        return formatResponse(null, error);
      }
    },

    logout: async () => {
      try {
        const { error } = await supabase.auth.signOut();

        if (error) {
          return formatResponse(null, error);
        }

        return formatResponse({ message: "Logged out successfully" });
      } catch (error) {
        return formatResponse(null, error);
      }
    },

    getCurrentUser: async () => {
      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();

        if (error) {
          return formatResponse(null, error);
        }

        return formatResponse(user);
      } catch (error) {
        return formatResponse(null, error);
      }
    },

    signup: async (email: string, password: string, metadata?: any) => {
      try {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: metadata,
          },
        });

        if (error) {
          return formatResponse(null, error);
        }

        return formatResponse({
          user: data.user,
          session: data.session,
        });
      } catch (error) {
        return formatResponse(null, error);
      }
    },
  };

  // Contact messages
  contact = {
    create: async (
      messageData: CreateContactMessage,
    ): Promise<ApiResponse<ContactMessage>> => {
      try {
        const { data, error } = await supabase
          .from("contact_messages")
          .insert([messageData])
          .select()
          .single();

        return formatResponse(data, error);
      } catch (error) {
        return formatResponse(null, error);
      }
    },

    getAll: async (params?: {
      page?: number;
      limit?: number;
      search?: string;
      status?: string;
    }): Promise<ApiResponse<ContactMessage[]>> => {
      try {
        let query = supabase.from("contact_messages").select("*");

        if (params?.status) {
          query = query.eq("status", params.status);
        }

        if (params?.search) {
          query = query.or(
            `name.ilike.%${params.search}%,email.ilike.%${params.search}%,subject.ilike.%${params.search}%`,
          );
        }

        if (params?.limit) {
          const offset = ((params?.page || 1) - 1) * params.limit;
          query = query.range(offset, offset + params.limit - 1);
        }

        const { data, error } = await query.order("created_at", {
          ascending: false,
        });
        return formatResponse(data, error);
      } catch (error) {
        return formatResponse(null, error);
      }
    },
    update: async (id: number, payload: Partial<CreateContactMessage>): Promise<ApiResponse<ContactMessage>> => {
      try {
        try {
          const { data: sess } = await supabase.auth.getSession();
          const token = sess.session?.access_token;
          if (token) {
            const resp = await fetch(`/api/admin/contacts/${id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
              body: JSON.stringify(payload)
            });
            const json = await resp.json();
            if (!resp.ok) return formatResponse(null, json);
            return json as ApiResponse<ContactMessage>;
          }
        } catch {}

        const { data, error } = await supabase.from('contact_messages').update(payload).eq('id', id).select().single();
        return formatResponse(data, error);
      } catch (error) {
        return formatResponse(null, error);
      }
    },

    delete: async (id: number): Promise<ApiResponse<{ message: string }>> => {
      try {
        try {
          const { data: sess } = await supabase.auth.getSession();
          const token = sess.session?.access_token;
          if (token) {
            const resp = await fetch(`/api/admin/contacts/${id}`, {
              method: 'DELETE',
              headers: { Authorization: `Bearer ${token}` }
            });
            const json = await resp.json();
            if (!resp.ok) return formatResponse(null, json);
            return json as ApiResponse<{ message: string }>;
          }
        } catch {}

        const { error } = await supabase.from('contact_messages').delete().eq('id', id);
        if (error) return formatResponse(null, error);
        return formatResponse({ message: 'Contact message deleted successfully' });
      } catch (error) {
        return formatResponse(null, error);
      }
    },
  };

  // Testimonials
  testimonials = {
    getAll: async (params?: {
      page?: number;
      limit?: number;
      activeOnly?: boolean;
    }): Promise<ApiResponse<Testimonial[]>> => {
      try {
        let query = supabase.from("testimonials").select("*");

        if (params?.activeOnly !== undefined) {
          query = query.eq("is_active", params.activeOnly);
        }

        if (params?.limit) {
          const offset = ((params?.page || 1) - 1) * params.limit;
          query = query.range(offset, offset + params.limit - 1);
        }

        const { data, error } = await query.order("created_at", {
          ascending: false,
        });
        return formatResponse(data, error);
      } catch (error) {
        return formatResponse(null, error);
      }
    },
  getFeatured: async (
      limit?: number,
    ): Promise<ApiResponse<Testimonial[]>> => {
      try {
        let query = supabase
          .from("testimonials")
          .select("*")
          .eq("is_active", true)
          .eq("is_featured", true)
          .order("created_at", { ascending: false });

        if (limit) {
          query = query.limit(limit);
        }

        const { data, error } = await query;
        return formatResponse(data, error);
      } catch (error) {
        return formatResponse(null, error);
      }
    },

    create: async (data: CreateTestimonial): Promise<ApiResponse<Testimonial>> => {
      try {
        try {
          const { data: sess } = await supabase.auth.getSession();
          const token = sess.session?.access_token;
          if (token) {
            const resp = await fetch('/api/admin/testimonials', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
              body: JSON.stringify(data)
            });
            const json = await resp.json();
            if (!resp.ok) return formatResponse(null, json);
            return json as ApiResponse<Testimonial>;
          }
        } catch {}

        const { data: respData, error } = await supabase.from('testimonials').insert([data]).select().single();
        return formatResponse(respData, error);
      } catch (error) {
        return formatResponse(null, error);
      }
    },

    update: async (id: number, payload: Partial<CreateTestimonial>): Promise<ApiResponse<Testimonial>> => {
      try {
        try {
          const { data: sess } = await supabase.auth.getSession();
          const token = sess.session?.access_token;
          if (token) {
            const resp = await fetch(`/api/admin/testimonials/${id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
              body: JSON.stringify(payload)
            });
            const json = await resp.json();
            if (!resp.ok) return formatResponse(null, json);
            return json as ApiResponse<Testimonial>;
          }
        } catch {}

        const { data, error } = await supabase.from('testimonials').update(payload).eq('id', id).select().single();
        return formatResponse(data, error);
      } catch (error) {
        return formatResponse(null, error);
      }
    },

    delete: async (id: number): Promise<ApiResponse<{ message: string }>> => {
      try {
        try {
          const { data: sess } = await supabase.auth.getSession();
          const token = sess.session?.access_token;
          if (token) {
            const resp = await fetch(`/api/admin/testimonials/${id}`, {
              method: 'DELETE',
              headers: { Authorization: `Bearer ${token}` }
            });
            const json = await resp.json();
            if (!resp.ok) return formatResponse(null, json);
            return json as ApiResponse<{ message: string }>;
          }
        } catch {}

        const { error } = await supabase.from('testimonials').delete().eq('id', id);
        if (error) return formatResponse(null, error);
        return formatResponse({ message: 'Testimonial deleted successfully' });
      } catch (error) {
        return formatResponse(null, error);
      }
    },
  };

  // Quotes
  quotes = {
    create: async (quoteData: CreateQuote): Promise<ApiResponse<Quote>> => {
      try {
            try {
              const { data: sess } = await supabase.auth.getSession();
              const token = sess.session?.access_token;
              if (token) {
                const resp = await fetch('/api/admin/quotes', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                  body: JSON.stringify(quoteData)
                });
                const json = await resp.json();
                if (!resp.ok) return formatResponse(null, json);
                return json as ApiResponse<Quote>;
              }
            } catch {}

            const { data, error } = await supabase
              .from("quotes")
              .insert([quoteData])
              .select()
              .single();

            return formatResponse(data, error);
      } catch (error) {
        return formatResponse(null, error);
      }
    },
    getById: async (id: number): Promise<ApiResponse<Quote>> => {
      try {
        const { data, error } = await supabase
          .from("quotes")
          .select("*")
          .eq("id", id)
          .single();

        return formatResponse(data, error);
      } catch (error) {
        return formatResponse(null, error);
      }
    },
      update: async (id: number, payload: Partial<Quote>): Promise<ApiResponse<Quote>> => {
        try {
          try {
            const { data: sess } = await supabase.auth.getSession();
            const token = sess.session?.access_token;
            if (token) {
              const resp = await fetch(`/api/admin/quotes/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(payload)
              });
              const json = await resp.json();
              if (!resp.ok) return formatResponse(null, json);
              return json as ApiResponse<Quote>;
            }
          } catch {}

          const { data, error } = await supabase.from('quotes').update(payload).eq('id', id).select().single();
          return formatResponse(data, error);
        } catch (error) {
          return formatResponse(null, error);
        }
      },

      delete: async (id: number): Promise<ApiResponse<{ message: string }>> => {
        try {
          try {
            const { data: sess } = await supabase.auth.getSession();
            const token = sess.session?.access_token;
            if (token) {
              const resp = await fetch(`/api/admin/quotes/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
              });
              const json = await resp.json();
              if (!resp.ok) return formatResponse(null, json);
              return json as ApiResponse<{ message: string }>;
            }
          } catch {}

          const { error } = await supabase.from('quotes').delete().eq('id', id);
          if (error) return formatResponse(null, error);
          return formatResponse({ message: 'Quote deleted successfully' });
        } catch (error) {
          return formatResponse(null, error);
        }
      },

    getAll: async (params?: {
      page?: number;
      limit?: number;
      status?: string;
      userId?: number;
    }): Promise<ApiResponse<Quote[]>> => {
      try {
        let query = supabase.from("quotes").select("*");

        if (params?.status) {
          query = query.eq("status", params.status);
        }

        if (params?.userId) {
          query = query.eq("user_id", params.userId);
        }

        if (params?.limit) {
          const offset = ((params?.page || 1) - 1) * params.limit;
          query = query.range(offset, offset + params.limit - 1);
        }

        const { data, error } = await query.order("created_at", {
          ascending: false,
        });
        return formatResponse(data, error);
      } catch (error) {
        return formatResponse(null, error);
      }
    },
  };

  // Blog
  blog = {
    getAll: async (params?: {
      page?: number;
      limit?: number;
      category?: string;
      status?: string;
    }): Promise<ApiResponse<BlogPost[]>> => {
      try {
        let query = supabase.from("blog_posts").select("*");

        if (params?.category) {
          query = query.eq("category", params.category);
        }

        if (params?.status) {
          query = query.eq("status", params.status);
        }

        if (params?.limit) {
          const offset = ((params?.page || 1) - 1) * params.limit;
          query = query.range(offset, offset + params.limit - 1);
        }

        const { data, error } = await query.order("created_at", {
          ascending: false,
        });
        return formatResponse(data, error);
      } catch (error) {
        return formatResponse(null, error);
      }
    },

    getBySlug: async (slug: string): Promise<ApiResponse<BlogPost>> => {
      try {
        const { data, error } = await supabase
          .from("blog_posts")
          .select("*")
          .eq("slug", slug)
          .eq("status", "published")
          .single();

        return formatResponse(data, error);
      } catch (error) {
        return formatResponse(null, error);
      }
    },
  };
}

export const api = new SupabaseApiClient();
