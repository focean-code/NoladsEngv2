export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  details?: string | Record<string, any>;
}

export interface ApiErrorResponse {
  success: false;
  error: string;
  details?: string | Record<string, any>;
}

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export interface ApiRequestConfig {
  method?: HttpMethod;
  headers?: Record<string, string>;
  body?: any;
  params?: Record<string, string | number | boolean | undefined>;
}

// Helper functions
export function isApiSuccessResponse<T>(response: ApiResponse<T>): response is ApiSuccessResponse<T> {
  return response.success === true;
}

export function isApiErrorResponse(response: ApiResponse): response is ApiErrorResponse {
  return response.success === false;
}
