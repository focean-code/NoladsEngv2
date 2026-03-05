import type { SupabaseClient } from '@supabase/supabase-js';
import type { ApiResponse } from '../../shared/index.ts';
import { handleDatabaseError, handleUnexpectedError } from './error-handlers.ts';
import express from 'express';

interface CrudOptions {
  tableName: string;
  supabase: SupabaseClient;
}

interface PaginationParams {
  page?: string;
  limit?: string;
}

export const createCrudHandlers = ({ tableName, supabase }: CrudOptions) => {
  const getAll = async (req: express.Request, res: express.Response) => {
    const { requestId } = res.locals;
    const { search, page = '1', limit = '10', ...filters } = req.query as PaginationParams & Record<string, string>;

    try {
      let query = supabase.from(tableName).select('*');

      // Apply any additional filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          query = query.eq(key, value);
        }
      });

      // Handle pagination
      const pageNum = Math.max(1, parseInt(page, 10));
      const pageSize = Math.max(1, Math.min(100, parseInt(limit, 10)));
      const from = (pageNum - 1) * pageSize;
      const to = from + pageSize - 1;

      // Get total count
      const { count, error: countError } = await supabase
        .from(tableName)
        .select('*', { count: 'exact', head: true });

      if (countError) {
        return res.status(500).json(handleDatabaseError(countError, requestId, 'Failed to fetch total count'));
      }

      const total = count || 0;

      // Execute final query with pagination
      const { data, error } = await query
        .range(from, to)
        .order('created_at', { ascending: false });

      if (error) {
        return res.status(500).json(handleDatabaseError(error, requestId, `Failed to fetch ${tableName}`));
      }

      const response: ApiResponse = {
        success: true,
        data,
        pagination: {
          page: pageNum,
          limit: pageSize,
          total,
          pages: Math.ceil(total / pageSize),
        },
      };

      return res.json(response);
    } catch (error: any) {
      return res.status(500).json(handleUnexpectedError(error, requestId, `Error fetching ${tableName}`));
    }
  };

  const getById = async (req: express.Request, res: express.Response) => {
    const { requestId } = res.locals;
    const { id } = req.params;

    try {
      const parsedId = parseInt(id, 10);
      if (!Number.isFinite(parsedId)) {
        return res.status(400).json({
          success: false,
          error: 'ID must be a valid number',
        } satisfies ApiResponse);
      }

      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .eq('id', parsedId)
        .single();

      if (error) {
        return res.status(500).json(handleDatabaseError(error, requestId, `Failed to fetch ${tableName}`));
      }

      if (!data) {
        return res.status(404).json({
          success: false,
          error: 'Not found',
        } satisfies ApiResponse);
      }

      return res.json({
        success: true,
        data,
      } satisfies ApiResponse);
    } catch (error: any) {
      return res.status(500).json(handleUnexpectedError(error, requestId, `Error fetching ${tableName}`));
    }
  };

  const create = async (req: express.Request, res: express.Response) => {
    const { requestId } = res.locals;

    try {
      const { data, error } = await supabase
        .from(tableName)
        .insert([req.body])
        .select()
        .single();

      if (error) {
        return res.status(400).json(handleDatabaseError(error, requestId, `Failed to create ${tableName}`));
      }

      return res.status(201).json({
        success: true,
        data,
      } satisfies ApiResponse);
    } catch (error: any) {
      return res.status(500).json(handleUnexpectedError(error, requestId, `Error creating ${tableName}`));
    }
  };

  const update = async (req: express.Request, res: express.Response) => {
    const { requestId } = res.locals;
    const { id } = req.params;

    try {
      const parsedId = parseInt(id, 10);
      if (!Number.isFinite(parsedId)) {
        return res.status(400).json({
          success: false,
          error: 'ID must be a valid number',
        } satisfies ApiResponse);
      }

      // Check if exists
      const { data: existing, error: checkError } = await supabase
        .from(tableName)
        .select('id')
        .eq('id', parsedId)
        .single();

      if (checkError) {
        return res.status(500).json(handleDatabaseError(checkError, requestId, `Failed to check ${tableName} existence`));
      }

      if (!existing) {
        return res.status(404).json({
          success: false,
          error: 'Not found',
        } satisfies ApiResponse);
      }

      // Perform update
      const { data, error } = await supabase
        .from(tableName)
        .update(req.body)
        .eq('id', parsedId)
        .select()
        .single();

      if (error) {
        return res.status(400).json(handleDatabaseError(error, requestId, `Failed to update ${tableName}`));
      }

      return res.json({
        success: true,
        data,
      } satisfies ApiResponse);
    } catch (error: any) {
      return res.status(500).json(handleUnexpectedError(error, requestId, `Error updating ${tableName}`));
    }
  };

  const remove = async (req: express.Request, res: express.Response) => {
    const { requestId } = res.locals;
    const { id } = req.params;

    try {
      const parsedId = parseInt(id, 10);
      if (!Number.isFinite(parsedId)) {
        return res.status(400).json({
          success: false,
          error: 'ID must be a valid number',
        } satisfies ApiResponse);
      }

      // Check if exists
      const { data: existing, error: checkError } = await supabase
        .from(tableName)
        .select('id')
        .eq('id', parsedId)
        .single();

      if (checkError) {
        return res.status(500).json(handleDatabaseError(checkError, requestId, `Failed to check ${tableName} existence`));
      }

      if (!existing) {
        return res.status(404).json({
          success: false,
          error: 'Not found',
        } satisfies ApiResponse);
      }

      // Perform deletion
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', parsedId);

      if (error) {
        return res.status(400).json(handleDatabaseError(error, requestId, `Failed to delete ${tableName}`));
      }

      return res.json({
        success: true,
        data: { message: `${tableName} deleted successfully` },
      } satisfies ApiResponse);
    } catch (error: any) {
      return res.status(500).json(handleUnexpectedError(error, requestId, `Error deleting ${tableName}`));
    }
  };

  return {
    getAll,
    getById,
    create,
    update,
    remove,
  };
};