import React, { useState, useEffect } from "react";
import { Bar, Pie, Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, PointElement, LineElement, Tooltip, Legend } from 'chart.js';
ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, PointElement, LineElement, Tooltip, Legend);
import eventBus, { CONTENT_UPDATED } from "../lib/eventBus";
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  Download,
  Upload,
  Settings,
  Users,
  Package,
  FileText,
  BarChart3,
  Calendar,
  DollarSign,
  TrendingUp,
  Eye,
  CheckCircle,
  X,
  Save,
  ArrowRight,
  Zap,
  Shield,
  Gauge,
  Building,
  LogOut,
  User,
  MessageSquare,
  Star,
} from "lucide-react";
import { Link } from "react-router-dom";
import ModernNavBar from "../components/ModernNavBar";
import { ModernButton } from "../components/ui/modern-button";
import { useAuth } from "../hooks/useAuth";
import { debugAuth } from "../lib/auth-debug";
import {
  ModernCard,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardGrid,
} from "../components/ui/modern-card";
import { ModernInput, ModernTextarea } from "../components/ui/modern-input";
import { Service, Product, Quote, ContactMessage, Testimonial, User as UserType, BlogPost } from "../../shared/api";
import { toast } from "sonner";
import { api } from "../lib/api";
import { GA4Dashboard } from "@/components/GA4Dashboard";
import { supabase } from "../lib/supabase";

const AdminPage = () => {
  // ...existing code...
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [searchTerm, setSearchTerm] = useState("");
  const [editingItem, setEditingItem] = useState<any>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [modalType, setModalType] = useState<'services' | 'products' | 'quotes' | 'users' | 'contacts' | 'contact' | 'testimonials' | 'blog' | "">("");
  const [loading, setLoading] = useState(false);
  const [filteredData, setFilteredData] = useState<any>({
    services: [],
    products: [],
    quotes: [],
    users: []
  });
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<any>({
    status: '',
    category: '',
    dateRange: '',
    active: ''
  });

  // Real state for API data
  const [services, setServices] = useState<Service[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [users, setUsers] = useState<UserType[]>([]);
  const [contacts, setContacts] = useState<ContactMessage[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [stats, setStats] = useState({
    totalServices: 0,
    totalProducts: 0,
    totalQuotes: 0,
    totalUsers: 0,
    recentQuotes: 0,
    activeServices: 0,
    totalPosts: 0,
    publishedPosts: 0,
    revenue: 0,
    growthRate: 0
  });
  const [analyticsData, setAnalyticsData] = useState<any>(null);

  // API functions
  const fetchServices = async () => {
    try {
      setLoading(true);
      const res = await api.services.getAll();
      if (res.success) {
        const data = res.data || [];
        setServices(data);
        setFilteredData(prev => ({ ...prev, services: data }));
        setStats(prev => ({ ...prev, totalServices: data.length, activeServices: data.filter((s: Service) => s.is_active).length }));
      }
    } catch (error) {
      console.error('Error fetching services:', error);
      toast.error('Failed to load services');
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async (search?: string) => {
    try {
      setLoading(true);
      const res = await api.products.getAll({ search });
      if (res.success) {
        const data = res.data || [];
        setProducts(data);
        setFilteredData(prev => ({ ...prev, products: data }));
        setStats(prev => ({ ...prev, totalProducts: data.length }));
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const fetchQuotes = async (search?: string) => {
    try {
      setLoading(true);
      const res = await api.quotes.getAll();
      if (res.success) {
        const data = (res.data || []) as Quote[];
        setQuotes(data);
        setFilteredData(prev => ({ ...prev, quotes: data }));
        const recentQuotes = data.filter((q: Quote) => {
          const quoteDate = new Date(q.created_at);
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          return quoteDate > weekAgo;
        }).length;
        setStats(prev => ({ ...prev, totalQuotes: data.length, recentQuotes }));
      }
    } catch (error) {
      console.error('Error fetching quotes:', error);
      toast.error('Failed to load quotes');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async (search?: string) => {
    try {
      setLoading(true);
      const res = await api.users.getAll();
      if (res.success) {
        const data = res.data || [];
        setUsers(data as any);
        setFilteredData(prev => ({ ...prev, users: data as any }));
        setStats(prev => ({ ...prev, totalUsers: (data as any[]).length }));
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const res = await api.contact.getAll();
      if (res.success) {
        setContacts((res.data || []) as any);
      }
    } catch (error) {
      console.error('Error fetching contact messages:', error);
      toast.error('Failed to load contact messages');
    } finally {
      setLoading(false);
    }
  };

  const fetchTestimonials = async () => {
    try {
      setLoading(true);
      const res = await api.testimonials.getAll({});
      if (res.success) {
        setTestimonials((res.data || []) as any);
      }
    } catch (error) {
      console.error('Error fetching testimonials:', error);
      toast.error('Failed to load testimonials');
    } finally {
      setLoading(false);
    }
  };

  const fetchBlogPosts = async (search?: string) => {
    try {
      setLoading(true);
      const res = await api.blog.getAll({ limit: 100 });
      if (res.success) {
        const data = (res.data || []) as any[];
        setBlogPosts(data as any);
        setStats(prev => ({
          ...prev,
          totalPosts: data.length,
          publishedPosts: data.filter((post: any) => post.status === 'published').length
        }));
      }
    } catch (error) {
      console.error('Error fetching blog posts:', error);
      toast.error('Failed to load blog posts');
    } finally {
      setLoading(false);
    }
  };

  // Fetch Google Analytics data
  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const [analyticsRes, realTimeRes, conversionRes] = await Promise.all([
        api.analytics.getGoogleAnalytics(),
        api.analytics.getRealTimeData(),
        api.analytics.getConversionData()
      ]);

      // Validate responses
      if (!analyticsRes.success || !realTimeRes.success || !conversionRes.success) {
        throw new Error('Failed to fetch one or more analytics endpoints');
      }

      // Format and merge analytics data
      const formattedData = {
        overview: {
          ...analyticsRes.data,
          lastUpdated: new Date().toISOString(),
          pageViews: analyticsRes.data.pageViews || 0,
          sessions: analyticsRes.data.sessions || 0,
          users: analyticsRes.data.users || 0,
          bounceRate: analyticsRes.data.bounceRate || 0,
          topPages: analyticsRes.data.topPages || [],
          trafficSources: analyticsRes.data.trafficSources || [],
          deviceBreakdown: analyticsRes.data.deviceBreakdown || []
        },
        realTime: {
          ...realTimeRes.data,
          activeUsers: realTimeRes.data.activeUsers || 0,
          currentPage: realTimeRes.data.currentPage || '',
          device: realTimeRes.data.device || '',
          browser: realTimeRes.data.browser || ''
        },
        conversions: {
          ...conversionRes.data,
          totalConversions: conversionRes.data.totalConversions || 0,
          conversionRate: conversionRes.data.conversionRate || 0,
          revenue: conversionRes.data.revenue || 0,
          goalCompletions: conversionRes.data.goalCompletions || [],
          lastUpdated: new Date().toISOString()
        }
      };

      setAnalyticsData(formattedData);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchServices();
    fetchProducts();
    fetchQuotes();
    fetchUsers();
    fetchContacts();
    fetchTestimonials();
    fetchBlogPosts();

    // Fetch analytics data
    fetchAnalytics();
  }, []);

  // Handle search with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm) {
        if (activeTab === "services") {
          fetchServices();
        } else if (activeTab === "products") {
          fetchProducts(searchTerm);
        } else if (activeTab === "quotes") {
          fetchQuotes(searchTerm);
        } else if (activeTab === "users") {
          fetchUsers(searchTerm);
        } else if (activeTab === "blog") {
          fetchBlogPosts(searchTerm);
        }
      } else {
        // Reset to show all data when search is cleared
        if (activeTab === "services") {
          fetchServices();
        } else if (activeTab === "products") {
          fetchProducts();
        } else if (activeTab === "quotes") {
          fetchQuotes();
        } else if (activeTab === "users") {
          fetchUsers();
        } else if (activeTab === "blog") {
          fetchBlogPosts();
        }
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, activeTab]);

  const dashboardStats = [
    {
      title: "Total Services",
      value: stats.totalServices.toString(),
      change: `${stats.activeServices} active`,
      icon: Settings,
      color: "text-emerald-600",
      bgColor: "bg-emerald-100",
    },
    {
      title: "Total Products",
      value: stats.totalProducts.toString(),
      change: "In stock",
      icon: Package,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Total Quotes",
      value: stats.totalQuotes.toString(),
      change: `${stats.recentQuotes} this week`,
      icon: FileText,
      color: "text-violet-600",
      bgColor: "bg-violet-100",
    },
    {
      title: "Total Users",
      value: stats.totalUsers.toString(),
      change: "Registered",
      icon: Users,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
  ];

  const tabs = [
    { id: "dashboard", name: "Dashboard", icon: BarChart3 },
    { id: "services", name: "Services", icon: Settings },
    { id: "products", name: "Products", icon: Package },
    { id: "quotes", name: "Quotes", icon: FileText },
    { id: "blog", name: "Blog", icon: FileText },
    { id: "contacts", name: "Contacts", icon: MessageSquare },
    { id: "testimonials", name: "Testimonials", icon: Star },
    { id: "analytics", name: "Analytics", icon: TrendingUp },
  ];

  const handleDelete = async (type: string, id: string | number) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;
    try {
      setLoading(true);
      let res: any;
      switch (type) {
        case 'services':
          res = await api.services.delete(Number(id));
          break;
        case 'products':
          res = await api.products.delete(Number(id));
          break;
        case 'quotes':
          res = await api.quotes.delete(Number(id));
          break;
        case 'testimonials':
          res = await api.testimonials.delete(Number(id));
          break;
        case 'blog':
          res = await api.blog.delete(Number(id));
          break;
        case 'contacts':
        case 'contact':
          res = await api.contact.delete(Number(id));
          break;
        default:
          res = { success: false, error: 'Unsupported type' };
      }

      if (res.success) {
        toast.success(`${type.slice(0, -1)} deleted successfully`);
        if (type === 'services') fetchServices();
        else if (type === 'products') fetchProducts();
        else if (type === 'quotes') fetchQuotes();
        else if (type === 'users') fetchUsers();
        else if (type === 'contacts' || type === 'contact') fetchContacts();
        else if (type === 'testimonials') fetchTestimonials();
        else if (type === 'blog') fetchBlogPosts();
      } else {
        toast.error(res.error || `Failed to delete ${type.slice(0, -1)}`);
      }
    } catch (error) {
      console.error('Error deleting item:', error);
      toast.error(`Failed to delete ${type.slice(0, -1)}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item: any, type: 'services' | 'products' | 'quotes' | 'users' | 'contacts' | 'contact' | 'testimonials' | 'blog') => {
    setEditingItem(item);
    setModalType(type);
    setShowAddModal(true);
  };

  const handleSave = async (type: 'services' | 'products' | 'quotes' | 'users' | 'contacts' | 'contact' | 'testimonials' | 'blog', data: any) => {
    try {
      setLoading(true);
      let res: any;
      const isUpdate = !!editingItem;
      const id = editingItem?.id ? Number(editingItem.id) : undefined;

      if (isUpdate) {
        switch (type) {
          case 'services':
            res = await api.services.update(Number(id), data);
            break;
          case 'products':
            res = await api.products.update(Number(id), data);
            break;
          case 'quotes':
            res = await api.quotes.update(Number(id), data);
            break;
          case 'testimonials':
            res = await api.testimonials.update(Number(id), data);
            break;
          case 'blog':
            res = await api.blog.update(Number(id), data);
            break;
          case 'contacts':
          case 'contact':
            res = await api.contact.update(Number(id), data);
            break;
          default:
            res = { success: false, error: 'Unsupported type' };
        }
      } else {
        switch (type) {
          case 'services':
            res = await api.services.create(data);
            break;
          case 'products':
            res = await api.products.create(data);
            break;
          case 'quotes':
            res = await api.quotes.create(data);
            break;
          case 'testimonials':
            res = await api.testimonials.create(data);
            break;
          case 'blog':
            res = await api.blog.create(data);
            break;
          case 'contacts':
          case 'contact':
            res = await api.contact.create(data);
            break;
          default:
            res = { success: false, error: 'Unsupported type' };
        }
      }

      if (res.success) {
        toast.success(`${type.slice(0, -1)} ${editingItem ? 'updated' : 'created'} successfully`);
        setEditingItem(null);
        setShowAddModal(false);
        if (type === 'services') fetchServices();
        else if (type === 'products') fetchProducts();
        else if (type === 'quotes') fetchQuotes();
        else if (type === 'users') fetchUsers();
        else if (type === 'contacts' || type === 'contact') fetchContacts();
        else if (type === 'testimonials') fetchTestimonials();
        else if (type === 'blog') fetchBlogPosts();
      } else {
        if (res.details) {
          toast.error(
            (res.error ? res.error + ': ' : '') +
            (Array.isArray(res.details)
              ? res.details.map((d: any) => d.message).join('; ')
              : JSON.stringify(res.details))
          );
        } else {
          toast.error(res.error || `Failed to ${editingItem ? 'update' : 'create'} ${type.slice(0, -1)}`);
        }
      }
    } catch (error) {
      console.error('Error saving item:', error);
      toast.error(`Failed to ${editingItem ? 'update' : 'create'} ${type.slice(0, -1)}`);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (type: string) => {
    try {
      setLoading(true);
      let data;
      
      switch (type) {
        case 'quotes':
          data = quotes;
          break;
        case 'services':
          data = services;
          break;
        case 'products':
          data = products;
          break;
        case 'users':
          data = users;
          break;
        case 'contacts':
          data = contacts;
          break;
        case 'testimonials':
          data = testimonials;
          break;
        default:
          data = [];
      }

      if (data.length === 0) {
        toast.error('No data to export');
        return;
      }

      // Convert data to CSV
      const headers = Object.keys(data[0]).join(',');
      const csvContent = [
        headers,
        ...data.map(item => 
          Object.values(item).map(value => 
            typeof value === 'string' && value.includes(',') 
              ? `"${value}"` 
              : value
          ).join(',')
        )
      ].join('\n');

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${type}_export_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success(`${type} exported successfully`);
    } catch (error) {
      console.error('Error exporting data:', error);
      toast.error('Failed to export data');
    } finally {
      setLoading(false);
    }
  };

  const StatusBadge = ({ status }: { status: string }) => {
    const getStatusStyle = (status: string) => {
      switch (status) {
        case "active":
        case "in-stock":
        case "approved":
          return "bg-emerald-100 text-emerald-700";
        case "pending":
          return "bg-yellow-100 text-yellow-700";
        case "inactive":
        case "out-of-stock":
        case "rejected":
          return "bg-red-100 text-red-700";
        default:
          return "bg-slate-100 text-slate-700";
      }
    };

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusStyle(status)}`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1).replace("-", " ")}
      </span>
    );
  };

  const renderDashboard = () => {
    // Category distribution
    const catMap: Record<string, number> = {};
    products.forEach((p: any) => {
      if (p.category) catMap[p.category] = (catMap[p.category] || 0) + 1;
    });
    const categoryData = {
      labels: Object.keys(catMap),
      datasets: [{ data: Object.values(catMap), backgroundColor: ['#60a5fa', '#fbbf24', '#34d399', '#f87171', '#a78bfa'] }],
    };
    // Monthly new products (dummy data)
    const monthlyData = {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      datasets: [{ label: 'New Products', data: [2, 3, 5, 4, 6, 7, 3, 2, 4, 5, 6, 7], borderColor: '#60a5fa', backgroundColor: '#dbeafe' }],
    };
    // Top 5 products (by price as a proxy for sales)
    const topProducts = [...products].sort((a, b) => (b.price || 0) - (a.price || 0)).slice(0, 5);
    return (
      <div className="space-y-8">
        {/* Stats Grid */}
        <CardGrid cols={4} gap="lg">
          {dashboardStats.map((stat, index) => (
            <ModernCard key={index} className="card-md">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                  <span className={`text-sm font-medium ${stat.color}`}>{stat.change}</span>
                </div>
                <div className="text-2xl font-bold text-slate-900 mb-1">{stat.value}</div>
                <div className="text-slate-600 text-sm">{stat.title}</div>
              </CardContent>
            </ModernCard>
          ))}
        </CardGrid>

        {/* Analytics Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <ModernCard className="card-md">
            <CardContent className="p-6">
              <h3 className="font-bold mb-4">Product Category Distribution</h3>
              <Pie data={categoryData} />
            </CardContent>
          </ModernCard>
          <ModernCard className="card-md">
            <CardContent className="p-6">
              <h3 className="font-bold mb-4">Monthly New Products</h3>
              <Line data={monthlyData} />
            </CardContent>
          </ModernCard>
        </div>

        <ModernCard className="card-md">
          <CardContent className="p-6">
            <h3 className="font-bold mb-4">Top 5 Products</h3>
            <Bar data={{
              labels: topProducts.map(p => p.name),
              datasets: [{ label: 'Price', data: topProducts.map(p => p.price || 0), backgroundColor: '#60a5fa' }],
            }} />
          </CardContent>
        </ModernCard>

        {/* Recent Activity */}
        <div className="grid lg:grid-cols-2 gap-8">
          <ModernCard className="card-md">
            <CardHeader>
              <CardTitle>Recent Quotes</CardTitle>
              <CardDescription>Latest quote requests from clients</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {quotes.slice(0, 3).map((quote) => (
                  <div key={quote.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div>
                      <div className="font-medium text-slate-900">{quote.project_name}</div>
                      <div className="text-sm text-slate-600">${quote.estimated_cost ? quote.estimated_cost.toLocaleString() : 'N/A'}</div>
                    </div>
                    <StatusBadge status={quote.status} />
                  </div>
                ))}
              </div>
            </CardContent>
          </ModernCard>

          <ModernCard className="card-md">
            <CardHeader>
              <CardTitle>Top Products</CardTitle>
              <CardDescription>Best selling products this month</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {products.slice(0, 3).map((product) => (
                  <div key={product.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div>
                      <div className="font-medium text-slate-900">{product.name}</div>
                      <div className="text-sm text-slate-600">${product.price ? product.price.toLocaleString() : 'N/A'}</div>
                    </div>
                    <div className="text-sm text-slate-600">Stock: {product.stock_quantity}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </ModernCard>
        </div>
      </div>
    );
  };

  const renderServices = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900">Services Management</h2>
        <ModernButton variant="primary" onClick={() => {
          setModalType("services");
          setEditingItem(null);
          setShowAddModal(true);
        }}>
          <Plus className="w-4 h-4" />
          Add Service
        </ModernButton>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <ModernInput
              placeholder="Search services..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <ModernButton variant="outline" onClick={() => setShowFilters(!showFilters)}>
          <Filter className="w-4 h-4" />
          Filter
        </ModernButton>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <ModernCard className="card-md">
          <CardContent className="p-4">
            <div className="grid grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Status
                </label>
                <select
                  value={filters.active}
                  onChange={(e) => setFilters(prev => ({ ...prev, active: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All</option>
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Category
                </label>
                <ModernInput
                  value={filters.category}
                  onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                  placeholder="Filter by category"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Date Range
                </label>
                <select
                  value={filters.dateRange}
                  onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                </select>
              </div>
              <div className="flex items-end gap-2">
                <ModernButton
                  variant="primary"
                  onClick={() => {
                    // Apply filters
                    if (activeTab === "services") {
                      fetchServices();
                    } else if (activeTab === "products") {
                      fetchProducts(searchTerm);
                    }
                  }}
                >
                  Apply
                </ModernButton>
                <ModernButton
                  variant="outline"
                  onClick={() => {
                    setFilters({ status: '', category: '', dateRange: '', active: '' });
                    if (activeTab === "services") {
                      fetchServices();
                    } else if (activeTab === "products") {
                      fetchProducts();
                    }
                  }}
                >
                  Clear
                </ModernButton>
              </div>
            </div>
          </CardContent>
        </ModernCard>
      )}

      <div className="grid gap-4">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
            <p className="text-slate-500 mt-2">Loading services...</p>
          </div>
        ) : services.length === 0 ? (
          <div className="text-center py-8">
            <Package className="w-12 h-12 text-slate-400 mx-auto mb-2" />
            <p className="text-slate-500">No services found</p>
          </div>
        ) : (
          services.map((service) => (
            <ModernCard key={service.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                      <h3 className="text-lg font-semibold text-slate-900">{service.name}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        service.is_active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {service.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <p className="text-slate-600 mb-2">{service.description || service.short_description}</p>
                    <div className="flex items-center gap-4 text-sm text-slate-500">
                      <span>Category: {service.category || 'N/A'}</span>
                      <span>Price: {service.price_range || 'Contact for quote'}</span>
                      <span>Created: {new Date(service.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <ModernButton variant="ghost" size="sm" onClick={() => handleEdit(service, "services")}>
                      <Edit className="w-4 h-4" />
                    </ModernButton>
                    <ModernButton variant="ghost" size="sm" onClick={() => handleDelete("services", service.id)}>
                      <Trash2 className="w-4 h-4" />
                    </ModernButton>
                  </div>
                </div>
              </CardContent>
            </ModernCard>
          ))
        )}
      </div>
    </div>
  );

  const renderProducts = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900">Products Management</h2>
        <ModernButton variant="primary" onClick={() => {
          setModalType("products");
          setEditingItem(null);
          setShowAddModal(true);
        }}>
          <Plus className="w-4 h-4" />
          Add Product
        </ModernButton>
      </div>

      <div className="grid gap-4">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
            <p className="text-slate-500 mt-2">Loading products...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-8">
            <Package className="w-12 h-12 text-slate-400 mx-auto mb-2" />
            <p className="text-slate-500">No products found</p>
          </div>
        ) : (
          products.map((product) => (
            <ModernCard key={product.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                      <h3 className="text-lg font-semibold text-slate-900">{product.name}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        product.is_active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {product.is_active ? 'Active' : 'Inactive'}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        product.stock_quantity > 0 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-orange-100 text-orange-800'
                      }`}>
                        {product.stock_quantity > 0 ? 'In Stock' : 'Out of Stock'}
                      </span>
                    </div>
                    <p className="text-slate-600 mb-2">{product.description}</p>
                    <div className="flex items-center gap-4 text-sm text-slate-500">
                      <span>Category: {product.category || 'N/A'}</span>
                      <span>Price: ${product.price ? product.price.toLocaleString() : 'N/A'}</span>
                      <span>Stock: {product.stock_quantity}</span>
                      <span>Created: {new Date(product.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <ModernButton variant="ghost" size="sm" onClick={() => handleEdit(product, "products")}>
                      <Edit className="w-4 h-4" />
                    </ModernButton>
                    <ModernButton variant="ghost" size="sm" onClick={() => handleDelete("products", product.id)}>
                      <Trash2 className="w-4 h-4" />
                    </ModernButton>
                  </div>
                </div>
              </CardContent>
            </ModernCard>
          ))
        )}
      </div>
    </div>
  );

  const renderContacts = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900">Contacts Management</h2>
        <ModernButton variant="outline" onClick={() => fetchContacts()}>
          <Download className="w-4 h-4" />
          Refresh
        </ModernButton>
      </div>

      <div className="grid gap-4">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
            <p className="text-slate-500 mt-2">Loading contacts...</p>
          </div>
        ) : contacts.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquare className="w-12 h-12 text-slate-400 mx-auto mb-2" />
            <p className="text-slate-500">No contact messages found</p>
          </div>
        ) : (
          contacts.map((msg) => (
            <ModernCard key={msg.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                      <h3 className="text-lg font-semibold text-slate-900">{msg.name}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        msg.status === 'unread' ? 'bg-red-100 text-red-800' :
                        msg.status === 'replied' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {msg.status}
                      </span>
                    </div>
                    <div className="text-sm text-slate-600 mb-2">
                      {msg.email}{msg.phone ? ` • ${msg.phone}` : ''}
                    </div>
                    <div className="text-sm text-slate-600 mb-2">
                      Subject: {msg.subject || 'No subject'}
                    </div>
                    <div className="text-slate-700 whitespace-pre-wrap">{msg.message}</div>
                    <div className="text-sm text-slate-500 mt-2">Received: {new Date(msg.created_at).toLocaleString()}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <ModernButton variant="ghost" size="sm" onClick={async () => {
                      await api.contact.update(Number(msg.id), { status: 'read' });
                      fetchContacts();
                    }}>
                      <Eye className="w-4 h-4" />
                    </ModernButton>
                    <ModernButton variant="ghost" size="sm" onClick={async () => {
                      await api.contact.update(Number(msg.id), { status: 'replied' });
                      fetchContacts();
                    }}>
                      <CheckCircle className="w-4 h-4" />
                    </ModernButton>
                    <ModernButton variant="ghost" size="sm" onClick={() => handleDelete("contact", msg.id)}>
                      <Trash2 className="w-4 h-4" />
                    </ModernButton>
                  </div>
                </div>
              </CardContent>
            </ModernCard>
          ))
        )}
      </div>
    </div>
  );

  const renderTestimonials = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900">Testimonials Management</h2>
        <ModernButton variant="primary" onClick={() => {
          setModalType("testimonials");
          setEditingItem(null);
          setShowAddModal(true);
        }}>
          <Plus className="w-4 h-4" />
          Add Testimonial
        </ModernButton>
      </div>

      <div className="grid gap-4">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
            <p className="text-slate-500 mt-2">Loading testimonials...</p>
          </div>
        ) : testimonials.length === 0 ? (
          <div className="text-center py-8">
            <Star className="w-12 h-12 text-slate-400 mx-auto mb-2" />
            <p className="text-slate-500">No testimonials found</p>
          </div>
        ) : (
          testimonials.map((t) => (
            <ModernCard key={t.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                      <h3 className="text-lg font-semibold text-slate-900">{t.name} {t.company ? `• ${t.company}` : ''}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${t.is_active ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-800'}`}>
                        {t.is_active ? 'Active' : 'Inactive'}
                      </span>
                      {t.is_featured && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Featured</span>
                      )}
                    </div>
                    <div className="text-sm text-slate-600 mb-2">Rating: {t.rating}/5</div>
                    <div className="text-slate-700 whitespace-pre-wrap">{t.content}</div>
                    <div className="text-sm text-slate-500 mt-2">Created: {new Date(t.created_at).toLocaleDateString()}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <ModernButton variant="ghost" size="sm" onClick={async () => {
                      await api.testimonials.update(Number(t.id), { is_featured: !t.is_featured });
                      fetchTestimonials();
                    }}>
                      <Star className="w-4 h-4" />
                    </ModernButton>
                    <ModernButton variant="ghost" size="sm" onClick={() => handleDelete("testimonials", t.id)}>
                      <Trash2 className="w-4 h-4" />
                    </ModernButton>
                  </div>
                </div>
              </CardContent>
            </ModernCard>
          ))
        )}
      </div>
    </div>
  );

  const renderQuotes = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900">Quotes Management</h2>
        <div className="flex gap-2">
          <ModernButton variant="outline" onClick={() => handleExport('quotes')}>
            <Download className="w-4 h-4" />
            Export
          </ModernButton>
        </div>
      </div>

      <div className="grid gap-4">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
            <p className="text-slate-500 mt-2">Loading quotes...</p>
          </div>
        ) : quotes.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="w-12 h-12 text-slate-400 mx-auto mb-2" />
            <p className="text-slate-500">No quotes found</p>
          </div>
        ) : (
          quotes.map((quote) => (
            <ModernCard key={quote.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                <div className="flex items-center gap-4 mb-2">
                  <h3 className="text-lg font-semibold text-slate-900">{quote.project_name}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        quote.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        quote.status === 'approved' ? 'bg-green-100 text-green-800' :
                        quote.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {quote.status}
                      </span>
                    </div>
                    {/* No client_email in Quote type; consider user_email if using QuoteWithDetails */}
                    <div className="text-sm text-slate-600 mb-2">
                      Description: {quote.description || 'No description'}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-slate-500">
                      <span>Total: ${quote.estimated_cost ? quote.estimated_cost.toLocaleString() : 'N/A'}</span>
                      <span>Created: {new Date(quote.created_at).toLocaleDateString()}</span>
                      {/* No valid_until in Quote type */}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={quote.status}
                      onChange={async (e) => {
                        const newStatus = e.target.value as Quote['status'];
                        await api.quotes.update(Number(quote.id), { status: newStatus });
                        fetchQuotes();
                      }}
                      className="px-2 py-1 border border-slate-300 rounded"
                    >
                      <option value="pending">Pending</option>
                      <option value="reviewed">Reviewed</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                    </select>
                    <ModernButton variant="ghost" size="sm" onClick={() => handleEdit(quote, "quotes")}>
                      <Edit className="w-4 h-4" />
                    </ModernButton>
                    <ModernButton variant="ghost" size="sm" onClick={() => handleDelete("quotes", quote.id)}>
                      <Trash2 className="w-4 h-4" />
                    </ModernButton>
                  </div>
                </div>
              </CardContent>
            </ModernCard>
          ))
        )}
      </div>
    </div>
  );

  const renderBlog = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900">Blog Management</h2>
        <div className="flex gap-2">
          <ModernButton variant="primary" onClick={() => {
            setModalType("blog");
            setEditingItem(null);
            setShowAddModal(true);
          }}>
            <Plus className="w-4 h-4" />
            New Post
          </ModernButton>
          <ModernButton variant="outline" onClick={() => handleExport('blog')}>
            <Download className="w-4 h-4" />
            Export Posts
          </ModernButton>
        </div>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <ModernInput
              placeholder="Search blog posts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <ModernButton variant="outline" onClick={() => setShowFilters(!showFilters)}>
          <Filter className="w-4 h-4" />
          Filter
        </ModernButton>
      </div>

      {showFilters && (
        <ModernCard className="card-md">
          <CardContent className="p-4">
            <div className="grid grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All</option>
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Category
                </label>
                <ModernInput
                  value={filters.category}
                  onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                  placeholder="Filter by category"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Date Range
                </label>
                <select
                  value={filters.dateRange}
                  onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                </select>
              </div>
              <div className="flex items-end gap-2">
                <ModernButton variant="primary" onClick={() => fetchBlogPosts(searchTerm)}>
                  Apply
                </ModernButton>
                <ModernButton variant="outline" onClick={() => {
                  setFilters({ status: '', category: '', dateRange: '', active: '' });
                  fetchBlogPosts();
                }}>
                  Clear
                </ModernButton>
              </div>
            </div>
          </CardContent>
        </ModernCard>
      )}

      <div className="grid gap-4">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
            <p className="text-slate-500 mt-2">Loading blog posts...</p>
          </div>
        ) : blogPosts.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="w-12 h-12 text-slate-400 mx-auto mb-2" />
            <p className="text-slate-500">No blog posts found</p>
          </div>
        ) : (
          blogPosts.map((post) => (
            <ModernCard key={post.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                      <h3 className="text-lg font-semibold text-slate-900">{post.title}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        post.status === 'published' ? 'bg-green-100 text-green-800' :
                        post.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
                      </span>
                    </div>
                    <div className="text-sm text-slate-600 mb-2">
                      Category: {post.category || 'Uncategorized'}
                      {post.tags && post.tags.length > 0 && (
                        <span className="ml-2">• Tags: {post.tags.join(', ')}</span>
                      )}
                    </div>
                    <p className="text-slate-700 mb-2">{post.excerpt || post.content.substring(0, 150) + '...'}</p>
                    <div className="flex items-center gap-4 text-sm text-slate-500">
                      {post.published_at && (
                        <span>Published: {new Date(post.published_at).toLocaleDateString()}</span>
                      )}
                      <span>Created: {new Date(post.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {post.status === 'draft' && (
                      <ModernButton 
                        variant="ghost" 
                        size="sm" 
                        onClick={async () => {
                          await api.blog.update(Number(post.id), { status: 'published', published_at: new Date().toISOString() });
                          fetchBlogPosts();
                        }}
                      >
                        <Eye className="w-4 h-4" />
                      </ModernButton>
                    )}
                    <ModernButton variant="ghost" size="sm" onClick={() => handleEdit(post, "blog")}>
                      <Edit className="w-4 h-4" />
                    </ModernButton>
                    <ModernButton variant="ghost" size="sm" onClick={() => handleDelete("blog", post.id)}>
                      <Trash2 className="w-4 h-4" />
                    </ModernButton>
                  </div>
                </div>
              </CardContent>
            </ModernCard>
          ))
        )}
      </div>
    </div>
  );

  // Google Analytics Tab
  const renderAnalytics = () => (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900">Analytics Dashboard</h2>
        <div className="flex gap-2">
          <ModernButton variant="primary" onClick={fetchAnalytics}>
            <Download className="w-4 h-4 mr-2" />
            Refresh Analytics
          </ModernButton>
        </div>
      </div>

      <ModernCard>
        <CardContent className="p-6">
          <h3 className="font-bold mb-4">Google Analytics Overview</h3>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">Analytics Status</h4>
              <p className="text-sm text-blue-700">
                Google Analytics 4 is active and providing real-time insights.
                View page traffic, user engagement metrics, and conversion data below.
              </p>
            </div>
          </div>
        </CardContent>
      </ModernCard>

      {analyticsData ? (
        <>
          {/* GA4 Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <ModernCard>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Eye className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="text-sm font-medium text-blue-600">Today</div>
                </div>
                <div className="text-2xl font-bold text-slate-900 mb-1">
                  {analyticsData.overview?.pageViews?.toLocaleString() ?? '0'}
                </div>
                <div className="text-slate-600 text-sm">Page Views</div>
              </CardContent>
            </ModernCard>

            <ModernCard>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="text-sm font-medium text-green-600">Active</div>
                </div>
                <div className="text-2xl font-bold text-slate-900 mb-1">
                  {analyticsData.overview?.users?.toLocaleString() ?? '0'}
                </div>
                <div className="text-slate-600 text-sm">Total Users</div>
              </CardContent>
            </ModernCard>

            <ModernCard>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 bg-violet-100 rounded-lg flex items-center justify-center">
                    <ArrowRight className="w-6 h-6 text-violet-600" />
                  </div>
                  <div className="text-sm font-medium text-violet-600">Engagement</div>
                </div>
                <div className="text-2xl font-bold text-slate-900 mb-1">
                  {analyticsData.conversions?.conversionRate ?? '0'}%
                </div>
                <div className="text-slate-600 text-sm">Conversion Rate</div>
              </CardContent>
            </ModernCard>

            <ModernCard>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-orange-600" />
                  </div>
                  <div className="text-sm font-medium text-orange-600">Revenue</div>
                </div>
                <div className="text-2xl font-bold text-slate-900 mb-1">
                  KSH {analyticsData.conversions?.revenue?.toLocaleString() ?? '0'}
                </div>
                <div className="text-slate-600 text-sm">Total Revenue</div>
              </CardContent>
            </ModernCard>
          </div>

          {/* Real-time Activity */}
          <ModernCard className="card-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg">Real-time Activity</h3>
                <div className="flex items-center text-sm text-emerald-600">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse"></div>
                  Live Now
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="bg-slate-50 rounded-lg p-4">
                    <div className="text-3xl font-bold text-emerald-600">
                      {analyticsData.realTime?.activeUsers ?? 0}
                    </div>
                    <div className="text-slate-600 mt-1">Active Users</div>
                  </div>
                  <div className="mt-4 space-y-2">
                    {analyticsData.realTime?.currentPages?.slice(0, 3).map((page: any, i: number) => (
                      <div key={i} className="flex items-center justify-between p-2 bg-slate-50 rounded">
                        <span className="text-sm text-slate-600">{page.path}</span>
                        <span className="font-medium">{page.users}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-slate-500 mb-1">Device Type</div>
                      <div className="font-medium">
                        {analyticsData.realTime?.deviceBreakdown?.map((d: any) => (
                          <div key={d.device} className="flex justify-between">
                            <span>{d.device}</span>
                            <span>{d.percentage}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-slate-500 mb-1">Top Countries</div>
                      <div className="font-medium">
                        {analyticsData.realTime?.countries?.map((c: any) => (
                          <div key={c.country} className="flex justify-between">
                            <span>{c.country}</span>
                            <span>{c.users}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </ModernCard>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Top Pages */}
            <ModernCard>
              <CardContent className="p-6">
                <h3 className="font-bold text-lg mb-4">Most Viewed Pages</h3>
                <div className="space-y-3">
                  {analyticsData.overview?.topPages?.slice(0, 5).map((page, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-center">
                        <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-medium mr-3">
                          {i + 1}
                        </span>
                        <span className="text-sm text-slate-600 truncate max-w-[200px]">{page.page}</span>
                      </div>
                      <div className="text-sm font-medium">{page.views?.toLocaleString()}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </ModernCard>

            {/* Conversions */}
            <ModernCard>
              <CardContent className="p-6">
                <h3 className="font-bold text-lg mb-4">Conversion Goals</h3>
                <div className="space-y-3">
                  {analyticsData.conversions?.goalCompletions?.map((goal, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-center">
                        <CheckCircle className={`w-5 h-5 mr-3 ${
                          goal.completions > 0 ? 'text-emerald-500' : 'text-slate-300'
                        }`} />
                        <span className="text-sm text-slate-600">{goal.goal}</span>
                      </div>
                      <div className="text-sm font-medium">{goal.completions}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </ModernCard>
          </div>

          {/* Traffic Sources and Device Breakdown */}
          <div className="grid md:grid-cols-2 gap-6">
            <ModernCard>
              <CardContent className="p-6">
                <h3 className="font-bold text-lg mb-4">Traffic Sources</h3>
                <div className="space-y-3">
                  {analyticsData.overview?.trafficSources?.map((source, i) => (
                    <div key={i} className="relative">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm text-slate-600">{source.source}</span>
                        <span className="text-sm font-medium">{source.percentage}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${source.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </ModernCard>

            <ModernCard>
              <CardContent className="p-6">
                <h3 className="font-bold text-lg mb-4">Device Types</h3>
                <div className="space-y-3">
                  {analyticsData.overview?.deviceBreakdown?.map((device, i) => (
                    <div key={i} className="relative">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm text-slate-600">{device.device}</span>
                        <span className="text-sm font-medium">{device.percentage}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2">
                        <div
                          className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${device.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </ModernCard>
          </div>

          <ModernCard className="card-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg">Last 30 Days Overview</h3>
                <div className="text-sm text-slate-500">
                  Last updated: {new Date(analyticsData.overview?.lastUpdated || '').toLocaleString()}
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <div className="text-sm text-slate-500">Avg. Session Duration</div>
                  <div className="text-xl font-bold">{analyticsData.overview?.avgSessionDuration ?? '0'}m</div>
                </div>
                <div>
                  <div className="text-sm text-slate-500">Pages per Session</div>
                  <div className="text-xl font-bold">{analyticsData.overview?.pagesPerSession ?? '0'}</div>
                </div>
                <div>
                  <div className="text-sm text-slate-500">Bounce Rate</div>
                  <div className="text-xl font-bold">{analyticsData.overview?.bounceRate ?? '0'}%</div>
                </div>
                <div>
                  <div className="text-sm text-slate-500">New Users</div>
                  <div className="text-xl font-bold">{analyticsData.overview?.newUsers?.toLocaleString() ?? '0'}</div>
                </div>
              </div>
            </CardContent>
          </ModernCard>
        </>
      ) : (
        <ModernCard>
          <CardContent className="p-6">
            {loading ? (
              <div className="h-32 flex items-center justify-center">
                <div className="flex items-center gap-3">
                  <div className="animate-spin w-6 h-6 border-3 border-blue-600 border-t-transparent rounded-full"></div>
                  <span className="text-slate-600">Loading analytics data...</span>
                </div>
              </div>
            ) : (
              <div className="h-32 flex flex-col items-center justify-center text-slate-500 space-y-2">
                <div className="text-4xl">📊</div>
                <div>No analytics data available.</div>
                <ModernButton variant="outline" onClick={fetchAnalytics}>
                  <Download className="w-4 h-4 mr-2" />
                  Fetch Analytics Data
                </ModernButton>
              </div>
            )}
          </CardContent>
        </ModernCard>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <ModernNavBar />
      <div className="pt-16">
        {/* Header */}
        <div className="bg-white border-b border-slate-200">
          <div className="max-w-full px-2 sm:px-4 md:px-8 lg:container py-6 sm:py-8 mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-1 sm:mb-2">Admin Dashboard</h1>
                <p className="text-slate-600 text-sm sm:text-base">Manage your services, products, and quotes</p>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4">
                {/* User Info */}
                <div className="flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-2 bg-slate-50 rounded-lg">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <div className="text-xs sm:text-sm">
                    <div className="font-medium text-slate-900">
                      {user ? `${user.first_name} ${user.last_name}` : 'Admin User'}
                    </div>
                    <div className="text-xs text-slate-500">{user?.role || 'admin'}</div>
                  </div>
                </div>
                <ModernButton variant="outline">
                  <Upload className="w-4 h-4" />
                  <span className="hidden sm:inline">Import Data</span>
                </ModernButton>
                <ModernButton
                  variant="outline"
                  onClick={logout}
                  className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Logout</span>
                </ModernButton>
                <ModernButton variant="primary">
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:inline">Export Report</span>
                </ModernButton>
                {process.env.NODE_ENV === 'development' && (
                  <ModernButton 
                    variant="outline" 
                    onClick={debugAuth}
                    className="text-blue-600 border-blue-200 hover:bg-blue-50"
                  >
                    <Settings className="w-4 h-4" />
                    <span className="hidden sm:inline">Debug Auth</span>
                  </ModernButton>
                )}
              </div>
            </div>
          </div>
        </div>
        {/* Navigation Tabs */}
        <div className="bg-white border-b border-slate-200">
          <div className="max-w-full px-2 sm:px-4 md:px-8 lg:container mx-auto">
            <div className="flex flex-wrap gap-2 sm:gap-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-2 sm:py-4 border-b-2 font-medium text-xs sm:text-sm transition-colors ${
                    activeTab === tab.id
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-slate-500 hover:text-slate-700"
                  }`}
                  aria-label={`Go to ${tab.name} tab`}
                  aria-current={activeTab === tab.id ? "page" : undefined}
                  tabIndex={0}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.name}
                </button>
              ))}
            </div>
          </div>
        </div>
        {/* Main Content */}
        <div className="max-w-full px-2 sm:px-4 md:px-8 lg:container py-4 sm:py-8 mx-auto">
          {activeTab === "dashboard" && renderDashboard()}
          {activeTab === "services" && renderServices()}
          {activeTab === "products" && renderProducts()}
          {activeTab === "quotes" && renderQuotes()}
          {activeTab === "blog" && renderBlog()}
          {activeTab === "contacts" && renderContacts()}
          {activeTab === "testimonials" && renderTestimonials()}
          {activeTab === "analytics" && renderAnalytics()}
        </div>
      </div>
      {/* Quick Actions Sidebar */}
      <div className="fixed bottom-4 right-4 sm:bottom-8 sm:right-8 z-50">
        <ModernButton variant="primary" className="rounded-full w-12 h-12 sm:w-14 sm:h-14 shadow-lg">
          <Plus className="w-6 h-6" />
        </ModernButton>
      </div>
      {/* Add/Edit Modal */}
      {showAddModal && modalType && (
        <AddEditModal
          type={modalType as 'services' | 'products' | 'quotes' | 'users' | 'contacts' | 'contact' | 'testimonials' | 'blog'}
          item={editingItem}
          onSave={handleSave}
          onClose={() => {
            setShowAddModal(false);
            setEditingItem(null);
            setModalType("");
          }}
          loading={loading}
        />
      )}
    </div>
  );
};

// Add/Edit Modal Component
const AddEditModal = ({ type, item, onSave, onClose, loading }: {
  type: 'services' | 'products' | 'quotes' | 'users' | 'contacts' | 'contact' | 'testimonials' | 'blog';
  item: any;
  onSave: (type: string, data: any) => void;
  onClose: () => void;
  loading: boolean;
}) => {
  const [formData, setFormData] = useState<any>({});
  const [imageFile, setImageFile] = useState<File|null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

  useEffect(() => {
    if (item) {
      // Ensure all product fields are present when editing
      if (type === 'products') {
        setFormData({
          name: item.name ?? '',
          description: item.description ?? '',
          price: item.price ?? 0,
          category: item.category ?? '',
          image_url: item.image_url ?? '',
          images: item.images ?? '',
          specifications: item.specifications ?? '',
          stock_quantity: item.stock_quantity ?? 0,
          is_active: typeof item.is_active === 'boolean' ? item.is_active : true
        });
      } else {
        // Ensure all service fields are present when editing
        if (type === 'services') {
          setFormData({
            name: item.name ?? '',
            description: item.description ?? '',
            short_description: item.short_description ?? '',
            price_range: item.price_range ?? '',
            category: item.category ?? '',
            features: item.features ?? '',
            is_active: typeof item.is_active === 'boolean' ? item.is_active : true,
            is_featured: typeof item.is_featured === 'boolean' ? item.is_featured : false
          });
        } else {
          setFormData(item);
        }
      }
      if (item.image_url) setImagePreview(item.image_url);
    } else {
      // Initialize empty form based on type
      switch (type) {
        case 'services':
          setFormData({
            name: '',
            description: '',
            short_description: '',
            price_range: '',
            category: '',
            features: '',
            is_active: true,
            is_featured: false
          });
          break;
        case 'products':
          setFormData({
            name: '',
            description: '',
            price: 0,
            category: '',
            image_url: '',
            images: '',
            specifications: '',
            stock_quantity: 0,
            is_active: true
          });
          break;
        case 'quotes':
          setFormData({
            clientName: '',
            clientEmail: '',
            clientPhone: '',
            projectDescription: '',
            status: 'pending'
          });
          break;
        case 'testimonials':
          setFormData({
            name: '',
            company: '',
            position: '',
            content: '',
            rating: 5,
            is_featured: false,
            is_active: true,
          });
          break;
        case 'blog':
          setFormData({
            title: '',
            slug: '',
            content: '',
            excerpt: '',
            featured_image: '',
            category: '',
            tags: [],
            author: 'Nolads Engineering',
            status: 'draft',
            meta_title: '',
            meta_description: ''
          });
          break;
        default:
          setFormData({});
      }
    }
  }, [item, type]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let dataToSend = { ...formData };
    // Remove id field if present
    if ('id' in dataToSend) {
      delete dataToSend.id;
    }
    if (type === 'services') {
      // Remove price field if present
      if ('price' in dataToSend) {
        delete dataToSend.price;
      }
      // Ensure price_range is a string
      if (typeof dataToSend.price_range !== 'string') {
        dataToSend.price_range = String(dataToSend.price_range ?? '');
      }
    }
    if (type === 'products') {
      // List of product fields and their expected types
      const productFields: { [key: string]: 'string' | 'number' | 'boolean' } = {
        name: 'string',
        description: 'string',
        price: 'number',
        category: 'string',
        image_url: 'string',
        images: 'string',
        specifications: 'string',
        stock_quantity: 'number',
        is_active: 'boolean'
      };
      // Guarantee all fields are present and valid types
      Object.entries(productFields).forEach(([field, type]) => {
        if (!(field in dataToSend)) {
          // Set default if missing
          if (type === 'string') dataToSend[field] = '';
          else if (type === 'number') dataToSend[field] = 0;
          else if (type === 'boolean') dataToSend[field] = true;
        } else {
          if (type === 'string') {
            if (dataToSend[field] === null || dataToSend[field] === undefined) {
              dataToSend[field] = '';
            } else if (typeof dataToSend[field] !== 'string') {
              dataToSend[field] = String(dataToSend[field]);
            }
          } else if (type === 'number') {
            if (dataToSend[field] === null || dataToSend[field] === undefined || isNaN(Number(dataToSend[field]))) {
              dataToSend[field] = 0;
            } else if (typeof dataToSend[field] !== 'number') {
              dataToSend[field] = Number(dataToSend[field]);
            }
          } else if (type === 'boolean') {
            if (typeof dataToSend[field] !== 'boolean') {
              dataToSend[field] = Boolean(dataToSend[field]);
            }
          }
        }
      });
      // Always include name (required)
      if (!dataToSend.name || typeof dataToSend.name !== 'string') {
        toast.error('Product name is required');
        return;
      }
      // Remove any legacy or extra fields not in CreateProduct
      const allowedFields = Object.keys(productFields);
      Object.keys(dataToSend).forEach((key) => {
        if (!allowedFields.includes(key)) {
          delete dataToSend[key];
        }
      });
      // Upload image if present
      if (imageFile) {
        try {
          const imgForm = new FormData();
          imgForm.append('image', imageFile);
          // Set entity_type based on current modal type
          const entityType = (type as string) === 'blog' ? 'blog_images' : 'product';
          imgForm.append('entity_type', entityType);
          // Always send alt_text for accessibility (use product name or description)
          imgForm.append('alt_text', formData.name ? String(formData.name) : (formData.description ? String(formData.description) : ''));
          // If editing, send entity_id
          if (item && item.id) {
            imgForm.append('entity_id', String(item.id));
          }
          // Defensive: ensure no null/undefined values in FormData
          for (const [key, value] of imgForm.entries()) {
            if (value === null || value === undefined) {
              imgForm.set(key, '');
            } else if (typeof value !== 'string' && !(value instanceof File)) {
              imgForm.set(key, String(value));
            }
          }
          const targetEntityId = item && item.id ? Number(item.id) : Date.now();
          const upload = await api.images.upload(
            imageFile,
            entityType,
            targetEntityId,
            formData.name ? String(formData.name) : (formData.description ? String(formData.description) : '')
          );
          if (upload.success && upload.data) {
            if ((type as string) === 'blog') {
              // Blog posts expect featured_image column
              (dataToSend as any).featured_image = upload.data as string;
            } else {
              (dataToSend as any).image_url = upload.data as string;
            }
          } else {
            toast.error('Image upload failed' + (upload.error ? ': ' + upload.error : ''));
            return;
          }
        } catch (err) {
          toast.error('Image upload error: ' + (err?.message || err));
          return;
        }
      }
    }
    if (type === 'blog') {
      // Upload featured image similar to product flow (pre-save)
      if (imageFile) {
        try {
          const targetEntityId = item && item.id ? Number(item.id) : Date.now();
          const upload = await api.images.upload(
            imageFile,
            'blog_images',
            targetEntityId,
            formData.title ? String(formData.title) : ''
          );
          if (upload.success && upload.data) {
            (dataToSend as any).featured_image = upload.data as string;
          } else {
            toast.error('Image upload failed' + (upload.error ? ': ' + upload.error : ''));
            return;
          }
        } catch (err) {
          toast.error('Image upload error: ' + (err?.message || err));
          return;
        }
      }
    }
    // Remove undefined fields (but keep 0 and '')
    Object.keys(dataToSend).forEach((key) => {
      if (dataToSend[key] === undefined) {
        delete dataToSend[key];
      }
    });
    onSave(type, dataToSend);
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: value
    }));
  };

  const renderFormFields = () => {
    switch (type) {
      case 'blog':
        return (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Title
                </label>
                <ModernInput
                  value={formData.title || ''}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Enter post title"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Slug
                </label>
                <ModernInput
                  value={formData.slug || ''}
                  onChange={(e) => handleInputChange('slug', e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'))}
                  placeholder="post-url-slug"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Featured Image
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={e => {
                  const file = e.target.files?.[0] || null;
                  setImageFile(file);
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = ev => setImagePreview(ev.target?.result as string);
                    reader.readAsDataURL(file);
                  } else {
                    setImagePreview("");
                  }
                }}
                className="block w-full border border-slate-300 rounded-lg p-2 mt-1"
              />
              {(imagePreview || formData.featured_image) && (
                <img 
                  src={imagePreview || formData.featured_image} 
                  alt="Preview" 
                  className="mt-2 max-h-32 rounded shadow" 
                />
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Excerpt
              </label>
              <ModernTextarea
                value={formData.excerpt || ''}
                onChange={(e) => handleInputChange('excerpt', e.target.value)}
                placeholder="Brief summary of the post"
                rows={2}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Content
              </label>
              <ModernTextarea
                value={formData.content || ''}
                onChange={(e) => handleInputChange('content', e.target.value)}
                placeholder="Post content (supports markdown)"
                rows={8}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Category
                </label>
                <ModernInput
                  value={formData.category || ''}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  placeholder="Post category"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Status
                </label>
                <select
                  value={formData.status || 'draft'}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Tags
              </label>
              <ModernInput
                value={formData.tags?.join(', ') || ''}
                onChange={(e) => handleInputChange('tags', e.target.value.split(',').map(tag => tag.trim()).filter(Boolean))}
                placeholder="Comma-separated tags"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Meta Title
                </label>
                <ModernInput
                  value={formData.meta_title || ''}
                  onChange={(e) => handleInputChange('meta_title', e.target.value)}
                  placeholder="SEO meta title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Meta Description
                </label>
                <ModernInput
                  value={formData.meta_description || ''}
                  onChange={(e) => handleInputChange('meta_description', e.target.value)}
                  placeholder="SEO meta description"
                />
              </div>
            </div>
          </>
        );
      case 'services':
        return (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Service Name
                </label>
                <ModernInput
                  value={formData.name || ''}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter service name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Category
                </label>
                <ModernInput
                  value={formData.category || ''}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  placeholder="Enter category"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Short Description
              </label>
              <ModernInput
                value={formData.short_description || ''}
                onChange={(e) => handleInputChange('short_description', e.target.value)}
                placeholder="Brief description"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Full Description
              </label>
              <ModernTextarea
                value={formData.description || ''}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Detailed description"
                rows={4}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Service Features
              </label>
              <ModernTextarea
                value={formData.features || ''}
                onChange={(e) => handleInputChange('features', e.target.value)}
                placeholder="Enter features as JSON array or comma-separated list (e.g., [&quot;Feature 1&quot;, &quot;Feature 2&quot;] or Feature 1, Feature 2)"
                rows={4}
              />
              <p className="text-xs text-slate-500 mt-1">
                Enter features as a JSON array or comma-separated list. Each feature will be displayed as a bullet point.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Price Range
                </label>
                <ModernInput
                  type="text"
                  value={formData.price_range || ''}
                  onChange={(e) => handleInputChange('price_range', e.target.value)}
                  placeholder="e.g. $100 - $500 or Contact for quote"
                />
              </div>
              <div className="flex items-center gap-4 pt-6">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.is_active || false}
                    onChange={(e) => handleInputChange('is_active', e.target.checked)}
                    className="rounded border-slate-300"
                  />
                  <span className="text-sm text-slate-700">Active</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.is_featured || false}
                    onChange={(e) => handleInputChange('is_featured', e.target.checked)}
                    className="rounded border-slate-300"
                  />
                  <span className="text-sm text-slate-700">Featured</span>
                </label>
              </div>
            </div>
          </>
        );

      case 'products':
        return (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Product Name
                </label>
                <ModernInput
                  value={formData.name || ''}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter product name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Category
                </label>
                <ModernInput
                  value={formData.category || ''}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  placeholder="Enter category"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Product Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={e => {
                  const file = e.target.files?.[0] || null;
                  setImageFile(file);
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = ev => setImagePreview(ev.target?.result as string);
                    reader.readAsDataURL(file);
                  } else {
                    setImagePreview("");
                  }
                }}
                className="block w-full border border-slate-300 rounded-lg p-2 mt-1"
              />
              {imagePreview && (
                <img src={imagePreview} alt="Preview" className="mt-2 max-h-32 rounded shadow" />
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Description
              </label>
              <ModernTextarea
                value={formData.description || ''}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Product description"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Price
                </label>
                <ModernInput
                  type="number"
                  value={formData.price ?? 0}
                  onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Stock Quantity
                </label>
                <ModernInput
                  type="number"
                  value={formData.stock_quantity ?? 0}
                  onChange={(e) => handleInputChange('stock_quantity', parseInt(e.target.value) || 0)}
                  placeholder="0"
                />
              </div>
              <div className="flex items-center gap-4 pt-6">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.is_active || false}
                    onChange={(e) => handleInputChange('is_active', e.target.checked)}
                    className="rounded border-slate-300"
                  />
                  <span className="text-sm text-slate-700">Active</span>
                </label>
              </div>
            </div>
          </>
        );

      case 'quotes':
        return (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Project Name
                </label>
                <ModernInput
                  value={formData.project_name || ''}
                  onChange={(e) => handleInputChange('project_name', e.target.value)}
                  placeholder="Enter project name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Status
                </label>
                <select
                  value={formData.status || 'pending'}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="pending">Pending</option>
                  <option value="reviewed">Reviewed</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Description
              </label>
              <ModernTextarea
                value={formData.description || ''}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe the project requirements"
                rows={4}
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Budget Range</label>
                <ModernInput
                  value={formData.budget_range || ''}
                  onChange={(e) => handleInputChange('budget_range', e.target.value)}
                  placeholder="$1000 - $5000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Timeline</label>
                <ModernInput
                  value={formData.timeline || ''}
                  onChange={(e) => handleInputChange('timeline', e.target.value)}
                  placeholder="2-4 weeks"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Estimated Cost</label>
                <ModernInput
                  type="number"
                  value={formData.estimated_cost ?? 0}
                  onChange={(e) => handleInputChange('estimated_cost', parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                />
              </div>
            </div>
          </>
        );
      case 'testimonials':
        return (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Name</label>
                <ModernInput value={formData.name || ''} onChange={(e) => handleInputChange('name', e.target.value)} placeholder="Client name" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Company</label>
                <ModernInput value={formData.company || ''} onChange={(e) => handleInputChange('company', e.target.value)} placeholder="Company (optional)" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Position</label>
                <ModernInput value={formData.position || ''} onChange={(e) => handleInputChange('position', e.target.value)} placeholder="Position (optional)" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Rating</label>
                <ModernInput type="number" value={formData.rating ?? 5} onChange={(e) => handleInputChange('rating', parseInt(e.target.value) || 5)} min={1} max={5} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Content</label>
              <ModernTextarea value={formData.content || ''} onChange={(e) => handleInputChange('content', e.target.value)} placeholder="Feedback content" rows={4} />
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={formData.is_active || false} onChange={(e) => handleInputChange('is_active', e.target.checked)} className="rounded border-slate-300" />
                <span className="text-sm text-slate-700">Active</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={formData.is_featured || false} onChange={(e) => handleInputChange('is_featured', e.target.checked)} className="rounded border-slate-300" />
                <span className="text-sm text-slate-700">Featured</span>
              </label>
            </div>
          </>
        );

      default:
        return <div>Form not implemented for this type</div>;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-xl font-semibold text-slate-900">
            {item ? 'Edit' : 'Add'} {type.slice(0, -1).charAt(0).toUpperCase() + type.slice(1, -1)}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {renderFormFields()}

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <ModernButton
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </ModernButton>
            <ModernButton
              type="submit"
              variant="primary"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                  Saving...
                </div>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  {item ? 'Update' : 'Create'}
                </>
              )}
            </ModernButton>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminPage;
