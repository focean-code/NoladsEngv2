import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ImageUpload } from '@/components/ImageUpload';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';
import { Service, Product, Quote, Image } from '@shared/api';

const DatabaseDemo: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Form states
  const [newService, setNewService] = useState({
    name: '',
    description: '',
    price_range: '',
    category: ''
  });

  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    stock_quantity: ''
  });

  const [newQuote, setNewQuote] = useState({
    project_name: '',
    description: '',
    budget_range: '',
    timeline: ''
  });

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [servicesRes, productsRes, quotesRes] = await Promise.all([
        api.services.getAll({ limit: 10 }),
        api.products.getAll({ limit: 10 }),
        api.quotes.getAll({ limit: 10 })
      ]);

      setServices(servicesRes.data || []);
      setProducts(productsRes.data || []);
      setQuotes(quotesRes.data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateService = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await api.services.create(newService);
      setServices(prev => [response.data!, ...prev]);
      setNewService({ name: '', description: '', price_range: '', category: '' });
      toast({
        title: "Success",
        description: "Service created successfully!"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create service",
        variant: "destructive"
      });
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const productData = {
        ...newProduct,
        price: newProduct.price ? parseFloat(newProduct.price) : undefined,
        stock_quantity: newProduct.stock_quantity ? parseInt(newProduct.stock_quantity) : 0
      };
      const response = await api.products.create(productData);
      setProducts(prev => [response.data!, ...prev]);
      setNewProduct({ name: '', description: '', price: '', category: '', stock_quantity: '' });
      toast({
        title: "Success",
        description: "Product created successfully!"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create product",
        variant: "destructive"
      });
    }
  };

  const handleCreateQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await api.quotes.create(newQuote);
      setQuotes(prev => [response.data!, ...prev]);
      setNewQuote({ project_name: '', description: '', budget_range: '', timeline: '' });
      toast({
        title: "Success",
        description: "Quote request created successfully!"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create quote request",
        variant: "destructive"
      });
    }
  };

  const handleImageUpload = (images: Image[]) => {
    toast({
      title: "Success",
      description: `${images.length} image(s) uploaded successfully!`
    });
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Database Demo</h1>
        <p className="text-gray-600">Test the SQLite database functionality</p>
      </div>

      <Tabs defaultValue="services" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="quotes">Quotes</TabsTrigger>
          <TabsTrigger value="images">Images</TabsTrigger>
          <TabsTrigger value="overview">Overview</TabsTrigger>
        </TabsList>

        <TabsContent value="services" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Create Service</CardTitle>
                <CardDescription>Add a new service to the database</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateService} className="space-y-4">
                  <div>
                    <Label htmlFor="service-name">Service Name</Label>
                    <Input
                      id="service-name"
                      value={newService.name}
                      onChange={(e) => setNewService(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Web Development"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="service-desc">Description</Label>
                    <Textarea
                      id="service-desc"
                      value={newService.description}
                      onChange={(e) => setNewService(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe the service..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="service-price">Price Range</Label>
                    <Input
                      id="service-price"
                      value={newService.price_range}
                      onChange={(e) => setNewService(prev => ({ ...prev, price_range: e.target.value }))}
                      placeholder="1,000 - 10,000 KSH"
                    />
                  </div>
                  <div>
                    <Label htmlFor="service-category">Category</Label>
                    <Select onValueChange={(value) => setNewService(prev => ({ ...prev, category: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="development">Development</SelectItem>
                        <SelectItem value="design">Design</SelectItem>
                        <SelectItem value="consulting">Consulting</SelectItem>
                        <SelectItem value="marketing">Marketing</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="submit" className="w-full">Create Service</Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Services List</CardTitle>
                <CardDescription>Current services in the database</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {loading ? (
                    <p className="text-center text-gray-500">Loading...</p>
                  ) : services.length === 0 ? (
                    <p className="text-center text-gray-500">No services yet</p>
                  ) : (
                    services.map((service) => (
                      <div key={service.id} className="p-3 border rounded-lg">
                        <h4 className="font-medium">{service.name}</h4>
                        <p className="text-sm text-gray-600">{service.description}</p>
                        <div className="flex justify-between items-center mt-2">
                          <Badge variant="secondary">{service.category}</Badge>
                          <span className="text-sm text-green-600">{service.price_range}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="products" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Create Product</CardTitle>
                <CardDescription>Add a new product to the database</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateProduct} className="space-y-4">
                  <div>
                    <Label htmlFor="product-name">Product Name</Label>
                    <Input
                      id="product-name"
                      value={newProduct.name}
                      onChange={(e) => setNewProduct(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Website Template"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="product-desc">Description</Label>
                    <Textarea
                      id="product-desc"
                      value={newProduct.description}
                      onChange={(e) => setNewProduct(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe the product..."
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="product-price">Price</Label>
                      <Input
                        id="product-price"
                        type="number"
                        step="0.01"
                        value={newProduct.price}
                        onChange={(e) => setNewProduct(prev => ({ ...prev, price: e.target.value }))}
                        placeholder="99.99"
                      />
                    </div>
                    <div>
                      <Label htmlFor="product-stock">Stock</Label>
                      <Input
                        id="product-stock"
                        type="number"
                        value={newProduct.stock_quantity}
                        onChange={(e) => setNewProduct(prev => ({ ...prev, stock_quantity: e.target.value }))}
                        placeholder="100"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="product-category">Category</Label>
                    <Select onValueChange={(value) => setNewProduct(prev => ({ ...prev, category: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="templates">Templates</SelectItem>
                        <SelectItem value="plugins">Plugins</SelectItem>
                        <SelectItem value="tools">Tools</SelectItem>
                        <SelectItem value="assets">Assets</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="submit" className="w-full">Create Product</Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Products List</CardTitle>
                <CardDescription>Current products in the database</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {loading ? (
                    <p className="text-center text-gray-500">Loading...</p>
                  ) : products.length === 0 ? (
                    <p className="text-center text-gray-500">No products yet</p>
                  ) : (
                    products.map((product) => (
                      <div key={product.id} className="p-3 border rounded-lg">
                        <h4 className="font-medium">{product.name}</h4>
                        <p className="text-sm text-gray-600">{product.description}</p>
                        <div className="flex justify-between items-center mt-2">
                          <Badge variant="secondary">{product.category}</Badge>
                          <div className="text-right">
                            <p className="text-sm text-green-600">KSH {product.price}</p>
                            <p className="text-xs text-gray-500">Stock: {product.stock_quantity}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="quotes" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Create Quote Request</CardTitle>
                <CardDescription>Submit a new quote request</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateQuote} className="space-y-4">
                  <div>
                    <Label htmlFor="quote-project">Project Name</Label>
                    <Input
                      id="quote-project"
                      value={newQuote.project_name}
                      onChange={(e) => setNewQuote(prev => ({ ...prev, project_name: e.target.value }))}
                      placeholder="My Website Project"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="quote-desc">Project Description</Label>
                    <Textarea
                      id="quote-desc"
                      value={newQuote.description}
                      onChange={(e) => setNewQuote(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe your project requirements..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="quote-budget">Budget Range</Label>
                    <Select onValueChange={(value) => setNewQuote(prev => ({ ...prev, budget_range: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select budget range" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1,000 - 5,000 KSH">1,000 - 5,000 KSH</SelectItem>
                        <SelectItem value="5,000 - 10,000 KSH">5,000 - 10,000 KSH</SelectItem>
                        <SelectItem value="10,000 - 25,000 KSH">10,000 - 25,000 KSH</SelectItem>
                        <SelectItem value="25,000+ KSH">25,000+ KSH</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="quote-timeline">Timeline</Label>
                    <Select onValueChange={(value) => setNewQuote(prev => ({ ...prev, timeline: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select timeline" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1-2 weeks">1-2 weeks</SelectItem>
                        <SelectItem value="1 month">1 month</SelectItem>
                        <SelectItem value="2-3 months">2-3 months</SelectItem>
                        <SelectItem value="3+ months">3+ months</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="submit" className="w-full">Submit Quote Request</Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quote Requests</CardTitle>
                <CardDescription>Recent quote requests</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {loading ? (
                    <p className="text-center text-gray-500">Loading...</p>
                  ) : quotes.length === 0 ? (
                    <p className="text-center text-gray-500">No quotes yet</p>
                  ) : (
                    quotes.map((quote) => (
                      <div key={quote.id} className="p-3 border rounded-lg">
                        <h4 className="font-medium">{quote.project_name}</h4>
                        <p className="text-sm text-gray-600">{quote.description}</p>
                        <div className="flex justify-between items-center mt-2">
                          <Badge 
                            variant={quote.status === 'pending' ? 'secondary' : 
                                    quote.status === 'approved' ? 'default' : 'destructive'}
                          >
                            {quote.status}
                          </Badge>
                          <div className="text-right text-sm text-gray-500">
                            <p>{quote.budget_range}</p>
                            <p>{quote.timeline}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="images" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Image Upload</CardTitle>
              <CardDescription>Test image upload and storage functionality</CardDescription>
            </CardHeader>
            <CardContent>
              <ImageUpload 
                onUpload={handleImageUpload}
                multiple={true}
                maxFiles={5}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Services</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">{services.length}</div>
                <p className="text-sm text-gray-600">Total services</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Products</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">{products.length}</div>
                <p className="text-sm text-gray-600">Total products</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Quotes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-orange-600">{quotes.length}</div>
                <p className="text-sm text-gray-600">Quote requests</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Database Status</CardTitle>
              <CardDescription>SQLite database is ready and operational</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Database Type:</span>
                  <Badge>SQLite</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Image Processing:</span>
                  <Badge>Sharp (WebP optimization)</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Validation:</span>
                  <Badge>Zod schemas</Badge>
                </div>
                <div className="flex justify-between">
                  <span>File Uploads:</span>
                  <Badge>Multer + Sharp</Badge>
                </div>
              </div>
              <Button onClick={loadData} className="w-full mt-4">
                Refresh Data
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DatabaseDemo;