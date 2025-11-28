import { useCallback } from 'react';
import { toast } from 'sonner';

export function useNotify() {
  const notify = useCallback((message: string) => {
    toast(message);
  }, []);

  const success = useCallback((title: string, description?: string) => {
    toast.success(description || title);
  }, []);

  const error = useCallback((title: string, description?: string) => {
    toast.error(description || title);
  }, []);

  const warning = useCallback((title: string, description?: string) => {
    toast.warning(description || title);
  }, []);

  const info = useCallback((title: string, description?: string) => {
    toast.info(description || title);
  }, []);

  return {
    notify,
    success,
    error,
    warning,
    info,
  };
}
