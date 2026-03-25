import "dotenv/config";
import express from "express";
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
import blogRoutes from "./routes/blog.ts";
import contactRoutes from "./routes/contact.ts";
import quotesEmailRoutes from "./routes/quotes-email.ts";
import analyticsRoutes from "./routes/analyticsRoutes.ts";
import seoRoutes from "./routes/seo.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const createApp = () => {
  const app = express();

  // Middleware
  app.use(express.json({ limit: process.env.UPLOAD_MAX_SIZE || "2mb" }));

  // Request logging middleware
  // Logging every static asset request can severely slow production.
  // Default OFF unless explicitly enabled.
  const shouldLogRequests = process.env.REQUEST_LOGGING === "true";
  if (shouldLogRequests) {
    app.use((req, res, next) => {
      console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
      next();
    });
  }

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
  app.use("/api/blog", blogRoutes);
  app.use("/api/contact", contactRoutes);
  app.use("/api/quotes", quotesEmailRoutes);

  // Health check route
  app.get("/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // SEO Routes - sitemap and robots
  app.use("/api/seo", seoRoutes);

  const distPath = path.join(__dirname, "../dist");
  const publicPath = path.join(__dirname, "../public");

  if (fs.existsSync(distPath)) {
    app.use(
      express.static(distPath, {
        // Vite hashes static assets; cache them aggressively.
        etag: true,
        maxAge: 0,
        setHeaders: (res, filePath) => {
          const isHashedAsset = /\.[a-f0-9]{8,}\./i.test(filePath);
          if (filePath.endsWith("index.html")) {
            res.setHeader("Cache-Control", "no-cache");
            return;
          }
          if (isHashedAsset) {
            res.setHeader(
              "Cache-Control",
              "public, max-age=31536000, immutable",
            );
          }
        },
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
        // Public assets aren't fingerprinted; keep a moderate cache.
        maxAge: "7d",
        etag: true,
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
