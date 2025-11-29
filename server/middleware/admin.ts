import express from 'express';
import { assertAdminFromBearer } from '../supabaseAdmin.ts';
import type { ApiResponse } from '../../shared/index.ts';

// Authentication middleware
export const authenticateAdmin = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const auth = await assertAdminFromBearer(req.headers.authorization as string | undefined);
  if (!auth.ok) {
    return res.status(auth.status).json({
      success: false,
      error: auth.message,
    } satisfies ApiResponse);
  }
  next();
};

// Validation middleware for request body
export const validateRequestBody = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  if (!req.headers['content-type']?.includes('application/json')) {
    return res.status(400).json({
      success: false,
      error: 'Content-Type must be application/json',
    } satisfies ApiResponse);
  }

  if (!req.body || typeof req.body !== 'object') {
    return res.status(400).json({
      success: false,
      error: 'Request body must be a valid JSON object',
    } satisfies ApiResponse);
  }

  next();
};

// Request logging middleware with request ID
export const requestLogger = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const requestId = Math.random().toString(36).substring(7);
  res.locals.requestId = requestId;

  console.log(`[Admin ${requestId}] ${req.method} ${req.originalUrl}`, {
    params: req.params,
    query: req.query,
    path: req.path,
    body: req.body,
    auth: req.headers.authorization ? 'Present' : 'Missing',
  });
  next();
};

// Common CORS OPTIONS handler
export const handleOptions = (req: express.Request, res: express.Response) => {
  res.sendStatus(200);
};