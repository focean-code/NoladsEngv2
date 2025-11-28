import express from 'express';
import { supabaseAdmin } from '../supabaseAdmin.ts';
import type { ContactMessage, ApiResponse } from '../../shared/index.ts';
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

// Get CRUD handlers for contacts
const {
  getAll,
  getById,
  create,
  update,
  remove
} = createCrudHandlers({
  tableName: 'contact_messages',
  supabase: supabaseAdmin
});

// Extend the standard getAll handler to add contact-specific filtering
const getAllMessages = async (req: express.Request, res: express.Response) => {
  const { status, dateFrom, dateTo, ...rest } = req.query;
  
  // Build query filters based on parameters
  let query = supabaseAdmin.from('contact_messages')
    .select('*');
  
  if (status) {
    query = query.eq('status', status);
  }
  
  if (dateFrom) {
    query = query.gte('created_at', dateFrom);
  }
  
  if (dateTo) {
    query = query.lte('created_at', dateTo);
  }

  // Order by created_at in descending order
  query = query.order('created_at', { ascending: false });

  try {
    const { data, error } = await query;
    
    if (error) throw error;
    
    return res.json({
      success: true,
      data
    } satisfies ApiResponse<ContactMessage[]>);
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch contact messages'
    } satisfies ApiResponse);
  }
};

// Custom update handler for marking messages as read/replied
const updateMessage = async (req: express.Request, res: express.Response) => {
  const { id } = req.params;
  const updates = req.body;
  
  try {
    // Update message status
    const { data, error } = await supabaseAdmin
      .from('contact_messages')
      .update({
        ...updates,
        // If marking as replied, set replied_at timestamp
        ...(updates.status === 'replied' && { replied_at: new Date().toISOString() })
      })
      .eq('id', id)
      .select()
      .single();
      
    if (error) throw error;
    
    return res.json({
      success: true,
      data
    } satisfies ApiResponse<ContactMessage>);
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to update contact message'
    } satisfies ApiResponse);
  }
};

// GET /api/admin/contacts - List all messages with filtering
router.get('/', authenticateAdmin, getAllMessages);

// GET /api/admin/contacts/:id - Get single message
router.get('/:id', authenticateAdmin, getById);

// PUT /api/admin/contacts/:id - Update message status
router.put('/:id', [authenticateAdmin, validateRequestBody], updateMessage);

// DELETE /api/admin/contacts/:id - Delete message
router.delete('/:id', authenticateAdmin, remove);

export default router;