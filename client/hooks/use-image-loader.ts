interface ImageOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png';
}

export function useImageLoader() {
  const optimizeImage = (url: string, options: ImageOptions = {}) => {
    if (!url) return '';
    
    // Return as is if it's an external URL
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }

    // Handle Supabase Storage paths like "images/filename.jpg"
    // Build a public URL so the <img> can load directly
    const supabaseUrl = (import.meta as any)?.env?.VITE_SUPABASE_URL || (globalThis as any)?.VITE_SUPABASE_URL;
    if (supabaseUrl) {
      // Normalize leading slashes
      const normalized = url.replace(/^\/+/, '');
      return `${supabaseUrl}/storage/v1/object/public/${normalized}`;
    }

    // Fallback: return the original relative path
    return url;
  };

  return { optimizeImage };
}
