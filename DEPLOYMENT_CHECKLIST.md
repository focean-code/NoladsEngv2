# Deployment Checklist - Analytics Routes Fix

## Changes Made
The analytics API routes have been fixed and are ready for deployment. Here's what was changed:

### Files Modified:
1. ✅ `server/server.ts` - Corrected analytics route mounting
2. ✅ `server/routes/analyticsRoutes.ts` - Fixed middleware and route paths  
3. ✅ `vite.config.ts` - Updated dev/preview server route mounting

## Before Deploying to cPanel:

### 1. Verify Local Build Works
```bash
npm run build
npm start
# Should compile without errors
```

### 2. Verify Routes in Production Mode
After running `npm start`, the server will run on port 8000 (or `$PORT` env var).
Test endpoints return JSON, not HTML:
- `http://localhost:8000/api/analytics/overview`
- `http://localhost:8000/api/analytics/realtime`
- `http://localhost:8000/api/analytics/conversions`

### 3. Environment Variables for cPanel
Make sure these are set in cPanel:
```
PORT=8080  # or whatever port your hosting uses
CORS_ORIGIN=https://yourdomain.com
GA4_PROPERTY_ID=your-property-id
GA4_CLIENT_EMAIL=your-service-account-email@*.iam.gserviceaccount.com
GA4_PRIVATE_KEY=your-private-key-json
SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_ROLE=your-supabase-key
```

### 4. cPanel Deployment Steps
1. **Upload files** to public_html or designated directory
2. **Install dependencies**: `npm install --production`
3. **Build project**: `npm run build`
4. **Start Node app** via cPanel's Node.js Manager:
   - Select the app directory
   - Click "Create Application"
   - Set startup file to: `dist/server/server.js` (if using built version) or `npm start`

### 5. Verify After Deployment
Make HTTP request to your domain:
```bash
curl https://yourdomain.com/api/analytics/overview
```

Should return JSON like:
```json
{
  "success": true,
  "error": null,
  "data": {
    "pageViews": 0,
    "sessions": 0,
    "users": 0,
    ...
  }
}
```

NOT HTML:
```html
<!doctype html>
...
```

## If Still Getting HTML Errors:

### Issue: Routes returning HTML after deploy
**Solution**: 
- Ensure Node.js app is running (check cPanel Node.js Manager)
- Verify environment variables are set
- Check server logs in cPanel for errors
- Make sure API requests are going to Node.js, not Apache

### Issue: "Cannot GET /api/analytics/*"
**Cause**: Router not being registered correctly  
**Solution**:
- Verify `dist/server/server.js` exists after build
- Check that analyticsRoutes is imported in server.ts
- Restart Node app in cPanel

### Issue: CORS errors
**Cause**: Frontend and backend on different domains  
**Solution**:
- Set `CORS_ORIGIN` env variable to include your domain
- Make sure CORS middleware is before route handlers

## Quick Test Script
```powershell
# Test all three analytics endpoints
$endpoints = @("/api/analytics/overview", "/api/analytics/realtime", "/api/analytics/conversions")
foreach ($endpoint in $endpoints) {
    try {
        $response = Invoke-WebRequest "https://yourdomain.com$endpoint" -Headers @{"Cache-Control"="no-store"}
        Write-Host "✓ $endpoint - Status $($response.StatusCode)"
    } catch {
        Write-Host "✗ $endpoint - Failed"
    }
}
```

## Current Status
- ✅ Build passes without errors
- ✅ Routes are correctly configured  
- ✅ Both server.ts and vite.config.ts updated
- ✅ Ready for deployment to cPanel

Just run `npm run build` and deploy the `dist/` folder!
