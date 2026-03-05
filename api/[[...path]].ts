import type { VercelRequest, VercelResponse } from '@vercel/node';
import app from '../server/app.ts';

export const config = {
  runtime: 'nodejs', // Ensure full Node runtime for Express
  region: 'iad1'
};

export default function handler(req: VercelRequest, res: VercelResponse) {
  // Vercel routes /api/* to this handler, so req.url already includes /api
  // Just log for debugging purposes
  const originalUrl = req.url || '';
  console.log(`[API Handler] Processing request: ${req.method} ${originalUrl}`);
  
  return app(req as any, res as any);
}


