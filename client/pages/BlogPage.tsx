import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useSEO } from "../hooks/useSEO";
import {
  Calendar,
  Clock,
  User,
  ArrowRight,
  Search,
  Tag,
  BookOpen,
  TrendingUp,
  Lightbulb,
  Zap,
  Share2,
  Eye
} from "lucide-react";
import ModernNavBar from "../components/ModernNavBar";
import { ModernButton } from "../components/ui/modern-button";
import {
  ModernCard,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  CardGrid
} from "../components/ui/modern-card";
import { ModernInput } from "../components/ui/modern-input";

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  authorAvatar: string;
  publishedAt: string;
  readTime: number;
  category: string;
  tags: string[];
  featuredImage: string;
  views: number;
  featured?: boolean;
}

const BlogPage = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<BlogPost[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [loading, setLoading] = useState(true);

  // SEO optimization for blog page
  useSEO({
    title: 'Engineering Blog - Nolads Engineering',
    description: 'Stay updated with the latest trends, insights, and innovations in electrical engineering, industrial automation, and power systems design.',
    keywords: 'electrical engineering blog, power systems insights, industrial automation news, engineering trends, electrical safety tips, energy efficiency',
    ogTitle: 'Engineering Blog - Latest Industry Insights',
    ogDescription: 'Expert insights on electrical engineering, automation, and power systems from industry professionals.',
    ogUrl: typeof window !== 'undefined' ? window.location.href : undefined,
    structuredData: {
      "@context": "https://schema.org",
      "@type": "Blog",
      "name": "Engineering Blog - Nolads Engineering",
      "description": 'Stay updated with the latest trends, insights, and innovations in electrical engineering, industrial automation, and power systems design.',
      "url": typeof window !== 'undefined' ? window.location.href : undefined,
      "publisher": {
        "@type": "Organization",
        "name": "Nolads Engineering"
      }
    }
  });

  // Load posts from API
  useEffect(() => {
    const loadPosts = async () => {
      setLoading(true);
      try {
        const res = await (await import('../lib/api')).api.blog.getAll({ limit: 50 });
        if (res.success) {
          // Map API data to BlogPost interface expectations
          const items = (res.data || []).map((p: any) => ({
            id: p.slug || String(p.id),
            title: p.title,
            excerpt: p.excerpt || '',
            content: p.content || '',
            author: p.author || 'Nolads Team',
            authorAvatar: p.author_avatar || '/placeholder.svg',
            publishedAt: p.published_at || '',
            readTime: p.read_time || 0,
            category: p.category || 'General',
            tags: Array.isArray(p.tags) ? p.tags : (p.tags ? JSON.parse(p.tags) : []),
            featuredImage: p.featured_image || '/placeholder.svg',
            views: p.views || 0,
            featured: !!p.featured,
          }));
          setPosts(items);
          setFilteredPosts(items);
        } else {
          setPosts([]);
          setFilteredPosts([]);
        }
      } catch (e) {
        setPosts([]);
        setFilteredPosts([]);
      } finally {
        setLoading(false);
      }
    };

    loadPosts();
  }, []);

  useEffect(() => {
    let filtered = posts;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(post =>
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter(post => post.category === selectedCategory);
    }

    setFilteredPosts(filtered);
  }, [searchTerm, selectedCategory, posts]);

  const categories = ["all", ...Array.from(new Set(posts.map(post => post.category)))];
  const featuredPosts = posts.filter(post => post.featured);
  const recentPosts = posts.slice(0, 4);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getCategoryIcon = (category: string) => {
    const icons = {
      "Power Systems": Zap,
      "Automation": TrendingUp,
      "Safety": BookOpen,
      "Monitoring": Eye,
      "Technology": Lightbulb
    };
    return icons[category as keyof typeof icons] || BookOpen;
  };

  return (
    <div className="min-h-screen bg-white">
      <ModernNavBar />

      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-10" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-400/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl" />
        
        <div className="container relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-yellow-400/20 border border-yellow-400 text-yellow-400 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <BookOpen className="w-4 h-4" />
              Engineering Insights
            </div>
            <h1 className="text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              <span className="text-white">Engineering</span>
              <span className="text-yellow-400 block mt-2">Knowledge Hub</span>
            </h1>
            <p className="text-xl lg:text-2xl text-blue-100 mb-8 leading-relaxed">
              Stay ahead with expert insights, industry trends, and practical knowledge 
              from electrical engineering professionals.
            </p>

            {/* Search Bar */}
            <div className="max-w-md mx-auto">
              <ModernInput
                type="text"
                placeholder="Search articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                startIcon={Search}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Featured Posts */}
      {featuredPosts.length > 0 && (
        <section className="section bg-slate-50">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="type-h2 font-bold text-slate-900 mb-4">
                Featured Articles
              </h2>
              <p className="text-lg text-slate-600">
                Our most popular and impactful engineering insights
              </p>
            </div>

            <CardGrid cols={2} gap="lg">
              {featuredPosts.map((post) => {
                const CategoryIcon = getCategoryIcon(post.category);
                return (
                  <ModernCard key={post.id} className="group hover:shadow-xl transition-all duration-300">
                    <div className="relative overflow-hidden">
                      <img
                        src={post.featuredImage}
                        alt={post.title}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-4 left-4">
                        <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                          Featured
                        </span>
                      </div>
                    </div>
                    
                    <CardContent className="p-6">
                      <div className="flex items-center gap-2 mb-3">
                        <CategoryIcon className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-600">{post.category}</span>
                      </div>
                      
                      <CardTitle className="text-xl mb-3 group-hover:text-blue-600 transition-colors">
                        {post.title}
                      </CardTitle>
                      
                      <CardDescription className="mb-4 line-clamp-2">
                        {post.excerpt}
                      </CardDescription>
                      
                      <div className="flex items-center justify-between text-sm text-slate-500 mb-4">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {formatDate(post.publishedAt)}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {post.readTime} min read
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          {post.views.toLocaleString()}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <img
                            src={post.authorAvatar}
                            alt={post.author}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                          <span className="text-sm font-medium text-slate-700">{post.author}</span>
                        </div>
                        
                        <Link to={`/blog/${post.id}`}>
                          <ModernButton variant="ghost" size="sm" className="group/btn">
                            Read More
                            <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                          </ModernButton>
                        </Link>
                      </div>
                    </CardContent>
                  </ModernCard>
                );
              })}
            </CardGrid>
          </div>
        </section>
      )}

      {/* Categories Filter */}
      <section className="section">
        <div className="container">
          <div className="flex flex-wrap gap-2 justify-center mb-8">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  selectedCategory === category
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {category === "all" ? "All Articles" : category}
              </button>
            ))}
          </div>

          {/* Blog Posts Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <CardGrid cols={3} gap="lg">
              {filteredPosts.map((post) => {
                const CategoryIcon = getCategoryIcon(post.category);
                return (
                  <ModernCard key={post.id} className="group hover:shadow-lg transition-all duration-300">
                    <div className="relative overflow-hidden">
                      <img
                        src={post.featuredImage}
                        alt={post.title}
                        className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    
                    <CardContent className="p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <CategoryIcon className="w-4 h-4 text-blue-600" />
                        <span className="text-xs font-medium text-blue-600">{post.category}</span>
                      </div>
                      
                      <CardTitle className="text-lg mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                        {post.title}
                      </CardTitle>
                      
                      <CardDescription className="mb-4 line-clamp-3 text-sm">
                        {post.excerpt}
                      </CardDescription>
                      
                      <div className="flex items-center justify-between text-xs text-slate-500 mb-4">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(post.publishedAt)}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {post.readTime}m
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {post.views}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <img
                            src={post.authorAvatar}
                            alt={post.author}
                            className="w-6 h-6 rounded-full object-cover"
                          />
                          <span className="text-xs font-medium text-slate-700">{post.author}</span>
                        </div>
                        
                        <Link to={`/blog/${post.id}`} className="text-xs">
                          <ModernButton variant="ghost" size="sm" className="group/btn text-xs">
                            Read More
                            <ArrowRight className="w-3 h-3 group-hover/btn:translate-x-1 transition-transform" />
                          </ModernButton>
                        </Link>
                      </div>
                    </CardContent>
                  </ModernCard>
                );
              })}
            </CardGrid>
          )}

          {filteredPosts.length === 0 && !loading && (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">No articles found</h3>
              <p className="text-slate-600">Try adjusting your search or filter criteria.</p>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white">
        <div className="container py-16">
          <div className="grid lg:grid-cols-4 gap-12">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center overflow-hidden">
                  <img
                    src="/logo/logo1.png"
                    alt="Nolads Engineering Logo"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="font-semibold text-2xl">
                  Nolads<span className="text-blue-400">Engineering</span>
                </div>
              </div>
              <p className="text-slate-300 mb-8 leading-relaxed max-w-md">
                Leading the future of electrical engineering with innovative solutions, 
                exceptional service, and unwavering commitment to safety and reliability.
              </p>
              <Link to="/contact">
                <ModernButton variant="primary">
                  Get Started Today
                  <ArrowRight className="w-4 h-4" />
                </ModernButton>
              </Link>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-6">Quick Links</h4>
              <ul className="space-y-3">
                {[
                  { name: "Home", href: "/" },
                  { name: "Services", href: "/services" },
                  { name: "Products", href: "/products" },
                  { name: "About", href: "/about" },
                  { name: "Contact", href: "/contact" },
                ].map((item) => (
                  <li key={item.name}>
                    <Link
                      to={item.href}
                      className="text-slate-300 hover:text-white transition-colors"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-6">Categories</h4>
              <ul className="space-y-3">
                {categories.slice(1).map((category) => (
                  <li key={category}>
                    <button
                      onClick={() => setSelectedCategory(category)}
                      className="text-slate-300 hover:text-white transition-colors text-left"
                    >
                      {category}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-700 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-slate-400 text-sm">
              © {new Date().getFullYear()} Nolads Engineering. All rights reserved.
            </p>
            <div className="flex items-center gap-6 mt-4 md:mt-0">
              <a
                href="#"
                className="text-slate-400 hover:text-white transition-colors text-sm"
              >
                Privacy Policy
              </a>
              <a
                href="#"
                className="text-slate-400 hover:text-white transition-colors text-sm"
              >
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default BlogPage;