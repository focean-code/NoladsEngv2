import { PostgrestError } from '@supabase/supabase-js';
import type { ApiResponse } from '../../shared/index.ts';

export const handleDatabaseError = (error: PostgrestError, requestId: string, context: string) => {
  console.error(`[Admin ${requestId}] ${context}:`, {
    message: error.message,
    details: error.details,
    hint: error.hint,
    code: error.code,
  });
  return {
    success: false,
    error: context,
    details: error.message,
  } satisfies ApiResponse;
};

export const handleUnexpectedError = (error: Error, requestId: string, context: string) => {
  console.error(`[Admin ${requestId}] ${context}:`, {
    message: error.message,
    stack: error.stack,
    name: error.name,
  });
  return {
    success: false,
    error: context,
    details: error.message,
  } satisfies ApiResponse;
};