import type { Product as ServerProduct } from '@shared/api';

// Parsed version of the JSON strings in ServerProduct
interface ProductSpecifications {
  tags?: string[];
  badge?: string;
  rating?: number;
  reviews?: number;
  [key: string]: any;
}

// Extended product type with parsed fields and UI-specific additions
export interface ProductExtended {
  // Base fields from ServerProduct
  id: number;
  name: string;
  description?: string;
  price?: number;
  category?: string;
  image_url?: string;
  stock_quantity: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  
  // UI-specific fields
  image: string;           // Alias for image_url
  inStock: boolean;        // Computed from stock_quantity
  badge?: string;          // From specifications
  rating: number;          // From specifications
  reviews: number;         // From specifications
  tags: string[];          // From specifications
  
  // Parsed JSON fields
  images: string[];        // Parsed from images JSON string
  specifications: ProductSpecifications;  // Parsed from specifications JSON string
}
