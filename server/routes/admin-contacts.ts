import express from "express";
import { supabaseAdmin } from "../supabaseAdmin.ts";
import type { ContactMessage, ApiResponse } from "../../shared/index.ts";
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

// Get CRUD handlers for contacts
const { getAll, getById, create, update, remove } = createCrudHandlers({
  tableName: "contact_messages",
  supabase: supabaseAdmin,
});

// Extend the standard getAll handler to add contact-specific filtering
const getAllMessages = async (req: express.Request, res: express.Response) => {
  const { status, dateFrom, dateTo } = req.query;

  // Build query filters based on parameters
  let query = supabaseAdmin.from("contact_messages").select("*");

  if (status) {
    query = query.eq("status", status);
  }

  if (dateFrom) {
    query = query.gte("created_at", dateFrom);
  }

  if (dateTo) {
    query = query.lte("created_at", dateTo);
  }

  // Order by created_at in descending order
  query = query.order("created_at", { ascending: false });

  try {
    const { data, error } = await query;

    if (error) throw error;

    return res.json({
      success: true,
      data,
    });
  } catch (error: any) {
    console.error("Error fetching contact messages:", error);
    return res.status(400).json({
      success: false,
      error: error.message || "Failed to fetch contact messages",
    });
  }
};

// Custom update handler
const updateMessage = async (req: express.Request, res: express.Response) => {
  const { id } = req.params;
  const updates = req.body;

  try {
    // Update message status
    const { data, error } = await supabaseAdmin
      .from("contact_messages")
      .update({
        ...updates,
        // If marking as replied, set replied_at timestamp
        ...(updates.status === "replied" && {
          replied_at: new Date().toISOString(),
        }),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return res.json({
      success: true,
      data,
    });
  } catch (error: any) {
    console.error("Error updating contact message:", error);
    return res.status(400).json({
      success: false,
      error: error.message || "Failed to update contact message",
    });
  }
};

router.get("/", authenticateAdmin, getAllMessages);

// GET /api/admin/contacts/:id - Get single message
router.get("/:id", authenticateAdmin, getById);

// PUT /api/admin/contacts/:id - Update message status
router.put("/:id", [authenticateAdmin, validateRequestBody], updateMessage);

// DELETE /api/admin/contacts/:id - Delete message
router.delete("/:id", authenticateAdmin, remove);

export default router;
