import type { VercelRequest, VercelResponse } from '@vercel/node';
import app from '../server/app.ts';

export const config = {
  runtime: 'nodejs', // Ensure full Node runtime for Express
  region: 'iad1'
};

export default function handler(req: VercelRequest, res: VercelResponse) {
  // Vercel routes /api/* to this handler, and req.url should already include /api
  // But if it doesn't, we need to ensure the path is correct for Express
  const originalUrl = req.url || '';
  if (!originalUrl.startsWith('/api')) {
    req.url = `/api${originalUrl}`;
  }
  return app(req as any, res as any);
}


