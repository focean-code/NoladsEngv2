# Nolads Engineering - Deployment Guide

## Overview

This application is a **Full-Stack React + Express.js application** with:
- **Frontend**: React SPA built with Vite
- **Backend**: Express.js API server
- **Database**: Supabase (PostgreSQL)
- **Architecture**: Single unified server for both frontend serving and API routes

## Important: Server Architecture

The application uses **ONE Express server** (`server/server.ts`) that handles:
1. **Admin API Routes** (`/api/admin/*`) - for content management
2. **Public API Routes** (`/api/contact`, `/api/quotes`, etc.) - for public forms
3. **Static frontend serving** - serves the built React app from `/dist`
4. **SPA fallback routing** - routes non-API requests to React

**Do NOT run separate admin server in production!** There is only one production server.

## Prerequisites

- Node.js >= 20.19.2
- npm package manager
- Environment variables configured (see `.env.example`)

## Local Development

```bash
# Install dependencies
npm install

# Start Vite dev server (includes hot reload)
npm run dev

# Access at http://localhost:5173
```

During development, the Vite dev server provides:
- Hot reload for frontend code
- Admin API routes via Vite plugin
- Public API routes handled locally

## Production Build

```bash
# Build frontend and prepare for production
npm run build

# This generates:
# - dist/index.html (SPA entry point)
# - dist/assets/* (bundled JS/CSS)
# - Static files copied to dist/
```

## Production Deployment

### Option 1: VPS/Dedicated Server

```bash
# 1. Upload project files to server
scp -r . user@server:/app/nolads-eng

# 2. SSH into server
ssh user@server

# 3. Install dependencies
cd /app/nolads-eng
npm install

# 4. Build the frontend
npm run build

# 5. Set environment variables
nano .env
# Configure: SUPABASE_URL, SUPABASE_SERVICE_ROLE, SMTP settings, etc.

# 6. Start the server (using PM2 for production)
npm install -g pm2
pm2 start npm --name "nolads-api" -- run server
pm2 save
pm2 startup

# Server will be available at http://server-ip:8000
```

### Option 2: Node Hosting (Render, Railway, Heroku)

**Set environment variables in hosting dashboard:**
```
PORT=8000
NODE_ENV=production
SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_ROLE=your-service-role-key
CORS_ORIGIN=https://noladseng.com
SMTP_HOST=mail.noladseng.com
SMTP_PORT=465
SMTP_USER=sales@noladseng.com
SMTP_PASS=your-email-password
EMAIL_FROM=sales@noladseng.com
CONTACT_RECIPIENT=sales@noladseng.com
QUOTES_RECIPIENT=sales@noladseng.com
```

**Procfile:**
```
web: npm run server
```

### Option 3: Docker Deployment

**Dockerfile:**
```dockerfile
FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Build frontend
COPY . .
RUN npm run build

# Expose port
EXPOSE 8000

# Start server
CMD ["npm", "run", "server"]
```

**Build and run:**
```bash
docker build -t nolads-eng .
docker run -p 8000:8000 --env-file .env nolads-eng
```

## Environment Configuration

Create `.env` file with these required variables:

```env
# Server
PORT=8000
NODE_ENV=production

# Database
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE=your-service-role-key-here
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# CORS
CORS_ORIGIN=https://noladseng.com,https://www.noladseng.com

# Email/SMTP
SMTP_HOST=mail.noladseng.com
SMTP_PORT=465
SMTP_USER=sales@noladseng.com
SMTP_PASS=your-email-password
EMAIL_FROM="Nolads Engineering <sales@noladseng.com>"
CONTACT_RECIPIENT=sales@noladseng.com
QUOTES_RECIPIENT=sales@noladseng.com

# Optional: Google Analytics
GA4_PROPERTY_ID=your-ga4-property-id
GA4_CLIENT_EMAIL=your-ga4-client-email
GA4_PRIVATE_KEY=your-ga4-private-key
```

## API Endpoints

All endpoints are prefixed with `/api`:

### Admin Routes (Protected)
- `GET /api/admin/products` - List products
- `PUT /api/admin/products/:id` - Update product
- `POST /api/admin/products` - Create product
- `DELETE /api/admin/products/:id` - Delete product

Similar routes available for:
- `/api/admin/services`
- `/api/admin/testimonials`
- `/api/admin/blog`
- `/api/admin/quotes`
- `/api/admin/contacts`

### Public Routes
- `POST /api/contact` - Contact form submission
- `POST /api/quotes` - Quote request submission
- `GET /api/analytics/*` - Analytics endpoints

## Health Check

```bash
curl http://localhost:8000/health
# Response: {"status": "ok"}
```

## Troubleshooting

### 405 Method Not Allowed on API routes

**Problem:** Admin routes returning HTML instead of JSON

**Solution:** Ensure:
1. Express server is running (not just Vite)
2. Server is using `server/server.ts` (not `admin-server.ts`)
3. Routes are imported before static file serving middleware

### WebSocket Connection Failed

**Problem:** `wss://noladseng.com/socket.io/` failing

**Solution:** If real-time features aren't needed, ignore this. Socket.IO isn't configured in this application.

### CORS Errors

**Problem:** Frontend can't reach API

**Solution:** 
1. Check `CORS_ORIGIN` environment variable includes your domain
2. Restart server after changing `.env`

### Static Assets Not Loading

**Problem:** Images/CSS not loading in production

**Solution:**
1. Ensure `npm run build` was run
2. Check that `dist/` folder exists and contains assets
3. Verify server can access dist folder (permissions)

## Monitoring & Logs

### Using PM2 (recommended)
```bash
# View logs
pm2 logs nolads-api

# Monitor resources
pm2 monit

# Restart app
pm2 restart nolads-api

# Stop app
pm2 stop nolads-api
```

### Docker Logs
```bash
docker logs -f container-id
```

## SSL/HTTPS Setup

### With Let's Encrypt (free)
```bash
# Using Certbot with Nginx
certbot certonly --standalone -d noladseng.com -d www.noladseng.com

# Configure Nginx to reverse proxy to Node app on port 8000
# and serve SSL certificates
```

### Using Reverse Proxy (Nginx)

```nginx
server {
    listen 443 ssl;
    server_name noladseng.com www.noladseng.com;

    ssl_certificate /etc/letsencrypt/live/noladseng.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/noladseng.com/privkey.pem;

    location / {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name noladseng.com www.noladseng.com;
    return 301 https://$server_name$request_uri;
}
```

## Performance Optimization

### Caching
```javascript
// Static assets are cached for 1 hour
app.use(express.static(distPath, {
  maxAge: '1h',
  etag: false
}));

// Public assets cached for 24 hours
app.use(express.static('public', {
  maxAge: '24h',
  etag: false
}));
```

### Compression
Add to your Nginx/reverse proxy:
```nginx
gzip on;
gzip_types text/plain application/json application/javascript;
gzip_min_length 1000;
```

## Database Migrations

Before deploying, ensure Supabase tables are set up:

```bash
# Review schema
cat supabase-schema.sql

# Apply migrations in Supabase dashboard:
# - SQL Editor → New Query
# - Paste schema file contents
# - Run
```

## Scaling Considerations

For high-traffic deployments:

1. **Load Balancing**: Put multiple Node instances behind a load balancer
2. **Session Storage**: Use Redis instead of in-memory sessions
3. **Database**: Ensure Supabase pooling is enabled
4. **CDN**: Serve static assets via CloudFront/Cloudflare
5. **Caching**: Add Redis for API response caching

## Support & Troubleshooting

For issues:
1. Check server logs: `pm2 logs` or `docker logs`
2. Verify environment variables are set
3. Check database connection: Make request to `/health`
4. Review API responses for detailed error messages

---

**Last Updated:** November 2024
**Server Version:** Node.js 20.19.2+
**Framework:** Express.js 5.1.0 + React 18.3.1
