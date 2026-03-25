import express from "express";
import { supabaseAdmin } from "../supabaseAdmin.ts";
import type { BlogPost, ApiResponse } from "../../shared/index.ts";
import {
  authenticateAdmin,
  validateRequestBody,
  requestLogger,
} from "../middleware/admin.ts";

const router = express.Router();

// Add logging middleware
router.use(requestLogger);

// GET /api/admin/blog - List all blog posts
const getAllPosts = async (req: express.Request, res: express.Response) => {
  const { category, status, search, page, limit } = req.query;

  try {
    let query = supabaseAdmin.from("blog_posts").select("*");

    if (category) {
      query = query.eq("category", category);
    }

    if (status) {
      query = query.eq("status", status);
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,excerpt.ilike.%${search}%`);
    }

    const pageNum = Math.max(1, parseInt(String(page || "1"), 10));
    const limitNum = Math.max(1, Math.min(100, parseInt(String(limit || "20"), 10)));
    const from = (pageNum - 1) * limitNum;
    const to = from + limitNum - 1;

    const { data, error } = await query.order("published_at", {
      ascending: false,
      nullsFirst: false
    })
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) throw error;

    return res.json({
      success: true,
      data: data || [],
    } satisfies ApiResponse<BlogPost[]>);
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      error: error.message || "Failed to fetch blog posts",
    } satisfies ApiResponse);
  }
};

// GET /api/admin/blog/:id - Get single post
const getById = async (req: express.Request, res: express.Response) => {
  const { id } = req.params;

  try {
    const { data, error } = await supabaseAdmin
      .from("blog_posts")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({
        success: false,
        error: "Blog post not found",
      } satisfies ApiResponse);
    }

    return res.json({
      success: true,
      data,
    } satisfies ApiResponse<BlogPost>);
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to fetch blog post",
    } satisfies ApiResponse);
  }
};

// POST /api/admin/blog - Create new blog post
const createPost = async (req: express.Request, res: express.Response) => {
  try {
    const { data, error } = await supabaseAdmin
      .from("blog_posts")
      .insert([req.body])
      .select()
      .maybeSingle();

    if (error) throw error;

    return res.status(201).json({
      success: true,
      data,
    } satisfies ApiResponse<BlogPost>);
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to create blog post",
    } satisfies ApiResponse);
  }
};

// PUT /api/admin/blog/:id - Update blog post
const updatePost = async (req: express.Request, res: express.Response) => {
  const { id } = req.params;

  try {
    const { data, error } = await supabaseAdmin
      .from("blog_posts")
      .update(req.body)
      .eq("id", id)
      .select()
      .maybeSingle();

    if (error) throw error;

    return res.json({
      success: true,
      data,
    } satisfies ApiResponse<BlogPost>);
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to update blog post",
    } satisfies ApiResponse);
  }
};

// DELETE /api/admin/blog/:id - Delete blog post
const deletePost = async (req: express.Request, res: express.Response) => {
  const { id } = req.params;

  try {
    const { error } = await supabaseAdmin
      .from("blog_posts")
      .delete()
      .eq("id", id);

    if (error) throw error;

    return res.json({
      success: true,
      data: {},
    } satisfies ApiResponse);
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to delete blog post",
    } satisfies ApiResponse);
  }
};

// CATEGORY MANAGEMENT ENDPOINTS

// GET /api/admin/blog/categories - List all categories
const getCategories = async (req: express.Request, res: express.Response) => {
  try {
    const { data, error } = await supabaseAdmin
      .from("blog_categories")
      .select("*")
      .order("name");

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
};

// POST /api/admin/blog/categories - Create category
const createCategory = async (req: express.Request, res: express.Response) => {
  try {
    // Generate slug from name if not provided
    const slug = req.body.slug || req.body.name.toLowerCase().replace(/\s+/g, '-');
    
    const { data, error } = await supabaseAdmin
      .from("blog_categories")
      .insert([{ ...req.body, slug }])
      .select()
      .maybeSingle();

    if (error) throw error;

    return res.status(201).json({
      success: true,
      data,
    } satisfies ApiResponse);
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to create category",
    } satisfies ApiResponse);
  }
};

// PUT /api/admin/blog/categories/:id - Update category
const updateCategory = async (req: express.Request, res: express.Response) => {
  const { id } = req.params;

  try {
    const { data, error } = await supabaseAdmin
      .from("blog_categories")
      .update(req.body)
      .eq("id", id)
      .select()
      .maybeSingle();

    if (error) throw error;

    return res.json({
      success: true,
      data,
    } satisfies ApiResponse);
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to update category",
    } satisfies ApiResponse);
  }
};

// DELETE /api/admin/blog/categories/:id - Delete category
const deleteCategory = async (req: express.Request, res: express.Response) => {
  const { id } = req.params;

  try {
    const { error } = await supabaseAdmin
      .from("blog_categories")
      .delete()
      .eq("id", id);

    if (error) throw error;

    return res.json({
      success: true,
      data: {},
    } satisfies ApiResponse);
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to delete category",
    } satisfies ApiResponse);
  }
};

// COMMENT MANAGEMENT ENDPOINTS

// POST /api/admin/blog/comments/:id/approve - Approve comment
const approveComment = async (req: express.Request, res: express.Response) => {
  const { id } = req.params;

  try {
    const { data, error } = await supabaseAdmin
      .from("blog_comments")
      .update({ is_approved: true, status: "approved" })
      .eq("id", id)
      .select()
      .maybeSingle();

    if (error) throw error;

    return res.json({
      success: true,
      data,
    } satisfies ApiResponse);
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to approve comment",
    } satisfies ApiResponse);
  }
};

// DELETE /api/admin/blog/comments/:id - Delete comment
const deleteComment = async (req: express.Request, res: express.Response) => {
  const { id } = req.params;

  try {
    const { error } = await supabaseAdmin
      .from("blog_comments")
      .delete()
      .eq("id", id);

    if (error) throw error;

    return res.json({
      success: true,
      data: {},
    } satisfies ApiResponse);
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to delete comment",
    } satisfies ApiResponse);
  }
};

// Route definitions
router.get("/", authenticateAdmin, getAllPosts);
router.get("/:id", authenticateAdmin, getById);
router.post("/", authenticateAdmin, validateRequestBody, createPost);
router.put("/:id", authenticateAdmin, validateRequestBody, updatePost);
// Some deployments/proxies may block or mishandle PUT; accept POST/PATCH as aliases.
router.post("/:id", authenticateAdmin, validateRequestBody, updatePost);
router.patch("/:id", authenticateAdmin, validateRequestBody, updatePost);
router.delete("/:id", authenticateAdmin, deletePost);

// Category routes
router.get("/categories", authenticateAdmin, getCategories);
router.post("/categories", authenticateAdmin, validateRequestBody, createCategory);
router.put("/categories/:id", authenticateAdmin, validateRequestBody, updateCategory);
router.post("/categories/:id", authenticateAdmin, validateRequestBody, updateCategory);
router.patch("/categories/:id", authenticateAdmin, validateRequestBody, updateCategory);
router.delete("/categories/:id", authenticateAdmin, deleteCategory);

// Comment routes
router.post("/comments/:id/approve", authenticateAdmin, approveComment);
router.delete("/comments/:id", authenticateAdmin, deleteComment);

export default router;
