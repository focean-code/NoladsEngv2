import express from "express";
import { supabaseAdmin } from "../supabaseAdmin.ts";
import type {
  CreateService,
  Service,
  ApiResponse,
} from "../../shared/index.ts";
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

// Get CRUD handlers for services
const { getAll, getById, create, update, remove } = createCrudHandlers({
  tableName: "services",
  supabase: supabaseAdmin,
});

// GET /api/admin/services - List all services
router.get("/", authenticateAdmin, getAll);

// GET /api/admin/services/:id - Get single service
router.get("/:id", authenticateAdmin, getById);

// POST /api/admin/services - Create new service
router.post("/", [authenticateAdmin, validateRequestBody], create);

// PUT /api/admin/services/:id - Update service
router.put("/:id", [authenticateAdmin, validateRequestBody], update);

// DELETE /api/admin/services/:id - Delete service
router.delete("/:id", authenticateAdmin, remove);

export default router;
