import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import type { Plugin } from 'vite';
import express from 'express';

function adminApiPlugin(env: Record<string, string>): Plugin {
  const supabaseUrl = env.VITE_SUPABASE_URL || env.SUPABASE_URL;
  const serviceRole = env.SUPABASE_SERVICE_ROLE;

  // Expose GA4 env vars to Node-side server code (analytics routes)
  process.env.GA4_PROPERTY_ID = process.env.GA4_PROPERTY_ID || env.GA4_PROPERTY_ID || '';
  process.env.GA4_CLIENT_EMAIL = process.env.GA4_CLIENT_EMAIL || env.GA4_CLIENT_EMAIL || '';
  process.env.GA4_PRIVATE_KEY = process.env.GA4_PRIVATE_KEY || env.GA4_PRIVATE_KEY || '';

  // Expose SMTP/email env vars so server routes can send emails when running via Vite
  process.env.SMTP_HOST = process.env.SMTP_HOST || env.SMTP_HOST || '';
  process.env.SMTP_PORT = process.env.SMTP_PORT || env.SMTP_PORT || '';
  process.env.SMTP_USER = process.env.SMTP_USER || env.SMTP_USER || '';
  process.env.SMTP_PASS = process.env.SMTP_PASS || env.SMTP_PASS || '';
  process.env.EMAIL_FROM = process.env.EMAIL_FROM || env.EMAIL_FROM || '';
  process.env.EMAIL_TO = process.env.EMAIL_TO || env.EMAIL_TO || '';
  process.env.CONTACT_RECIPIENT = process.env.CONTACT_RECIPIENT || env.CONTACT_RECIPIENT || '';
  process.env.QUOTES_RECIPIENT = process.env.QUOTES_RECIPIENT || env.QUOTES_RECIPIENT || '';

  return {
    name: 'admin-api-plugin',
    async configureServer(server) {
      const app = express();
      app.use(express.json({ limit: '2mb' }));
      
      // Global error handler
      app.use((err, req, res, next) => {
        console.error('[Vite Server] Error:', err);
        res.status(500).json({
          success: false,
          error: 'Internal server error',
          details: err.message
        });
      });
      
      // Request tracking middleware
      app.use((req, res, next) => {
        const requestId = Math.random().toString(36).substring(7);
        res.locals.requestId = requestId;
        
        // Log incoming request
        console.log(`[Vite Server ${requestId}] ${req.method} ${req.originalUrl}`, {
          body: req.body,
          query: req.query,
          params: req.params,
          headers: {
            'content-type': req.headers['content-type'],
            'authorization': req.headers.authorization ? 'Present' : 'Missing'
          }
        });
        
        // Track response
        const oldJson = res.json;
        res.json = function(data) {
          console.log(`[Vite Server ${requestId}] Response:`, {
            status: res.statusCode,
            data
          });
          return oldJson.apply(this, arguments);
        };
        
        next();
      });

      if (supabaseUrl && serviceRole) {
        console.log('[admin-api-plugin] Initializing with:', {
          supabaseUrl: supabaseUrl.split('@')[1] || 'configured',  // Don't log full URL
          serviceRole: serviceRole ? 'configured' : 'missing'
        });

        const { default: adminServicesRouter } = await import('./server/routes/admin-services');
        const { default: adminProductsRouter } = await import('./server/routes/admin-products');
        const { default: adminTestimonialsRouter } = await import('./server/routes/admin-testimonials');
        const { default: adminBlogRouter } = await import('./server/routes/admin-blog');
        const { default: adminQuotesRouter } = await import('./server/routes/admin-quotes');
        const { default: adminContactsRouter } = await import('./server/routes/admin-contacts');
        const { default: analyticsRouter } = await import('./server/routes/analyticsRoutes');
        const { default: contactRouter } = await import('./server/routes/contact');
        const { default: quotesEmailRouter } = await import('./server/routes/quotes-email');

        console.log('[admin-api-plugin] Mounting routes:');

        // Set up CORS for admin routes
        app.use('/api/admin', (req, res, next) => {
          res.header('Access-Control-Allow-Origin', '*');
          res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS');
          res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
          
          if (req.method === 'OPTIONS') {
            return res.sendStatus(200);
          }
          next();
        });

        // Debug middleware for admin routes
        app.use('/api/admin', (req, res, next) => {
          const { requestId } = res.locals;
          console.log(`[Admin API ${requestId}] Route matched`, {
            method: req.method,
            url: req.originalUrl,
            path: req.path,
            baseUrl: req.baseUrl,
            params: req.params,
            query: req.query
          });
          next();
        });

        // Mount admin routes with enhanced logging
        const mountRoute = (path, router) => {
          console.log(`[admin-api-plugin] Mounting route: ${path}`);
          app.use(path, (req, res, next) => {
            const { requestId } = res.locals;
            console.log(`[Admin API ${requestId}] ${path} handler`, {
              method: req.method,
              params: req.params
            });
            next();
          }, router);
        };

        mountRoute('/api/admin/services', adminServicesRouter);
        mountRoute('/api/admin/products', adminProductsRouter);
        mountRoute('/api/admin/testimonials', adminTestimonialsRouter);
        mountRoute('/api/admin/blog', adminBlogRouter);
        mountRoute('/api/admin/quotes', adminQuotesRouter);
        mountRoute('/api/admin/contacts', adminContactsRouter);

        // Mount public email routes for contact/quotes
        app.use('/api/contact', contactRouter);
        app.use('/api/quotes', quotesEmailRouter);

        // Mount analytics routes under /api/analytics to handle GA endpoints during dev
        app.use('/api/analytics', analyticsRouter);

        // 404 handler for admin routes
        app.use('/api/admin', (req, res) => {
          const { requestId } = res.locals;
          console.log(`[Admin API ${requestId}] 404 Not Found:`, {
            method: req.method,
            url: req.originalUrl,
            path: req.path,
            baseUrl: req.baseUrl
          });
          res.status(404).json({
            success: false,
            error: 'Endpoint not found',
            details: `${req.method} ${req.path}`
          });
        });

        server.config.logger.info('[admin-api-plugin] Admin routes enabled.');
      } else {
        server.config.logger.info('[admin-api-plugin] SUPABASE env not set; admin routes disabled.');
      }

      server.middlewares.use(app);
    },
    async configurePreviewServer(server) {
      const app = express();
      app.use(express.json({ limit: '2mb' }));

      // Global error handler
      app.use((err, req, res, next) => {
        console.error('[Preview Server] Error:', err);
        res.status(500).json({
          success: false,
          error: 'Internal server error',
          details: err.message
        });
      });
      
      // Request tracking middleware
      app.use((req, res, next) => {
        const requestId = Math.random().toString(36).substring(7);
        res.locals.requestId = requestId;
        
        // Log incoming request
        console.log(`[Preview Server ${requestId}] ${req.method} ${req.originalUrl}`, {
          body: req.body,
          query: req.query,
          params: req.params,
          headers: {
            'content-type': req.headers['content-type'],
            'authorization': req.headers.authorization ? 'Present' : 'Missing'
          }
        });
        
        // Track response
        const oldJson = res.json;
        res.json = function(data) {
          console.log(`[Preview Server ${requestId}] Response:`, {
            status: res.statusCode,
            data
          });
          return oldJson.apply(this, arguments);
        };
        
        next();
      });

      if (supabaseUrl && serviceRole) {
        console.log('[admin-api-plugin] Initializing preview server with:', {
          supabaseUrl: supabaseUrl.split('@')[1] || 'configured',  // Don't log full URL
          serviceRole: serviceRole ? 'configured' : 'missing'
        });

        const { default: adminServicesRouter } = await import('./server/routes/admin-services');
        const { default: adminProductsRouter } = await import('./server/routes/admin-products');
        const { default: adminTestimonialsRouter } = await import('./server/routes/admin-testimonials');
        const { default: adminBlogRouter } = await import('./server/routes/admin-blog');
        const { default: adminQuotesRouter } = await import('./server/routes/admin-quotes');
        const { default: adminContactsRouter } = await import('./server/routes/admin-contacts');
        const { default: analyticsRouter } = await import('./server/routes/analyticsRoutes');
        const { default: contactRouter } = await import('./server/routes/contact');
        const { default: quotesEmailRouter } = await import('./server/routes/quotes-email');

        console.log('[admin-api-plugin] Mounting preview routes:');

        // Set up CORS for admin routes
        app.use('/api/admin', (req, res, next) => {
          res.header('Access-Control-Allow-Origin', '*');
          res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS');
          res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
          
          if (req.method === 'OPTIONS') {
            return res.sendStatus(200);
          }
          next();
        });

        // Debug middleware for admin routes
        app.use('/api/admin', (req, res, next) => {
          const { requestId } = res.locals;
          console.log(`[Preview Admin API ${requestId}] Route matched`, {
            method: req.method,
            url: req.originalUrl,
            path: req.path,
            baseUrl: req.baseUrl,
            params: req.params,
            query: req.query
          });
          next();
        });

        // Mount admin routes with enhanced logging
        const mountRoute = (path, router) => {
          console.log(`[admin-api-plugin] Mounting preview route: ${path}`);
          app.use(path, (req, res, next) => {
            const { requestId } = res.locals;
            console.log(`[Preview Admin API ${requestId}] ${path} handler`, {
              method: req.method,
              params: req.params
            });
            next();
          }, router);
        };

        mountRoute('/api/admin/services', adminServicesRouter);
        mountRoute('/api/admin/products', adminProductsRouter);
        mountRoute('/api/admin/testimonials', adminTestimonialsRouter);
        mountRoute('/api/admin/blog', adminBlogRouter);
        mountRoute('/api/admin/quotes', adminQuotesRouter);
        mountRoute('/api/admin/contacts', adminContactsRouter);

        // Mount public email routes for contact/quotes
        app.use('/api/contact', contactRouter);
        app.use('/api/quotes', quotesEmailRouter);

        // Mount analytics routes under /api/analytics to handle GA endpoints during preview
        app.use('/api/analytics', analyticsRouter);

        // 404 handler for admin routes
        app.use('/api/admin', (req, res) => {
          const { requestId } = res.locals;
          console.log(`[Preview Admin API ${requestId}] 404 Not Found:`, {
            method: req.method,
            url: req.originalUrl,
            path: req.path,
            baseUrl: req.baseUrl
          });
          res.status(404).json({
            success: false,
            error: 'Endpoint not found',
            details: `${req.method} ${req.path}`
          });
        });

        server.config.logger.info('[admin-api-plugin] (preview) Admin routes enabled.');
      } else {
        server.config.logger.info('[admin-api-plugin] SUPABASE env not set; admin routes disabled.');
      }

      server.middlewares.use(app);
    }
  };
}

// Vite config for SPA with Supabase backend
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  // Propagate .env values to process.env so Node-side files (server/*) can access them
  process.env.SUPABASE_URL = process.env.SUPABASE_URL || env.SUPABASE_URL || env.VITE_SUPABASE_URL || '';
  process.env.VITE_SUPABASE_URL = process.env.VITE_SUPABASE_URL || env.VITE_SUPABASE_URL || env.SUPABASE_URL || '';
  process.env.SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE || env.SUPABASE_SERVICE_ROLE || '';
  process.env.VITE_SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || env.VITE_SUPABASE_ANON_KEY || '';

  return {
    server: {
      host: "0.0.0.0",
      port: 5173,
      strictPort: false,
      proxy: {
        '/api': {
          target: 'http://localhost:8000',
          changeOrigin: true,
          bypass(req) {
            if (req.url?.startsWith('/api/contact') || req.url?.startsWith('/api/quotes')) {
              return req.url; // let Vite middleware handle these endpoints
            }
          }
        },
      },
    },
    build: {
      outDir: "dist",
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom', 'react-router-dom'],
            ui: ['@radix-ui/react-alert-dialog', '@radix-ui/react-dialog', '@radix-ui/react-toast'],
          }
        }
      }
    },
    plugins: [react(), adminApiPlugin(env)],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./client"),
        "@shared": path.resolve(__dirname, "./shared"),
      },
    },
  };
});
