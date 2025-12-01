import express from "express";
import { supabaseAdmin } from "../supabaseAdmin.ts";
import type { Quote, ApiResponse } from "../../shared/index.ts";
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

// Get CRUD handlers for quotes
const { getAll, getById, create, update, remove } = createCrudHandlers({
  tableName: "quotes",
  supabase: supabaseAdmin,
});

// Extend the standard getAll handler to add quote-specific filtering
const getAllQuotes = async (req: express.Request, res: express.Response) => {
  const { status, serviceId, dateFrom, dateTo } = req.query;

  // Build query filters based on parameters
  let query = supabaseAdmin.from("quotes").select(`
      *,
      services (
        id,
        name,
        description
      ),
      clients:contact_messages (
        id,
        name,
        email,
        phone
      )
    `);

  if (status) {
    query = query.eq("status", status);
  }

  if (serviceId) {
    query = query.eq("service_id", serviceId);
  }

  if (dateFrom) {
    query = query.gte("created_at", dateFrom);
  }

  if (dateTo) {
    query = query.lte("created_at", dateTo);
  }

  // Sort by created_at in descending order by default
  query = query.order("created_at", { ascending: false });

  try {
    const { data, error } = await query;

    if (error) throw error;

    return res.json({
      success: true,
      data,
    });
  } catch (error: any) {
    console.error("Error fetching quotes:", error);
    return res.status(400).json({
      success: false,
      error: error.message || "Failed to fetch quotes",
    });
  }
};

// Custom update handler with status change logic
const updateQuote = async (req: express.Request, res: express.Response) => {
  const { id } = req.params;
  const updates = req.body;

  try {
    // First update the quote
    const { data, error } = await supabaseAdmin
      .from("quotes")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return res.json({
      success: true,
      data,
    });
  } catch (error: any) {
    console.error("Error updating quote:", error);
    return res.status(400).json({
      success: false,
      error: error.message || "Failed to update quote",
    });
  }
};

router.get("/", authenticateAdmin, getAllQuotes);

// GET /api/admin/quotes/:id - Get single quote
router.get("/:id", authenticateAdmin, getById);

// POST /api/admin/quotes - Create new quote
router.post("/", [authenticateAdmin, validateRequestBody], create);

// PUT /api/admin/quotes/:id - Update quote with status handling
router.put("/:id", [authenticateAdmin, validateRequestBody], updateQuote);

// DELETE /api/admin/quotes/:id - Delete quote
router.delete("/:id", authenticateAdmin, remove);

export default router;
