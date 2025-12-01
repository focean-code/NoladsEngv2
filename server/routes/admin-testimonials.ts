import express from "express";
import { supabaseAdmin } from "../supabaseAdmin.ts";
import type { Testimonial, ApiResponse } from "../../shared/index.ts";
import {
  authenticateAdmin,
  validateRequestBody,
  requestLogger,
} from "../middleware/admin.ts";
import { createCrudHandlers } from "../utils/crud-factory.ts";

const router = express.Router();

// Add logging middleware and CORS handling
router.use(requestLogger);
router.use((req, res, next) => {
  // Get allowed origins from environment
  const corsOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(",")
        .map((o) => o.trim())
        .filter(Boolean)
    : [
        "http://localhost:5173",
        "http://localhost:8080",
        "http://localhost:3000",
      ];

  const origin = req.get("origin");

  // Set CORS headers
  if (!origin || corsOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin || "*");
  }
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Max-Age", "3600");

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

// Get CRUD handlers for testimonials
const { getAll, getById, create, update, remove } = createCrudHandlers({
  tableName: "testimonials",
  supabase: supabaseAdmin,
});

// Extend the standard getAll handler to add testimonial-specific filtering
const getAllTestimonials = async (
  req: express.Request,
  res: express.Response,
) => {
  const { status, rating, featured, ...rest } = req.query;

  // Build query filters based on parameters
  let query = supabaseAdmin.from("testimonials").select("*");

  if (status) {
    query = query.eq("status", status);
  }

  if (rating) {
    query = query.eq("rating", parseInt(rating as string, 10));
  }

  if (featured !== undefined) {
    query = query.eq("is_featured", featured === "true");
  }

  // Order by created_at in descending order
  query = query.order("created_at", { ascending: false });

  try {
    const { data, error } = await query;

    if (error) throw error;

    return res.json({
      success: true,
      data,
    } satisfies ApiResponse<Testimonial[]>);
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to fetch testimonials",
    } satisfies ApiResponse);
  }
};

// Custom update handler for testimonials
const updateTestimonial = async (
  req: express.Request,
  res: express.Response,
) => {
  const { id } = req.params;
  const updates = req.body;

  try {
    // If status is being changed to approved, set approved_at
    const finalUpdates = {
      ...updates,
      ...(updates.status === "approved" && {
        approved_at: new Date().toISOString(),
      }),
    };

    const { data, error } = await supabaseAdmin
      .from("testimonials")
      .update(finalUpdates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return res.json({
      success: true,
      data,
    } satisfies ApiResponse<Testimonial>);
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to update testimonial",
    } satisfies ApiResponse);
  }
};

// GET /api/admin/testimonials - List all testimonials with filtering
router.get("/", authenticateAdmin, getAllTestimonials);

// GET /api/admin/testimonials/:id - Get single testimonial
router.get("/:id", authenticateAdmin, getById);

// POST /api/admin/testimonials - Create new testimonial
router.post("/", [authenticateAdmin, validateRequestBody], create);

// PUT /api/admin/testimonials/:id - Update testimonial
router.put("/:id", [authenticateAdmin, validateRequestBody], updateTestimonial);

// DELETE /api/admin/testimonials/:id - Delete testimonial
router.delete("/:id", authenticateAdmin, remove);

export default router;
