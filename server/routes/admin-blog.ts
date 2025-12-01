import express from 'express';
import { supabaseAdmin } from '../supabaseAdmin.ts';
import type { BlogPost, ApiResponse } from '../../shared/index.ts';
import { authenticateAdmin, validateRequestBody, requestLogger } from '../middleware/admin.ts';
import { createCrudHandlers } from '../utils/crud-factory.ts';

const router = express.Router();

// Add logging middleware and CORS handling
router.use(requestLogger);
router.use((req, res, next) => {
  // Get allowed origins from environment
  const corsOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map(o => o.trim()).filter(Boolean)
    : ['http://localhost:5173', 'http://localhost:8080', 'http://localhost:3000'];
  
  const origin = req.get('origin');
  
  // Set CORS headers
  if (!origin || corsOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin || '*');
  }
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Max-Age', '3600');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Get CRUD handlers for blog posts
const {
  getAll,
  getById,
  create,
  update,
  remove
} = createCrudHandlers({
  tableName: 'blog_posts',
  supabase: supabaseAdmin
});

// Extend the standard getAll handler to add blog-specific filtering
const getAllPosts = async (req: express.Request, res: express.Response) => {
  const { category, tag, status, authorId, ...rest } = req.query;

  // Build query filters based on parameters
  let query = supabaseAdmin.from('blog_posts').select(`
      *,
      authors (
        id,
        name,
        avatar_url
      ),
      categories (
        id,
        name
      ),
      tags (
        id,
        name
      )
    `);
  
  if (category) {
    query = query.eq('category_id', category);
  }
  
  if (status) {
    query = query.eq('status', status);
  }
  
  if (authorId) {
    query = query.eq('author_id', authorId);
  }
  
  // Order by published_at or created_at
  query = query.order('published_at', { ascending: false, nullsFirst: false })
              .order('created_at', { ascending: false });

  try {
    const { data, error } = await query;
    
    if (error) throw error;
    
    // If tag filter is present, filter in memory (since tags are in an array)
    let filteredData = data;
    if (tag) {
      filteredData = data.filter(post => 
        post.tags?.some((t: any) => t.name === tag || t.id === tag)
      );
    }
    
    return res.json({
      success: true,
      data: filteredData
    } satisfies ApiResponse<BlogPost[]>);
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      error: error.message || 'Failed to fetch blog posts'
    } satisfies ApiResponse);
  }
};

// Custom create handler to handle relationships
const createPost = async (req: express.Request, res: express.Response) => {
  const { tags, ...postData } = req.body;

  try {
    // Start a transaction
    const { data, error } = await supabaseAdmin.rpc('create_blog_post', {
      post_data: postData,
      tag_ids: tags
    });

    if (error) throw error;

    return res.status(201).json({
      success: true,
      data
    } satisfies ApiResponse<BlogPost>);
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to create blog post'
    } satisfies ApiResponse);
  }
};

// Custom update handler to handle relationships
const updatePost = async (req: express.Request, res: express.Response) => {
  const { id } = req.params;
  const { tags, ...updates } = req.body;

  try {
    // Update post and relationships in a transaction
    const { data, error } = await supabaseAdmin.rpc('update_blog_post', {
      post_id: id,
      post_updates: updates,
      tag_ids: tags
    });

    if (error) throw error;

    return res.json({
      success: true,
      data
    } satisfies ApiResponse<BlogPost>);
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to update blog post'
    } satisfies ApiResponse);
  }
};

// GET /api/admin/blog - List all posts with advanced filtering
router.get('/', authenticateAdmin, getAllPosts);

// GET /api/admin/blog/:id - Get single post
router.get('/:id', authenticateAdmin, getById);

// POST /api/admin/blog - Create new post
router.post('/', [authenticateAdmin, validateRequestBody], createPost);

// PUT /api/admin/blog/:id - Update post
router.put('/:id', [authenticateAdmin, validateRequestBody], updatePost);

// DELETE /api/admin/blog/:id - Delete post
router.delete('/:id', authenticateAdmin, remove);

export default router;
