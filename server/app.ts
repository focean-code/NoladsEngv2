import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import type { Request, Response, NextFunction } from "express";
import adminTestimonials from "./routes/admin-testimonials.ts";
import adminServices from "./routes/admin-services.ts";
import adminProducts from "./routes/admin-products.ts";
import adminQuotes from "./routes/admin-quotes.ts";
import adminBlog from "./routes/admin-blog.ts";
import adminContacts from "./routes/admin-contacts.ts";
import contactRoutes from "./routes/contact.ts";
import quotesEmailRoutes from "./routes/quotes-email.ts";
import analyticsRoutes from "./routes/analyticsRoutes.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const createApp = () => {
  const app = express();

  // Middleware
  const corsOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(",")
        .map((o) => o.trim())
        .filter(Boolean)
    : [
        "http://localhost:5173",
        "http://localhost:8080",
        "http://localhost:3000",
      ];

  console.log("[CORS] Configured origins:", corsOrigins);

  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) {
          return callback(null, true);
        }

        // Check if origin is in the whitelist
        if (corsOrigins.includes(origin)) {
          return callback(null, true);
        }

        // Log rejected origins for debugging
        console.warn(`[CORS] Rejected origin: ${origin}`);
        return callback(new Error("CORS policy violation"));
      },
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
      allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
      credentials: true,
      maxAge: 3600,
    }),
  );
  app.use(express.json({ limit: process.env.UPLOAD_MAX_SIZE || "2mb" }));

  // Request logging middleware
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
  });

  // Analytics Routes (must be before other /api routes)
  app.use("/api/analytics", analyticsRoutes);

  // Admin Routes
  app.use("/api/admin/testimonials", adminTestimonials);
  app.use("/api/admin/services", adminServices);
  app.use("/api/admin/products", adminProducts);
  app.use("/api/admin/quotes", adminQuotes);
  app.use("/api/admin/blog", adminBlog);
  app.use("/api/admin/contacts", adminContacts);

  // Public API Routes
  app.use("/api/contact", contactRoutes);
  app.use("/api/quotes", quotesEmailRoutes);

  // Health check route
  app.get("/health", (req, res) => {
    res.json({ status: "ok" });
  });

  const distPath = path.join(__dirname, "../dist");
  const publicPath = path.join(__dirname, "../public");

  if (fs.existsSync(distPath)) {
    app.use(
      express.static(distPath, {
        maxAge: "1h",
        etag: false,
      }),
    );
  } else {
    console.warn(
      "[express] dist directory missing, skipping static middleware",
    );
  }

  if (fs.existsSync(publicPath)) {
    app.use(
      express.static(publicPath, {
        maxAge: "24h",
        etag: false,
      }),
    );
  } else {
    console.warn(
      "[express] public directory missing, skipping static middleware",
    );
  }

  // SPA fallback - serve index.html for all non-API routes
  app.use((req, res, next) => {
    if (
      req.method === "GET" &&
      !req.url.startsWith("/api/") &&
      !req.url.includes(".")
    ) {
      if (fs.existsSync(distPath)) {
        return res.sendFile(path.join(distPath, "index.html"), (err) => {
          if (err) {
            res.status(404).json({ success: false, error: "Not Found" });
          }
        });
      }
      return res.status(404).json({ success: false, error: "Not Found" });
    }
    return next();
  });

  app.use((req, res) => {
    res.status(404).json({ success: false, error: "Not Found" });
  });

  // Error handler
  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error("Server error:", err);
    res
      .status(500)
      .json({ success: false, error: "Server error", details: err.message });
  });

  return app;
};

const app = createApp();

export default app;
