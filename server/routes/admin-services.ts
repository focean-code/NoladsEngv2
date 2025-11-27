import express from 'express';
import { supabaseAdmin } from '../supabaseAdmin.ts';
import type { CreateService, Service, ApiResponse } from '../../shared/index.ts';
import { authenticateAdmin, validateRequestBody, requestLogger } from '../middleware/admin.ts';
import { createCrudHandlers } from '../utils/crud-factory.ts';

const router = express.Router();

// Add logging middleware and CORS handling
router.use(requestLogger);
router.use((req, res, next) => {
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Get CRUD handlers for services
const {
  getAll,
  getById,
  create,
  update,
  remove
} = createCrudHandlers({
  tableName: 'services',
  supabase: supabaseAdmin
});

// GET /api/admin/services - List all services
router.get('/', authenticateAdmin, getAll);

// GET /api/admin/services/:id - Get single service
router.get('/:id', authenticateAdmin, getById);

// POST /api/admin/services - Create new service
router.post('/', [authenticateAdmin, validateRequestBody], create);

// PUT /api/admin/services/:id - Update service
router.put('/:id', [authenticateAdmin, validateRequestBody], update);

// DELETE /api/admin/services/:id - Delete service
router.delete('/:id', authenticateAdmin, remove);

export default router;