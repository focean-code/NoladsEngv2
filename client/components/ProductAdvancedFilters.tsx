import React from 'react';
import { ArrowUpDown, SortAsc, SortDesc } from 'lucide-react';
import { cn } from '../lib/utils';
import { Slider } from './ui/slider';
import { Switch } from './ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import type { ComponentPropsWithRef } from 'react';

interface ProductAdvancedFiltersProps extends ComponentPropsWithRef<'div'> {
  minPrice: number;
  maxPrice: number;
  priceRange: [number, number];
  onPriceRangeChange: (range: [number, number]) => void;
  inStockOnly: boolean;
  onInStockChange: (checked: boolean) => void;
  sortBy: string;
  onSortChange: (value: string) => void;
  sortOrder: 'asc' | 'desc';
  onSortOrderChange: (value: 'asc' | 'desc') => void;
}

const sortOptions = [
  { value: 'created_at', label: 'Date Added' },
  { value: 'name', label: 'Name' },
  { value: 'price', label: 'Price' },
  { value: 'views', label: 'Popularity' },
  { value: 'stock_quantity', label: 'Stock Level' },
];

export const ProductAdvancedFilters: React.FC<ProductAdvancedFiltersProps> = ({
  minPrice,
  maxPrice,
  priceRange,
  onPriceRangeChange,
  inStockOnly,
  onInStockChange,
  sortBy,
  onSortChange,
  sortOrder,
  onSortOrderChange,
  className,
  ...props
}) => {
  return (
    <div className={cn("space-y-6", className)} {...props}>
      {/* Price Range Filter */}
      <div>
        <h3 className="font-semibold text-slate-900 mb-4">Price Range</h3>
        <div className="px-2">
          <Slider
            min={minPrice}
            max={maxPrice}
            step={1}
            value={priceRange}
            onValueChange={onPriceRangeChange}
            className="my-6"
          />
          <div className="flex items-center justify-between text-sm text-slate-600">
            <span>KSH {priceRange[0]}</span>
            <span>KSH {priceRange[1]}</span>
          </div>
        </div>
      </div>

      {/* Stock Filter */}
      <div>
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-slate-900">In Stock Only</h3>
          <Switch
            checked={inStockOnly}
            onCheckedChange={onInStockChange}
          />
        </div>
      </div>

      {/* Sort Controls */}
      <div>
        <h3 className="font-semibold text-slate-900 mb-4">Sort By</h3>
        <div className="flex gap-4">
          <div className="flex-1">
            <Select value={sortBy} onValueChange={onSortChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Sort by..." />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Select value={sortOrder} onValueChange={onSortOrderChange}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Order" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="asc">
                <div className="flex items-center gap-2">
                  <SortAsc className="w-4 h-4" />
                  Ascending
                </div>
              </SelectItem>
              <SelectItem value="desc">
                <div className="flex items-center gap-2">
                  <SortDesc className="w-4 h-4" />
                  Descending
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
