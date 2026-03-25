import express from "express";
import { supabaseAdmin } from "../supabaseAdmin.ts";
import type { BlogPost, ApiResponse } from "../../shared/index.ts";

const router = express.Router();

// GET /api/blog - List published blog posts with pagination and filtering
router.get("/", async (req: express.Request, res: express.Response) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      category, 
      search,
      featured
    } = req.query;

    const pageNum = parseInt(page as string) || 1;
    const limitNum = Math.min(parseInt(limit as string) || 10, 100);
    const offset = (pageNum - 1) * limitNum;

    let query = supabaseAdmin
      .from("blog_posts")
      .select("*", { count: "exact" })
      .eq("status", "published")
      .order("published_at", { ascending: false, nullsFirst: false });

    if (category && category !== "all") {
      query = query.eq("category", category);
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,excerpt.ilike.%${search}%,content.ilike.%${search}%`);
    }

    if (featured === "true") {
      // For featured posts, we need to check if they're in a featured list
      // For now, we can use a view count threshold or implement a featured flag
      // This is a workaround - in production, add an is_featured column
    }

    const { data, error, count } = await query.range(offset, offset + limitNum - 1);

    if (error) throw error;

    return res.json({
      success: true,
      data: data || [],
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: count || 0,
        pages: count ? Math.ceil(count / limitNum) : 0,
      },
    } satisfies ApiResponse<BlogPost[]>);
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to fetch blog posts",
    } satisfies ApiResponse);
  }
});

// GET /api/blog/post/:slug - Get single blog post by slug
router.get("/post/:slug", async (req: express.Request, res: express.Response) => {
  try {
    const { slug } = req.params;

    const { data: post, error: postError } = await supabaseAdmin
      .from("blog_posts")
      .select("*")
      .eq("slug", slug)
      .eq("status", "published")
      .maybeSingle();

    if (postError) throw postError;

    if (!post) {
      return res.status(404).json({
        success: false,
        error: "Blog post not found",
      } satisfies ApiResponse);
    }

    // Increment view count
    await supabaseAdmin
      .from("blog_posts")
      .update({ views: (post.views || 0) + 1 })
      .eq("id", post.id);

    return res.json({
      success: true,
      data: post,
    } satisfies ApiResponse<BlogPost>);
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to fetch blog post",
    } satisfies ApiResponse);
  }
});

// GET /api/blog/categories - Get all active categories
router.get("/categories", async (req: express.Request, res: express.Response) => {
  try {
    const { data, error } = await supabaseAdmin
      .from("blog_categories")
      .select("*")
      .eq("is_active", true)
      .order("name", { ascending: true });

    if (error) throw error;

    return res.json({
      success: true,
      data: data || [],
    } satisfies ApiResponse);
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to fetch categories",
    } satisfies ApiResponse);
  }
});

// GET /api/blog/post/:postId/comments - Get approved comments for a post
router.get("/post/:postId/comments", async (req: express.Request, res: express.Response) => {
  try {
    const { postId } = req.params;

    const { data, error } = await supabaseAdmin
      .from("blog_comments")
      .select("*")
      .eq("post_id", postId)
      .eq("is_approved", true)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return res.json({
      success: true,
      data: data || [],
    } satisfies ApiResponse);
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to fetch comments",
    } satisfies ApiResponse);
  }
});

// POST /api/blog/post/:postId/comments - Create a new comment (public endpoint)
router.post("/post/:postId/comments", async (req: express.Request, res: express.Response) => {
  try {
    const { postId } = req.params;
    const { author_name, author_email, content, user_id } = req.body;

    if (!author_name || !author_email || !content) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: author_name, author_email, content",
      } satisfies ApiResponse);
    }

    // Verify post exists
    const { data: post, error: postError } = await supabaseAdmin
      .from("blog_posts")
      .select("id")
      .eq("id", postId)
      .maybeSingle();

    if (postError) throw postError;
    if (!post) {
      return res.status(404).json({
        success: false,
        error: "Blog post not found",
      } satisfies ApiResponse);
    }

    // Create comment (needs moderation by default)
    const { data: comment, error: createError } = await supabaseAdmin
      .from("blog_comments")
      .insert([
        {
          post_id: postId,
          author_name,
          author_email,
          content,
          user_id: user_id || null,
          is_approved: false, // Comments need admin approval
        },
      ])
      .select()
      .maybeSingle();

    if (createError) throw createError;

    return res.status(201).json({
      success: true,
      data: comment,
    } satisfies ApiResponse);
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to create comment",
    } satisfies ApiResponse);
  }
});

// GET /api/blog/all - Get all blog posts (admin use via client-side Supabase)
// Note: This is kept for backward compatibility but should use admin routes instead

export default router;
