import express from "express";
import { supabaseAdmin } from "../supabaseAdmin.ts";
import type { Product, ApiResponse } from "../../shared/index.ts";
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

// Get CRUD handlers for products
const { getAll, getById, create, update, remove } = createCrudHandlers({
  tableName: "products",
  supabase: supabaseAdmin,
});

// Extend the standard getAll handler to add product-specific filtering
const getAllProducts = async (req: express.Request, res: express.Response) => {
  // Add custom query parameters for product-specific filtering
  const { category, minPrice, maxPrice, inStock } = req.query;

  // Pass these as filters to the standard getAll handler
  const filters: any = {};
  if (category) filters.category = category;
  if (inStock !== undefined) filters.in_stock = inStock === "true";
  if (minPrice) filters.price = `gte.${minPrice}`;

  if (maxPrice) filters.price = `lte.${maxPrice}`;

  req.query = {
    ...req.query,
    filters: JSON.stringify(filters),
  };

  return getAll(req, res);
};

// GET /api/admin/products - List all products with advanced filtering
router.get("/", authenticateAdmin, getAllProducts);

// GET /api/admin/products/:id - Get single product
router.get("/:id", authenticateAdmin, getById);

// POST /api/admin/products - Create new product
router.post("/", [authenticateAdmin, validateRequestBody], create);

// PUT /api/admin/products/:id - Update product
router.put("/:id", [authenticateAdmin, validateRequestBody], update);

// DELETE /api/admin/products/:id - Delete product
router.delete("/:id", authenticateAdmin, remove);

export default router;
