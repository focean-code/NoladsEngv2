import { supabase } from "./supabase";
import type { ApiResponse } from "../types/api";
import type { SupabaseApiClient } from "../types/supabase";
import type { ContactMessage } from "@shared/api";

// Helper function to format Supabase responses as ApiResponse
function isNetworkError(err: any): boolean {
  try {
    const msg =
      typeof err === "string"
        ? err
        : err?.message || err?.error_description || "";
    return /Failed to fetch|NetworkError|TypeError|Edge Function/i.test(
      String(msg),
    );
  } catch {
    return false;
  }
}
function isAuthSessionMissing(err: any): boolean {
  try {
    const msg =
      typeof err === "string"
        ? err
        : err?.message || err?.error_description || "";
    return /Auth session missing/i.test(String(msg));
  } catch {
    return false;
  }
}
function formatResponse<T>(
  data: T | null,
  error: any = null,
  endpoint?: string,
): ApiResponse<T> {
  const errMsg = error
    ? typeof error === "string"
      ? error
      : error?.message || error?.error_description || error?.hint || null
    : null;

  // Debug logging (downgrade network noise to warn)
  if (errMsg) {
    if (isNetworkError(error)) {
      console.warn(
        `[Supabase API Warning] ${endpoint || "unknown endpoint"}: ${errMsg}`,
      );
    } else {
      console.error(
        `[Supabase API Error] ${endpoint || "unknown endpoint"}: ${errMsg}`,
      );
    }
  } else {
    // console.log(`[Supabase API] ${endpoint || "unknown endpoint"}: ok`); // Disabled - logs too much
  }

  if (error) {
    return {
      success: false,
      error: errMsg || "An error occurred",
      details: error,
    };
  }

  return {
    success: true,
    data: data as T,
  };
}

// Create the API client
// Helper to call server-side admin APIs with Bearer token
async function getBearerToken(): Promise<string | undefined> {
  try {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token || undefined;
  } catch {
    return undefined;
  }
}
const buildAdminApiUrl = (path: string) => {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  // In the browser we always want same-origin requests.
  // This prevents CORS/preflight failures when `VITE_API_BASE` is misconfigured.
  if (typeof window !== "undefined") {
    return normalizedPath;
  }

  // Priority 1: Check for explicit API base URL
  const configuredBase = import.meta.env.VITE_API_BASE?.trim();
  if (configuredBase && configuredBase.startsWith("http")) {
    // In production, prefer same-origin API to avoid CORS/preflight issues.
    // If someone accidentally sets VITE_API_BASE to a different origin, ignore it in the browser.
    try {
      if (import.meta.env.PROD && typeof window !== "undefined") {
        const baseOrigin = new URL(configuredBase).origin;
        if (baseOrigin !== window.location.origin) {
          return normalizedPath;
        }
      }
    } catch {
      // If configuredBase isn't a valid URL, fall back to relative.
      return normalizedPath;
    }
    return new URL(normalizedPath, configuredBase).toString();
  }

  // Priority 2: Check for proxy URL (non-browser environments)
  const proxyUrl = import.meta.env.VITE_API_PROXY_URL?.trim();
  if (proxyUrl) {
    return new URL(normalizedPath, proxyUrl).toString();
  }

  // Priority 3: Fall back to relative URLs (same origin)
  return normalizedPath;
};
async function adminFetch<T>(
  path: string,
  init: RequestInit,
): Promise<ApiResponse<T>> {
  try {
    const token = await getBearerToken();
    // console.log("[adminFetch] Token status:", { // Disabled - logs too much
    //   hasToken: !!token,
    //   tokenLength: token?.length || 0,
    //   tokenPreview: token ? `${token.substring(0, 20)}...` : "None",
    // });

    const url = buildAdminApiUrl(path);

    // Log request details (disabled - logs too much)
    // console.log("[adminFetch] Request:", {
    //   url,
    //   method: init.method,
    //   headers: {
    //     ...init.headers,
    //     Authorization: token ? "Bearer present" : "Missing",
    //   },
    //   body: init.body ? JSON.parse(init.body as string) : undefined,
    // });

    let res: Response;
    try {
      res = await fetch(url, {
        ...init,
        headers: {
          "Content-Type": "application/json",
          ...(init.headers || {}),
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
    } catch (fetchError) {
      // Network error or fetch failure
      const errorMsg =
        fetchError instanceof Error ? fetchError.message : String(fetchError);
      console.error("[adminFetch] Fetch failed:", {
        url,
        method: init.method,
        error: errorMsg,
        errorType:
          fetchError instanceof Error
            ? fetchError.constructor.name
            : typeof fetchError,
        stack: fetchError instanceof Error ? fetchError.stack : undefined,
      });
      return formatResponse<T>(
        null as any,
        {
          message: `Network error: ${errorMsg}. Please check your connection and try again.`,
          originalError: errorMsg,
        },
        path,
      );
    }

    // Log response details (disabled - logs too much)
    // console.log("[adminFetch] Response:", {
    //   status: res.status,
    //   statusText: res.statusText,
    //   headers: Object.fromEntries(res.headers.entries()),
    // });

    // Read body ONCE safely
    let text = "";
    try {
      text = await res.text();
      // console.log("[adminFetch] Response body:", text); // Disabled - logs too much
    } catch (e) {
      console.error("[adminFetch] Error reading response body:", e);
    }

    if (!text) {
      // No body (e.g., 204) – treat 2xx as success, otherwise error
      if (res.ok) return { success: true } as ApiResponse<T>;
      return { success: false, error: `HTTP ${res.status}` } as ApiResponse<T>;
    }

    try {
      const json = JSON.parse(text);
      return json as ApiResponse<T>;
    } catch {
      // Fallback: non-JSON response
      if (res.ok) return { success: true } as ApiResponse<T>;
      return { success: false, error: text } as ApiResponse<T>;
    }
  } catch (error) {
    return formatResponse<T>(null as any, error, path);
  }
}

export const api: SupabaseApiClient = {
  auth: {
    login: async (email: string, password: string) => {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        return formatResponse(
          {
            user: data.user,
            session: data.session,
          },
          error,
        );
      } catch (error) {
        return formatResponse(null, error);
      }
    },
    logout: async () => {
      try {
        const { error } = await supabase.auth.signOut();
        return formatResponse({ message: "Logged out successfully" }, error);
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
        if (error && (isAuthSessionMissing(error) || isNetworkError(error))) {
          console.warn(
            "[auth.getCurrentUser] treating missing session/network as unauthenticated",
          );
          return formatResponse(null, null, "auth.getCurrentUser");
        }
        return formatResponse(user, error, "auth.getCurrentUser");
      } catch (error) {
        if (isNetworkError(error)) {
          console.warn(
            "[auth.getCurrentUser] network error, treating as unauthenticated",
          );
          return formatResponse(null, null, "auth.getCurrentUser");
        }
        return formatResponse(null, error);
      }
    },
    signup: async (email: string, password: string, metadata?: any) => {
      try {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: metadata },
        });
        return formatResponse(
          {
            user: data.user,
            session: data.session,
          },
          error,
        );
      } catch (error) {
        return formatResponse(null, error);
      }
    },
    verify: async () => {
      try {
        const { data, error } = await supabase.auth.getUser();
        if (error && (isAuthSessionMissing(error) || isNetworkError(error))) {
          console.warn(
            "[auth.verify] treating missing session/network as unauthenticated",
          );
          return formatResponse(null, null, "auth.verify");
        }
        return formatResponse(data, error, "auth.verify");
      } catch (error) {
        if (isNetworkError(error)) {
          console.warn(
            "[auth.verify] network error, treating as unauthenticated",
          );
          return formatResponse(null, null, "auth.verify");
        }
        return formatResponse(null, error);
      }
    },
  },
  users: {
    getAll: async (params?: { page?: number; limit?: number }) => {
      try {
        let query = supabase.from("users").select("*");

        if (params?.limit) {
          const offset = ((params?.page || 1) - 1) * params.limit;
          query = query.range(offset, offset + params.limit - 1);
        }

        const { data, error } = await query;
        if (error && (error as any).code === "PGRST116") {
          console.warn("[users.getAll] Table missing, returning empty list");
          return formatResponse([] as any, null, "users.getAll");
        }
        if (error && isNetworkError(error)) {
          console.warn("[users.getAll] Network error, returning empty list");
          return formatResponse([] as any, null, "users.getAll");
        }
        return formatResponse(data, error, "users.getAll");
      } catch (error) {
        return formatResponse(null, error, "users.getAll");
      }
    },
  },
  images: {
    upload: async (
      file: File,
      entityType: string,
      entityId: number,
      altText?: string,
    ) => {
      try {
        // Sanitize file name to avoid errors with spaces or special characters
        const sanitizedName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
        const fileName = `${Date.now()}-${sanitizedName}`;
        const { data, error } = await supabase.storage
          .from("images")
          .upload(`${entityType}/${entityId}/${fileName}`, file, {
            cacheControl: '3600',
            upsert: true
          });

        if (error) throw error;

        const {
          data: { publicUrl },
        } = supabase.storage
          .from("images")
          .getPublicUrl(`${entityType}/${entityId}/${fileName}`);

        return formatResponse(publicUrl);
      } catch (error) {
        return formatResponse(null, error);
      }
    },
    uploadMultiple: async (
      files: File[],
      entityType: string,
      entityId: number,
      altTexts?: string[],
    ) => {
      try {
        const uploads = files.map((file) =>
          api.images.upload(file, entityType, entityId),
        );
        const results = await Promise.all(uploads);
        const urls = results
          .map((result) => result.data)
          .filter(Boolean) as string[];
        return formatResponse(urls);
      } catch (error) {
        return formatResponse(null, error);
      }
    },
  },
  blog: {
    getAll: async (params?: {
      page?: number;
      limit?: number;
      category?: string;
      search?: string;
      featured?: boolean;
    }) => {
      try {
        let query = supabase
          .from("blog_posts")
          .select("*")
          .eq("status", "published")
          .order("created_at", { ascending: false });

        if (params?.category) query = query.eq("category", params.category);
        if (params?.featured !== undefined) query = query.eq("featured", params.featured);
        if (params?.search) query = query.ilike("title", `%${params.search}%`);
        if (params?.limit) {
          const offset = ((params.page || 1) - 1) * params.limit;
          query = query.range(offset, offset + params.limit - 1);
        }

        const { data, error } = await query;
        // console.log("[Supabase API] blog.getAll:", error ? "error" : "ok"); // Disabled - logs too much
        return formatResponse(data || [], error, "blog.getAll");
      } catch (error) {
        console.warn("[blog.getAll] Network error, returning empty list");
        return formatResponse([] as any, error, "blog.getAll");
      }
    },
    getBySlug: async (slug: string) => {
      try {
        const { data, error } = await supabase
          .from("blog_posts")
          .select("*")
          .eq("slug", slug)
          .eq("status", "published")
          .single();
        console.log("[Supabase API] blog.getBySlug:", error ? "error" : "ok");
        return formatResponse(data, error, "blog.getBySlug");
      } catch (error) {
        return formatResponse(null, error, "blog.getBySlug");
      }
    },
    listAll: async (params?: { page?: number; limit?: number }) => {
      try {
        const qs = new URLSearchParams();
        if (params?.page) qs.set("page", String(params.page));
        if (params?.limit) qs.set("limit", String(params.limit));

        const url = qs.toString()
          ? `/api/admin/blog?${qs.toString()}`
          : "/api/admin/blog";

        return await adminFetch(url, {
          method: "GET",
        });
      } catch (error) {
        return formatResponse(null, error, "blog.listAll");
      }
    },
    create: async (data) => {
      try {
        return await adminFetch("/api/admin/blog", {
          method: "POST",
          body: JSON.stringify(data),
        });
      } catch (error) {
        return formatResponse(null, error, "blog.create");
      }
    },
    update: async (id, data) => {
      try {
        const firstAttempt = await adminFetch(`/api/admin/blog/${id}`, {
          method: "PUT",
          body: JSON.stringify(data),
        });

        // If the server/proxy doesn't allow PUT, fall back to other common update methods.
        if (!firstAttempt.success && firstAttempt.error === "HTTP 405") {
          const patchAttempt = await adminFetch(`/api/admin/blog/${id}`, {
            method: "PATCH",
            body: JSON.stringify(data),
          });
          if (!patchAttempt.success && patchAttempt.error === "HTTP 405") {
            return await adminFetch(`/api/admin/blog/${id}`, {
              method: "POST",
              body: JSON.stringify(data),
            });
          }
          return patchAttempt;
        }

        return firstAttempt;
      } catch (error) {
        return formatResponse(null, error, "blog.update");
      }
    },
    delete: async (id) => {
      try {
        return await adminFetch(`/api/admin/blog/${id}`, {
          method: "DELETE",
        });
      } catch (error) {
        return formatResponse(null, error, "blog.delete");
      }
    },
    getComments: async (postId: number) => {
      try {
        const { data, error } = await supabase
          .from("blog_comments")
          .select("*")
          .eq("post_id", postId)
          .eq("approved", true)
          .order("created_at", { ascending: true });
        console.log("[Supabase API] blog.getComments:", error ? "error" : "ok");
        return formatResponse(data || [], error, "blog.getComments");
      } catch (error) {
        console.warn("[blog.getComments] Network error, returning empty list");
        return formatResponse([] as any, error, "blog.getComments");
      }
    },
    createComment: async (data) => {
      try {
        if (!data.post_id) {
          return formatResponse(null, { message: "post_id is required" }, "blog.createComment");
        }
        const { data: created, error } = await supabase
          .from("blog_comments")
          .insert({ ...data, approved: false })
          .select()
          .single();
        return formatResponse(created, error, "blog.createComment");
      } catch (error) {
        return formatResponse(null, error, "blog.createComment");
      }
    },
    approveComment: async (commentId: number) => {
      try {
        return await adminFetch(`/api/admin/blog/comments/${commentId}/approve`, {
          method: "POST",
        });
      } catch (error) {
        return formatResponse(null, error, "blog.approveComment");
      }
    },
    deleteComment: async (commentId: number) => {
      try {
        return await adminFetch(`/api/admin/blog/comments/${commentId}`, {
          method: "DELETE",
        });
      } catch (error) {
        return formatResponse(null, error, "blog.deleteComment");
      }
    },
    getCategories: async () => {
      try {
        const { data, error } = await supabase
          .from("blog_categories")
          .select("*")
          .order("name", { ascending: true });
        console.log("[Supabase API] blog.getCategories:", error ? "error" : "ok");
        return formatResponse(data || [], error, "blog.getCategories");
      } catch (error) {
        console.warn("[blog.getCategories] Network error, returning empty list");
        return formatResponse([] as any, error, "blog.getCategories");
      }
    },
    createCategory: async (data) => {
      try {
        return await adminFetch("/api/admin/blog/categories", {
          method: "POST",
          body: JSON.stringify(data),
        });
      } catch (error) {
        return formatResponse(null, error, "blog.createCategory");
      }
    },
    updateCategory: async (id: number, data) => {
      try {
        const firstAttempt = await adminFetch(`/api/admin/blog/categories/${id}`, {
          method: "PUT",
          body: JSON.stringify(data),
        });

        if (!firstAttempt.success && firstAttempt.error === "HTTP 405") {
          const patchAttempt = await adminFetch(`/api/admin/blog/categories/${id}`, {
            method: "PATCH",
            body: JSON.stringify(data),
          });
          if (!patchAttempt.success && patchAttempt.error === "HTTP 405") {
            return await adminFetch(`/api/admin/blog/categories/${id}`, {
              method: "POST",
              body: JSON.stringify(data),
            });
          }
          return patchAttempt;
        }

        return firstAttempt;
      } catch (error) {
        return formatResponse(null, error, "blog.updateCategory");
      }
    },
    deleteCategory: async (id: number) => {
      try {
        return await adminFetch(`/api/admin/blog/categories/${id}`, {
          method: "DELETE",
        });
      } catch (error) {
        return formatResponse(null, error, "blog.deleteCategory");
      }
    },
  },
  products: {
    getAll: async (params?: {
      page?: number;
      limit?: number;
      search?: string;
      category?: string;
      active?: boolean;
    }) => {
      try {
        // console.log("[Products API] getAll called with params:", params); // Disabled - logs too much

        let query = supabase.from("products").select("*");

        if (params?.active !== undefined)
          query = query.eq("is_active", params.active);
        if (params?.category) query = query.eq("category", params.category);
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
        if (error && (error as any).code === "PGRST116") {
          console.warn("[products.getAll] Table missing, returning empty list");
          return formatResponse([] as any, null, "products.getAll");
        }
        if (error && isNetworkError(error)) {
          console.warn("[products.getAll] Network error, returning empty list");
          return formatResponse([] as any, null, "products.getAll");
        }
        return formatResponse(data, error, "products.getAll");
      } catch (error) {
        console.error("[Products API] Error in getAll:", error);
        return formatResponse(null, error, "products.getAll");
      }
    },
    getFeatured: async (limit?: number) => {
      try {
        let query = supabase
          .from("products")
          .select("*")
          .eq("is_active", true)
          .order("created_at", { ascending: false });

        if (limit) query = query.limit(limit);

        const { data, error } = await query;
        if (error && isNetworkError(error)) {
          console.warn(
            "[products.getFeatured] Network error, using empty list",
          );
          return formatResponse([] as any, null, "products.getFeatured");
        }
        return formatResponse(data, error, "products.getFeatured");
      } catch (error) {
        if (isNetworkError(error)) {
          console.warn(
            "[products.getFeatured] Network exception, using empty list",
          );
          return formatResponse([] as any, null, "products.getFeatured");
        }
        return formatResponse(null, error, "products.getFeatured");
      }
    },
    getById: async (id: number) => {
      try {
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .eq("id", id)
          .maybeSingle();
        return formatResponse(data, error);
      } catch (error) {
        return formatResponse(null, error);
      }
    },
    create: async (data) => {
      try {
        return await adminFetch("/api/admin/products", {
          method: "POST",
          body: JSON.stringify(data),
        });
      } catch (error) {
        return formatResponse(null, error, "products.create");
      }
    },
    update: async (id, data) => {
      try {
        return await adminFetch(`/api/admin/products/${id}`, {
          method: "PUT",
          body: JSON.stringify(data),
        });
      } catch (error) {
        return formatResponse(null, error, "products.update");
      }
    },
    delete: async (id) => {
      try {
        return await adminFetch(`/api/admin/products/${id}`, {
          method: "DELETE",
        });
      } catch (error) {
        return formatResponse(null, error, "products.delete");
      }
    },
    subscribeToStock: async (productId: number, email: string) => {
      try {
        const { data, error } = await supabase
          .from("stock_alerts")
          .insert([{ product_id: productId, email }])
          .select()
          .maybeSingle();
        return formatResponse(data, error);
      } catch (error) {
        return formatResponse(null, error);
      }
    },
  },
  testimonials: {
    getAll: async (params?: {
      page?: number;
      limit?: number;
      activeOnly?: boolean;
    }) => {
      try {
        let query = supabase.from("testimonials").select("*");

        if (params?.activeOnly !== undefined)
          query = query.eq("is_active", params.activeOnly);
        if (params?.limit) {
          const offset = ((params?.page || 1) - 1) * params.limit;
          query = query.range(offset, offset + params.limit - 1);
        }

        const { data, error } = await query.order("created_at", {
          ascending: false,
        });
        if (error && (error as any).code === "PGRST116") {
          console.warn(
            "[testimonials.getAll] Table missing, returning empty list",
          );
          return formatResponse([] as any, null, "testimonials.getAll");
        }
        if (error && isNetworkError(error)) {
          console.warn(
            "[testimonials.getAll] Network error, returning empty list",
          );
          return formatResponse([] as any, null, "testimonials.getAll");
        }
        return formatResponse(data, error, "testimonials.getAll");
      } catch (error) {
        return formatResponse(null, error, "testimonials.getAll");
      }
    },
    getFeatured: async (limit?: number) => {
      try {
        let query = supabase
          .from("testimonials")
          .select("*")
          .eq("is_active", true)
          .eq("is_featured", true)
          .order("created_at", { ascending: false });

        if (limit) query = query.limit(limit);

        const { data, error } = await query;
        if (error && isNetworkError(error)) {
          console.warn(
            "[testimonials.getFeatured] Network error, using empty list",
          );
          return formatResponse([] as any, null, "testimonials.getFeatured");
        }
        return formatResponse(data, error, "testimonials.getFeatured");
      } catch (error) {
        if (isNetworkError(error)) {
          console.warn(
            "[testimonials.getFeatured] Network exception, using empty list",
          );
          return formatResponse([] as any, null, "testimonials.getFeatured");
        }
        return formatResponse(null, error, "testimonials.getFeatured");
      }
    },
    getById: async (id: number) => {
      try {
        const { data, error } = await supabase
          .from("testimonials")
          .select("*")
          .eq("id", id)
          .maybeSingle();
        return formatResponse(data, error, "testimonials.getById");
      } catch (error) {
        return formatResponse(null, error, "testimonials.getById");
      }
    },
    create: async (data) => {
      try {
        return await adminFetch("/api/admin/testimonials", {
          method: "POST",
          body: JSON.stringify(data),
        });
      } catch (error) {
        return formatResponse(null, error, "testimonials.create");
      }
    },
    update: async (id, data) => {
      try {
        return await adminFetch(`/api/admin/testimonials/${id}`, {
          method: "PUT",
          body: JSON.stringify(data),
        });
      } catch (error) {
        return formatResponse(null, error, "testimonials.update");
      }
    },
    delete: async (id) => {
      try {
        return await adminFetch(`/api/admin/testimonials/${id}`, {
          method: "DELETE",
        });
      } catch (error) {
        return formatResponse(null, error, "testimonials.delete");
      }
    },
  },
  services: {
    getAll: async (params?: {
      page?: number;
      limit?: number;
      active?: boolean;
      category?: string;
    }) => {
      try {
        // console.log("[Services API] getAll called with params:", params); // Disabled - logs too much

        let query = supabase.from("services").select("*");

        if (params?.active !== undefined)
          query = query.eq("is_active", params.active);
        if (params?.category) query = query.eq("category", params.category);
        if (params?.limit) {
          const offset = ((params?.page || 1) - 1) * params.limit;
          query = query.range(offset, offset + params.limit - 1);
        }

        const { data, error } = await query.order("created_at", {
          ascending: false,
        });
        if (error && (error as any).code === "PGRST116") {
          console.warn("[services.getAll] Table missing, returning empty list");
          return formatResponse([] as any, null, "services.getAll");
        }
        if (error && isNetworkError(error)) {
          console.warn("[services.getAll] Network error, returning empty list");
          return formatResponse([] as any, null, "services.getAll");
        }
        return formatResponse(data, error, "services.getAll");
      } catch (error) {
        console.error("[Services API] Error in getAll:", error);
        return formatResponse(null, error, "services.getAll");
      }
    },
    getFeatured: async (limit?: number) => {
      try {
        let query = supabase
          .from("services")
          .select("*")
          .eq("is_active", true)
          .order("created_at", { ascending: false });

        if (limit) query = query.limit(limit);

        const { data, error } = await query;
        if (error && isNetworkError(error)) {
          console.warn(
            "[services.getFeatured] Network error, using empty list",
          );
          return formatResponse([] as any, null, "services.getFeatured");
        }
        return formatResponse(data, error, "services.getFeatured");
      } catch (error) {
        if (isNetworkError(error)) {
          console.warn(
            "[services.getFeatured] Network exception, using empty list",
          );
          return formatResponse([] as any, null, "services.getFeatured");
        }
        return formatResponse(null, error, "services.getFeatured");
      }
    },
    getById: async (id: number) => {
      try {
        const { data, error } = await supabase
          .from("services")
          .select("*")
          .eq("id", id)
          .maybeSingle();
        return formatResponse(data, error, "services.getById");
      } catch (error) {
        return formatResponse(null, error, "services.getById");
      }
    },
    create: async (data) => {
      try {
        return await adminFetch("/api/admin/services", {
          method: "POST",
          body: JSON.stringify(data),
        });
      } catch (error) {
        return formatResponse(null, error, "services.create");
      }
    },
    update: async (id, data) => {
      try {
        console.log("[API] Updating service:", { id, data });

        // Get current auth token
        const token = await getBearerToken();
        if (!token) {
          console.error("[API] No auth token available for service update");
          return formatResponse(
            null,
            "No authentication token available",
            "services.update",
          );
        }

        // Log request details
        const url = `${window.location.origin}/api/admin/services/${id}`;
        console.log("[API] Making request to:", url, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? "Present" : "Missing",
          },
          data,
        });

        const response = await adminFetch(`/api/admin/services/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });

        console.log("[API] Update response:", response);

        // If we got a 404, check if the service exists first
        if (!response.success && response.error === "HTTP 404") {
          const checkResult = await supabase
            .from("services")
            .select("id")
            .eq("id", id)
            .maybeSingle();

          if (checkResult.error) {
            console.error(
              "[API] Error checking service existence:",
              checkResult.error,
            );
          } else if (!checkResult.data) {
            console.error("[API] Service does not exist in database:", id);
          } else {
            console.error("[API] Service exists but endpoint returned 404:", {
              id,
              serviceData: checkResult.data,
            });
          }
        }

        return response;
      } catch (error) {
        console.error("[API] Update error:", error);
        return formatResponse(null, error, "services.update");
      }
    },
    delete: async (id) => {
      try {
        return await adminFetch(`/api/admin/services/${id}`, {
          method: "DELETE",
        });
      } catch (error) {
        return formatResponse(null, error, "services.delete");
      }
    },
  },
  company: {
    getStats: async () => {
      try {
        // Get counts from different tables
        const [
          { count: productsCount },
          { count: servicesCount },
          { count: quotesCount },
          { count: testimonialsCount },
        ] = await Promise.all([
          supabase.from("products").select("*", { count: "exact", head: true }),
          supabase.from("services").select("*", { count: "exact", head: true }),
          supabase.from("quotes").select("*", { count: "exact", head: true }),
          supabase
            .from("testimonials")
            .select("*", { count: "exact", head: true }),
        ]);

        const stats = {
          totalProducts: productsCount || 0,
          totalServices: servicesCount || 0,
          totalQuotes: quotesCount || 0,
          totalTestimonials: testimonialsCount || 0,
          yearsInBusiness: new Date().getFullYear() - 2010,
          satisfactionRate: 98,
          projectsCompleted: 500,
        };

        return formatResponse(stats, null, "company.getStats");
      } catch (error) {
        console.error("[Company API] Error in getStats:", error);
        return formatResponse(null, error, "company.getStats");
      }
    },
  },
  contact: {
    create: async (data: Partial<ContactMessage>) => {
      try {
        console.log("[contact.create] submitting:", data);
        // Use server route (service role) to avoid RLS and also send email
        const res = await fetch("/api/contact/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        const text = await res.text();
        let json: any = null;
        try {
          json = text ? JSON.parse(text) : null;
        } catch { }
        console.log("[contact.create] response:", {
          status: res.status,
          ok: res.ok,
          body: text,
        });
        if (!res.ok || !json?.success) {
          // Fallback: try email-only route so user still gets confirmation
          try {
            await fetch("/api/contact/send", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                name: data.name,
                email: data.email,
                phone: (data as any)?.phone,
                subject: (data as any)?.subject,
                message: (data as any)?.message,
              }),
            });
          } catch { }
          throw new Error(
            (json && (json.error || json.message)) || `HTTP ${res.status}`,
          );
        }
        return formatResponse(json.data || null, null, "contact.create");
      } catch (error) {
        return formatResponse(null, error, "contact.create");
      }
    },
    getAll: async (params?: {
      page?: number;
      limit?: number;
      status?: string;
    }) => {
      try {
        let query = supabase.from("contact_messages").select("*");

        if (params?.status) query = query.eq("status", params.status);
        if (params?.limit) {
          const offset = ((params?.page || 1) - 1) * params.limit;
          query = query.range(offset, offset + params.limit - 1);
        }

        const { data, error } = await query.order("created_at", {
          ascending: false,
        });
        if (error && (error as any).code === "PGRST116") {
          console.warn("[contact.getAll] Table missing, returning empty list");
          return formatResponse([] as any, null, "contact.getAll");
        }
        if (error && isNetworkError(error)) {
          console.warn("[contact.getAll] Network error, returning empty list");
          return formatResponse([] as any, null, "contact.getAll");
        }
        return formatResponse(data, error, "contact.getAll");
      } catch (error) {
        return formatResponse(null, error, "contact.getAll");
      }
    },
    update: async (id: number, data: Partial<ContactMessage>) => {
      try {
        return await adminFetch(`/api/admin/contacts/${id}`, {
          method: "PUT",
          body: JSON.stringify(data),
        });
      } catch (error) {
        return formatResponse(null, error, "contact.update");
      }
    },
    delete: async (id: number) => {
      try {
        return await adminFetch(`/api/admin/contacts/${id}`, {
          method: "DELETE",
        });
      } catch (error) {
        return formatResponse(null, error, "contact.delete");
      }
    },
  },
  analytics: {
    getGoogleAnalytics: async () => {
      // GA4 removed; PostHog is used for analytics now.
      // Keep the method for compatibility but never call GA4 endpoints.
      return formatResponse(
        {
          pageViews: 0,
          sessions: 0,
          users: 0,
          newUsers: 0,
          bounceRate: 0,
          avgSessionDuration: 0,
          pagesPerSession: 0,
          topPages: [],
          trafficSources: [],
          deviceBreakdown: [],
          lastUpdated: new Date().toISOString(),
        } as any,
        null,
        "analytics.getGoogleAnalytics",
      );
    },
    getRealTimeData: async () => {
      return formatResponse(
        {
          activeUsers: 0,
          pageViews: 0,
          currentPages: [],
          deviceBreakdown: [],
          countries: [],
        } as any,
        null,
        "analytics.getRealTimeData",
      );
    },
    getConversionData: async () => {
      return formatResponse(
        {
          totalConversions: 0,
          conversionRate: 0,
          revenue: 0,
          goalCompletions: [],
          lastUpdated: new Date().toISOString(),
        } as any,
        null,
        "analytics.getConversionData",
      );
    },
    refresh: async () => {
      const [analyticsRes, realTimeRes, conversionRes] = await Promise.all([
        api.analytics.getGoogleAnalytics(),
        api.analytics.getRealTimeData(),
        api.analytics.getConversionData(),
      ]);

      return formatResponse({
        analytics: analyticsRes.data,
        realTime: realTimeRes.data,
        conversions: conversionRes.data,
      });
    },
  },
  quotes: {
    getAll: async (params?: {
      page?: number;
      limit?: number;
      status?: string;
    }) => {
      try {
        let query = supabase.from("quotes").select("*");

        if (params?.status) query = query.eq("status", params.status);
        if (params?.limit) {
          const offset = ((params?.page || 1) - 1) * params.limit;
          query = query.range(offset, offset + params.limit - 1);
        }

        const { data, error } = await query.order("created_at", {
          ascending: false,
        });
        if (error && (error as any).code === "PGRST116") {
          console.warn("[quotes.getAll] Table missing, returning empty list");
          return formatResponse([] as any, null, "quotes.getAll");
        }
        if (error && isNetworkError(error)) {
          console.warn("[quotes.getAll] Network error, returning empty list");
          return formatResponse([] as any, null, "quotes.getAll");
        }
        return formatResponse(data, error, "quotes.getAll");
      } catch (error) {
        return formatResponse(null, error, "quotes.getAll");
      }
    },
    getById: async (id: number) => {
      try {
        const { data, error } = await supabase
          .from("quotes")
          .select("*")
          .eq("id", id)
          .maybeSingle();
        return formatResponse(data, error, "quotes.getById");
      } catch (error) {
        return formatResponse(null, error, "quotes.getById");
      }
    },
    create: async (data) => {
      try {
        const { data: quote, error } = await supabase
          .from("quotes")
          .insert([data])
          .select()
          .maybeSingle();
        // Fire and forget email notification
        try {
          fetch("/api/quotes/send", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
          }).catch(() => { });
        } catch { }
        return formatResponse(quote, error, "quotes.create");
      } catch (error) {
        return formatResponse(null, error, "quotes.create");
      }
    },
    update: async (id, data) => {
      try {
        return await adminFetch(`/api/admin/quotes/${id}`, {
          method: "PUT",
          body: JSON.stringify(data),
        });
      } catch (error) {
        return formatResponse(null, error, "quotes.update");
      }
    },
    delete: async (id) => {
      try {
        return await adminFetch(`/api/admin/quotes/${id}`, {
          method: "DELETE",
        });
      } catch (error) {
        return formatResponse(null, error, "quotes.delete");
      }
    },
  },
};
