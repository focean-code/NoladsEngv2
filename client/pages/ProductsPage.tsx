import React, { useState, useEffect } from "react";
import { ImageUpload } from "../components/ImageUpload";
import eventBus, { CONTENT_UPDATED } from '../lib/eventBus';
import { useSEO } from "../hooks/useSEO";
// Using Product from our types folder instead of shared/api
import {
  Search,
  Filter,
  Grid3X3,
  List,
  ArrowRight,
  Package,
  Zap,
  Shield,
  Settings,
  Gauge,
  Wrench,
  Award,
  Star,
  ShoppingCart,
  Download,
  Eye,
  CheckCircle,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";
import ModernNavBar from "../components/ModernNavBar";
import { ModernButton } from "../components/ui/modern-button";
import {
  ModernCard,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
  CardGrid,
  ProductCard,
} from "../components/ui/modern-card";
import { ModernInput } from "../components/ui/modern-input";
import { QuoteRequestModal } from "../components/QuoteRequestModal";
import { ProductAdvancedFilters } from "../components/ProductAdvancedFilters";
import { StockAlertModal } from "../components/StockAlertModal";
import { ModernFooter } from "../components/ModernFooter";
import { api } from "../lib/api";
import { supabase } from "../lib/supabase";


import type { Product as ServerProduct } from '@shared/api';
import type { ProductExtended } from '../types/api-extensions';

interface Category {
  id: string;
  name: string;
  count: number;
}

interface NewProduct extends Omit<ProductExtended, 'id' | 'created_at' | 'updated_at'> {
  id?: number;
}

// Helper function to convert server product data to client format
const mapServerToClientProduct = (serverProduct: any): ProductExtended => {
  console.log('[ProductsPage] Mapping server product:', serverProduct);
  try {
    // Parse JSON strings
    let parsedImages: string[] = [];
    let parsedSpecifications: any = {};
    
    try {
      parsedImages = serverProduct.images ? JSON.parse(serverProduct.images) : [];
      console.log('[ProductsPage] Parsed images:', parsedImages);
    } catch (e) {
      console.warn('[ProductsPage] Error parsing images:', e);
    }
    
    try {
      parsedSpecifications = serverProduct.specifications ? JSON.parse(serverProduct.specifications) : {};
      console.log('[ProductsPage] Parsed specifications:', parsedSpecifications);
    } catch (e) {
      console.warn('[ProductsPage] Error parsing specifications:', e);
    }
    
    // Map to client product format
    const mappedProduct: ProductExtended = {
      id: serverProduct.id,
      name: serverProduct.name,
      description: serverProduct.description || '',
      price: serverProduct.price || 0,
      category: serverProduct.category || '',
      image_url: serverProduct.image_url || '',
      stock_quantity: serverProduct.stock_quantity || 0,
      is_active: serverProduct.is_active ?? true,
      created_at: serverProduct.created_at || new Date().toISOString(),
      updated_at: serverProduct.updated_at || new Date().toISOString(),
      // Extended fields
      image: serverProduct.image_url || '',
      inStock: (serverProduct.stock_quantity || 0) > 0,
      images: parsedImages,
      specifications: parsedSpecifications,
      tags: parsedSpecifications.tags || [],
      badge: parsedSpecifications.badge || '',
      rating: parsedSpecifications.rating || 0,
      reviews: parsedSpecifications.reviews || 0,
    };
    
    console.log('[ProductsPage] Mapped product:', mappedProduct);
    return mappedProduct;
  } catch (error) {
    console.error('[ProductsPage] Error mapping product:', error, serverProduct);
    throw error;
  }
};

function ProductsPage() {
  const [products, setProducts] = useState<ProductExtended[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // SEO optimization for products page
  useSEO({
    title: "Industrial Electrical Products Catalog | Nolads Engineering",
    description: "Browse our comprehensive catalog of industrial-grade electrical products. High-quality equipment for power systems, automation, safety solutions, and performance monitoring.",
    keywords: "electrical products, industrial equipment, power systems, automation equipment, electrical components, industrial automation, safety equipment",
    ogTitle: "Industrial Electrical Products - Power Your Success | Nolads Engineering",
    ogDescription: "Discover our range of industrial electrical products. From power distribution to automation solutions, find the right equipment for your industrial needs.",
    ogUrl: typeof window !== "undefined" ? window.location.href : undefined,
    structuredData: {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: "Industrial Electrical Products Catalog",
      description: "Comprehensive catalog of industrial electrical products and equipment",
      numberOfItems: products.length,
      itemListElement: products.map((product, index) => ({
        "@type": "Product",
        "@id": `${typeof window !== "undefined" ? window.location.origin : ""}/products/${product.id}`,
        position: index + 1,
        name: product.name,
        description: product.description,
        image: product.image_url || product.image,
        offers: {
          "@type": "Offer",
          price: product.price,
          priceCurrency: "USD",
          availability: product.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
        },
        aggregateRating: product.rating ? {
          "@type": "AggregateRating",
          ratingValue: product.rating,
          reviewCount: product.reviews || 0
        } : undefined
      }))
    }
  });
  const [viewMode, setViewMode] = useState("grid");
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(10000);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [stockAlertProduct, setStockAlertProduct] = useState<ProductExtended | null>(null);
  // Modal state for add/edit product
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [productImage, setProductImage] = useState<string>("");
  // Open modal for adding a new product
  const handleAddProduct = () => {
    setEditingProduct(null);
    setProductImage("");
    setShowProductModal(true);
  };

  // Open modal for editing an existing product
  const handleEditProduct = (product: any) => {
    setEditingProduct(product);
    setProductImage(product.image || "");
    setShowProductModal(true);
  };

  // Handle image upload callback
  const handleImageUpload = (images: any[]) => {
    if (images && images.length > 0) {
      setProductImage(images[0].url || images[0].src || "");
    }
  };

  // Save product (add or update)
  const handleSaveProduct = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const form = e.currentTarget;
      const formData = new FormData(form);

      console.log('[ProductsPage] Processing form data');
      const productData = {
        name: formData.get("name") as string,
        category: formData.get("category") as string,
        price: Number(formData.get("price")),
        image_url: productImage || "/placeholder.svg",
        description: formData.get("description") as string,
        stock_quantity: formData.get("inStock") === "on" ? 1 : 0,
        is_active: true,
        specifications: JSON.stringify({
          tags: (formData.get("tags") as string)?.split(",").map(t => t.trim()).filter(Boolean) || [],
          rating: Number(formData.get("rating")) || 0,
          reviews: Number(formData.get("reviews")) || 0,
          badge: formData.get("badge") as string
        })
      };
      if (editingProduct) {
        console.log('[ProductsPage] Updating product:', { id: editingProduct.id, data: productData });
        const response = await api.products.update(editingProduct.id, productData);
        console.log('[ProductsPage] Update response:', response);
        
        if (response.success && response.data) {
          const mappedProduct = mapServerToClientProduct(response.data);
          console.log('[ProductsPage] Mapped updated product:', mappedProduct);
          
          setProducts(prev => prev.map(p => 
            p.id === editingProduct.id ? mappedProduct : p
          ));
        }
      } else {
        console.log('[ProductsPage] Creating new product:', productData);
        const response = await api.products.create(productData);
        console.log('[ProductsPage] Create response:', response);
        
        if (response.success && response.data) {
          const mappedProduct = mapServerToClientProduct(response.data);
          console.log('[ProductsPage] Mapped new product:', mappedProduct);
          
          setProducts(prev => [mappedProduct, ...prev]);
        }
      }
      setShowProductModal(false);
      setEditingProduct(null);
      setProductImage("");
      
    } catch (error) {
      console.error('Error saving product:', error);
      // Handle error - maybe show error message to user
    } finally {
      setIsLoading(false);
    }
  };

  // Function to handle product updates after saving
  const handleProductUpdated = (updatedProduct: any) => {
    if (!updatedProduct) return;
    
    try {
      const mappedProduct = mapServerToClientProduct(updatedProduct);
      console.log('[ProductsPage] Updating products with:', mappedProduct);
      
      setProducts(prev => {
        const index = prev.findIndex(p => p.id === mappedProduct.id);
        if (index >= 0) {
          // Update existing product
          const newProducts = [...prev];
          newProducts[index] = mappedProduct;
          return newProducts;
        } else {
          // Add new product
          return [mappedProduct, ...prev];
        }
      });
    } catch (error) {
      console.error('[ProductsPage] Error handling product update:', error);
    }
  };

  const fetchProductsData = async () => {
    setIsLoading(true);
    try {
      console.log('[ProductsPage] Starting data fetch');
      
      // Try to get raw products data first to check if the database is accessible
      const { data: rawProducts, error: rawError } = await supabase
        .from('products')
        .select('*')
        .limit(1);
      
      console.log('[ProductsPage] Raw products test:', {
        success: !!rawProducts,
        error: rawError,
        count: rawProducts?.length
      });

      if (rawError) {
        throw new Error(`Database access error: ${rawError.message}`);
      }
      
      const params: any = {
        category: selectedCategory || undefined,
        search: searchTerm || undefined,
      };

      // Add optional parameters
      if (inStockOnly) params.inStock = true;
      if (sortBy) params.sortBy = sortBy;
      if (sortOrder) params.sortOrder = sortOrder;
      if (priceRange[0] > minPrice) params.minPrice = priceRange[0];
      if (priceRange[1] < maxPrice) params.maxPrice = priceRange[1];

      console.log('[ProductsPage] Fetching with params:', params);
      const response = await api.products.getAll(params);
      
      console.log('[ProductsPage] API Response:', {
        success: response.success,
        error: response.error,
        dataLength: response.data?.length,
        firstItem: response.data?.[0],
        rawResponse: response
      });
      
      if (response.error) {
        throw new Error(`API error: ${response.error}`);
      }
      
      if (response.success && Array.isArray(response.data)) {
        const extendedProducts = response.data.map((product: any) => {
          console.log('[ProductsPage] Processing product:', { 
            id: product.id, 
            name: product.name,
            category: product.category,
            is_active: product.is_active,
            images: product.images,
            specifications: product.specifications,
            rawProduct: product
          });
          return mapServerToClientProduct(product as ServerProduct);
        });
        console.log('[ProductsPage] Successfully mapped products:', {
          count: extendedProducts.length,
          firstProduct: extendedProducts[0]
        });
        setProducts(extendedProducts);
        
        // Extract categories from products
        const cats = Array.from(
          new Set(extendedProducts.map(p => p.category))
        ).map((cat: string) => ({
          id: cat,
          name: cat.charAt(0).toUpperCase() + cat.slice(1),
          count: extendedProducts.filter(p => p.category === cat).length,
        }));
        setCategories(cats);
      } else {
        setProducts([]);
        setCategories([]);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
      setCategories([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProductsData();

    // Subscribe to product updates
    const unsubscribe = eventBus.subscribe(CONTENT_UPDATED.PRODUCTS, () => {
      fetchProductsData();
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Filter products by search and category
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      !selectedCategory || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Product selection handler
  const handleProductSelect = (id: number) => {
    setSelectedProducts((prev) =>
      prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id]
    );
  };

  return (
    <div className="bg-white">
      <ModernNavBar />
      {/* Add Product Button */}
      <div className="container py-4 flex justify-end">
        <ModernButton variant="primary" onClick={handleAddProduct}>
          Add Product
        </ModernButton>
      </div>
      {/* Product Add/Edit Modal */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <form
            className="bg-white rounded-xl shadow-xl p-8 w-full max-w-lg relative"
            onSubmit={handleSaveProduct}
          >
            <button
              type="button"
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700"
              onClick={() => setShowProductModal(false)}
            >
              <X className="w-6 h-6" />
            </button>
            <h2 className="text-2xl font-bold mb-6">
              {editingProduct ? "Edit Product" : "Add Product"}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  name="name"
                  defaultValue={editingProduct?.name || ""}
                  required
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <input
                  name="category"
                  defaultValue={editingProduct?.category || ""}
                  required
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Price</label>
                <input
                  name="price"
                  type="number"
                  min="0"
                  step="0.01"
                  defaultValue={editingProduct?.price || 0}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  name="description"
                  defaultValue={editingProduct?.description || ""}
                  className="w-full border rounded px-3 py-2"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Badge</label>
                <input
                  name="badge"
                  defaultValue={editingProduct?.badge || ""}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">Rating</label>
                  <input
                    name="rating"
                    type="number"
                    min="0"
                    max="5"
                    step="0.1"
                    defaultValue={editingProduct?.rating || 0}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">Reviews</label>
                  <input
                    name="reviews"
                    type="number"
                    min="0"
                    defaultValue={editingProduct?.reviews || 0}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Tags (comma separated)</label>
                <input
                  name="tags"
                  defaultValue={editingProduct?.tags?.join(", ") || ""}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">In Stock</label>
                <input
                  name="inStock"
                  type="checkbox"
                  defaultChecked={editingProduct?.inStock || false}
                  className="ml-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Product Image</label>
                <ImageUpload
                  onUpload={handleImageUpload}
                  multiple={false}
                  className="mb-2"
                />
                {productImage && (
                  <img src={productImage} alt="Product" className="w-32 h-32 object-cover rounded mt-2" />
                )}
              </div>
            </div>
            <div className="flex justify-end mt-6 gap-2">
              <button
                type="button"
                className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
                onClick={() => setShowProductModal(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
              >
                Save Product
              </button>
            </div>
          </form>
        </div>
      )}
      {/* Hero Section */}
      <section className="section bg-slate-50 pt-24">
        <div className="container">
          <div className="text-center mb-16 animate-fade-in">
            <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Package className="w-4 h-4" />
              Product Catalog
            </div>
            <h1 className="type-h2 font-bold text-slate-900 mb-6">
              Industrial-Grade
              <span className="text-blue-600"> Electrical Products</span>
            </h1>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Discover our comprehensive range of electrical products designed
              for demanding industrial environments. Built for reliability,
              safety, and performance.
            </p>
          </div>
        </div>
      </section>
      {/* Search and Filters */}
      <section className="py-8 bg-white border-b border-slate-200">
        <div className="container">
          {/* ...existing code for search, filters, and controls... */}
          <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
            {/* Search */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <ModernInput
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            {/* Controls */}
            <div className="flex items-center gap-4">
              <ModernButton
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="w-4 h-4" />
                Filters
              </ModernButton>
              <div className="flex border border-slate-300 rounded-lg">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-l-lg transition-colors ${
                    viewMode === "grid"
                      ? "bg-blue-600 text-white"
                      : "bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-r-lg transition-colors ${
                    viewMode === "list"
                      ? "bg-blue-600 text-white"
                      : "bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
              {selectedProducts.length > 0 && (
                <ModernButton 
                  variant="primary"
                  onClick={() => setIsQuoteModalOpen(true)}
                >
                  <ShoppingCart className="w-4 h-4" />
                  Quote {selectedProducts.length} Items
                </ModernButton>
              )}
            </div>
          </div>
          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-6 p-6 bg-slate-50 rounded-lg animate-fade-in">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Categories */}
                <div>
                  <h3 className="font-semibold text-slate-900 mb-4">Categories</h3>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.id)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          selectedCategory === category.id
                            ? "bg-blue-600 text-white"
                            : "bg-white text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        {category.name} ({category.count})
                      </button>
                    ))}
                  </div>
                </div>

                {/* Advanced Filters */}
                <div>
                  <ProductAdvancedFilters
                    minPrice={minPrice}
                    maxPrice={maxPrice}
                    priceRange={priceRange}
                    onPriceRangeChange={setPriceRange}
                    inStockOnly={inStockOnly}
                    onInStockChange={setInStockOnly}
                    sortBy={sortBy}
                    onSortChange={setSortBy}
                    sortOrder={sortOrder}
                    onSortOrderChange={setSortOrder}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
      {/* Products Grid/List */}
      <section className="section">
        <div className="container">
          <div className="flex items-center justify-between mb-8">
            <p className="text-slate-600">
              Showing {filteredProducts.length} products
            </p>
          </div>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : viewMode === "grid" ? (
            <CardGrid cols={4} gap="default">
              {filteredProducts.map((product, index) => (
                product && typeof product.rating !== "undefined" ? (
                  <div
                    key={product.id}
                    className="animate-slide-up"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <ModernCard
                      variant={
                        selectedProducts.includes(product.id)
                          ? "featured"
                          : "default"
                      }
                      className="h-full group relative overflow-hidden card-md"
                    >
                      {/* Badge */}
                      {product.badge && (
                        <div className="absolute top-4 left-4 z-10">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              product.badge === "Popular"
                                ? "bg-blue-100 text-blue-700"
                                : product.badge === "New"
                                  ? "bg-emerald-100 text-emerald-700"
                                  : product.badge === "Advanced"
                                    ? "bg-violet-100 text-violet-700"
                                    : "bg-orange-100 text-orange-700"
                            }`}
                          >
                            {product.badge}
                          </span>
                        </div>
                      )}
                      {/* Image */}
                      <div className="relative overflow-hidden rounded-t-xl">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-36 object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors text-sm">
                            {product.name}
                          </h3>
                          <div className="flex items-center gap-1 text-xs">
                            <Star className="w-3 h-3 text-yellow-400 fill-current" />
                            <span className="text-slate-600">
                              {product.rating}
                            </span>
                          </div>
                        </div>
                        <p className="text-slate-600 text-xs mb-3 line-clamp-2">
                          {product.description}
                        </p>
                        <div className="flex items-center gap-2 mb-3">
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              product.inStock
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {product.inStock ? "In Stock" : "Out of Stock"}
                          </span>
                          <span className="text-xs text-slate-500">
                            {product.reviews} reviews
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-bold text-blue-600">
                            KSH {product.price.toLocaleString()}
                          </span>
                          <div className="flex gap-1">
                            <ModernButton
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => {
                                // Handle view details
                              }}
                            >
                              <Eye className="w-3 h-3" />
                            </ModernButton>
                            <ModernButton
                              variant={
                                selectedProducts.includes(product.id)
                                  ? "primary"
                                  : "outline"
                              }
                              size="sm"
                              className="text-xs px-2 py-1 h-8"
                              onClick={() => handleProductSelect(product.id)}
                            >
                              {selectedProducts.includes(product.id) ? (
                                <>
                                  <CheckCircle className="w-3 h-3" />
                                  Selected
                                </>
                              ) : (
                                <>
                                  <ShoppingCart className="w-3 h-3" />
                                  Select
                                </>
                              )}
                            </ModernButton>
                          </div>
                        </div>
                      </CardContent>
                    </ModernCard>
                  </div>
                ) : null
              ))}
            </CardGrid>
          ) : (
            <div className="space-y-6">
              {filteredProducts.map((product, index) => (
                <ModernCard
                  key={product.id}
                  variant={
                    selectedProducts.includes(product.id)
                      ? "featured"
                      : "default"
                  }
                  className="animate-slide-up card-md"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <CardContent className="p-6">
                    <div className="flex gap-6">
                      <div className="relative flex-shrink-0">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-32 h-32 object-cover rounded-lg"
                        />
                        {product.badge && (
                          <span
                            className={`absolute -top-2 -right-2 px-2 py-1 rounded-full text-xs font-medium ${
                              product.badge === "Popular"
                                ? "bg-blue-100 text-blue-700"
                                : product.badge === "New"
                                  ? "bg-emerald-100 text-emerald-700"
                                  : "bg-violet-100 text-violet-700"
                            }`}
                          >
                            {product.badge}
                          </span>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-xl font-semibold text-slate-900">
                            {product.name}
                          </h3>
                          <span className="text-2xl font-bold text-blue-600">
                            ${product.price.toLocaleString()}
                          </span>
                        </div>
                        <p className="text-slate-600 mb-4">
                          {product.description}
                        </p>
                        <div className="flex items-center gap-4 mb-4">
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                            <span className="text-slate-600">
                              {product.rating}
                            </span>
                            <span className="text-slate-500">
                              ({product.reviews} reviews)
                            </span>
                          </div>
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              product.inStock
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {product.inStock ? "In Stock" : "Out of Stock"}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2 mb-4">
                          {product.tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                        <div className="flex items-center gap-3">
                          <ModernButton variant="outline" size="sm">
                            <Eye className="w-4 h-4" />
                            View Details
                          </ModernButton>
                          <ModernButton
                            variant={
                              selectedProducts.includes(product.id)
                                ? "primary"
                                : "outline"
                            }
                            size="sm"
                            onClick={() => handleProductSelect(product.id)}
                          >
                            {selectedProducts.includes(product.id) ? (
                              <>
                                <CheckCircle className="w-4 h-4" />
                                Selected
                              </>
                            ) : (
                              <>
                                <ShoppingCart className="w-4 h-4" />
                                Add to Quote
                              </>
                            )}
                          </ModernButton>
                          <ModernButton variant="ghost" size="sm">
                            <Download className="w-4 h-4" />
                            Datasheet
                          </ModernButton>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </ModernCard>
              ))}
            </div>
          )}
        </div>
      </section>
      {/* CTA Section */}
      <section className="section bg-blue-600">
        <div className="container text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="type-h2 font-bold text-white mb-6">
              Need Custom Solutions?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Can't find exactly what you need? Our engineering team can design
              and manufacture custom electrical products tailored to your
              specific requirements.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <ModernButton
                variant="secondary"
                size="lg"
                className="bg-white text-blue-600 hover:bg-blue-50"
                onClick={() => setIsQuoteModalOpen(true)}
              >
                <ShoppingCart className="w-5 h-5" />
                Get a Free Quote
              </ModernButton>
              <Link to="/services">
                <ModernButton
                  variant="outline"
                  size="lg"
                  className="border-white text-white hover:bg-white hover:text-blue-600"
                >
                  Explore Services
                  <ArrowRight className="w-5 h-5" />
                </ModernButton>
              </Link>
            </div>
          </div>
        </div>
      </section>
      {/* Footer */}
      <ModernFooter />

      {/* Footer content */}

      {/* Stock Alert Modal */}
      {stockAlertProduct && (
        <StockAlertModal
          isOpen={true}
          onClose={() => setStockAlertProduct(null)}
          productId={stockAlertProduct.id}
          productName={stockAlertProduct.name}
        />
      )}

      {/* Quote Request Modal */}
      {isQuoteModalOpen && (
        <QuoteRequestModal
          isOpen={true}
          onClose={() => setIsQuoteModalOpen(false)}
          items={selectedProducts.length > 0 
            ? products.filter(p => selectedProducts.includes(p.id))
                .map(p => ({ id: p.id, name: p.name, description: p.description }))
            : []
          }
          type="product"
          onSubmit={async (data) => {
            try {
              await api.quotes.create(data);
              setIsQuoteModalOpen(false);
              setSelectedProducts([]);
            } catch (error) {
              console.error('Error submitting quote:', error);
            }
          }}
        />
      )}
    </div>
  );
}

export default ProductsPage;
