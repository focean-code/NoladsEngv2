export interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  image: string;
  description: string;
  badge?: string;
  stock_quantity: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  tags: string[];
  inStock: boolean;
  rating?: number;
  reviews?: number;
}
