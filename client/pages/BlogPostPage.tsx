import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { format } from 'date-fns';
import {
  Calendar,
  Clock,
  User,
  Tag,
  Share2,
  MessageSquare,
  ThumbsUp,
  Eye,
  Facebook,
  Twitter,
  Linkedin,
  Copy,
  Send
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useNotify } from '@/hooks/use-notify';
import { api } from '@/lib/api';
import { useImageLoader } from '@/hooks/use-image-loader';
import { useAuth } from '@/hooks/useAuth';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { useSEO } from '@/hooks/use-seo';
import DOMPurify from 'dompurify';
import { marked } from 'marked';
import { Helmet } from 'react-helmet';

import type { BlogPost, BlogComment } from '@/types/blog';
import type { CreateBlogComment } from '@shared/api';

// API response types
interface ApiResponse<T> {
  data: T;
  success: boolean;
  error?: string;
}

// Type for the blog post response from API
// Data transformation utilities
const transformResponseToBlogPost = (data: any): BlogPost => ({
  id: data.id,
  title: data.title,
  slug: data.slug,
  excerpt: data.excerpt || '',
  content: data.content,
  featured_image: data.featured_image || '',
  category: data.category || '',
  author_id: data.author_id,
  author_name: data.author_name || '',
  author_email: data.author_email || '',
  is_published: data.is_published ?? true,
  is_featured: data.is_featured ?? false,
  published_at: data.published_at || data.created_at,
  views: data.views ?? 0,
  meta_title: data.meta_title,
  meta_description: data.meta_description,
  created_at: data.created_at,
  updated_at: data.updated_at
});

const transformResponseToComment = (data: any): BlogComment => ({
  id: data.id,
  post_id: data.post_id,
  user_id: data.user_id || null,
  author_name: data.author_name || null,
  author_email: data.author_email || null,
  content: data.content,
  is_approved: data.is_approved ?? false,
  created_at: data.created_at,
  updated_at: data.updated_at || data.created_at
});

// Alias types for component usage
type Post = BlogPost;
type Comment = BlogComment;

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [commentLoading, setCommentLoading] = useState(false);
  const [error, setError] = useState('');
  const [retryCount, setRetryCount] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);
  const [parsedContent, setParsedContent] = useState<string>('');
  const notify = useNotify();
  const { optimizeImage } = useImageLoader();
  const { user, isAuthenticated } = useAuth();

  // SEO
  useSEO({
    title: post?.meta_title || post?.title,
    description: post?.meta_description || post?.excerpt,
    keywords: `${post?.category || ''}, engineering, blog, ${post?.title || ''}`.toLowerCase(),
    ogTitle: post?.title,
    ogDescription: post?.excerpt,
    ogImage: post?.featured_image,
    ogUrl: typeof window !== 'undefined' ? window.location.href : undefined,
    canonical: typeof window !== 'undefined' ? window.location.href : undefined,
    type: 'article',
    articlePublishedTime: post?.published_at,
    articleModifiedTime: post?.updated_at,
    articleAuthor: post?.author_name,
    twitterCard: 'summary_large_image',
    twitterCreator: '@noladseng' // Replace with your actual Twitter handle
  });

  const fetchPost = async () => {
    try {
      setLoading(true);
      const cacheKey = `blog_post_${slug}`;
      const cachedData = sessionStorage.getItem(cacheKey);

      if (cachedData) {
        const { data, timestamp } = JSON.parse(cachedData);
        // Cache valid for 5 minutes
        if (Date.now() - timestamp < 300000) {
          setPost(data);
          setLoading(false);
          return;
        }
      }

      const response = await api.blog.getBySlug(slug || '');
      
      if (response.success && response.data) {
        const postData = transformResponseToBlogPost(response.data);
        setPost(postData);
        // Cache the response
        sessionStorage.setItem(cacheKey, JSON.stringify({
          data: postData,
          timestamp: Date.now()
        }));
      } else {
        throw new Error(response.error || 'Failed to fetch post');
      }
    } catch (err: any) {
      setError(err.message);
      // Implement retry mechanism
      if (retryCount < 3) {
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
          fetchPost();
        }, 1000 * (retryCount + 1));
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    if (!post?.id) return;
    try {
      const response = await api.blog.getComments(post.id);
      if (response.success) {
        setComments(response.data.map(transformResponseToComment));
      }
    } catch (err) {
      notify.error('Error', 'Failed to load comments');
    }
  };

  const fetchRelatedPosts = async () => {
    if (!post?.category) return;
    try {
      const response = await api.blog.getAll({ category: post.category, limit: 3 });
      if (response.success) {
        if (response.success && response.data) {
          setRelatedPosts(
            response.data
              .filter(p => p.id !== post.id)
              .map(transformResponseToBlogPost)
          );
        }
      }
    } catch (err) {
      console.error('Failed to fetch related posts:', err);
    }
  };

  useEffect(() => {
    if (slug) {
      fetchPost();
    }
  }, [slug]);

  useEffect(() => {
    if (post) {
      fetchComments();
      fetchRelatedPosts();
      // Parse the content when post changes
      const parseContent = async () => {
        try {
          // Normalize escaped newlines ("\\n") into real newlines so markdown parses correctly
          const raw = post.content || '';
          const normalized = raw.replace(/\\r\\n|\\r|\\n/g, '\n').replace(/\\\\n/g, '\n');

          // Use marked to parse markdown with GFM and line-break handling
          const parsedResult = marked.parse(normalized, { gfm: true, breaks: true });
          const parsed = typeof parsedResult === 'string' ? parsedResult : await parsedResult;
          setParsedContent(String(parsed));
        } catch (err) {
          console.error('Failed to parse markdown:', err);
          setParsedContent(post.content); // Fallback to raw content
        }
      };
      parseContent();
    }
  }, [post]);

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!post?.id || !newComment.trim()) return;

    setCommentLoading(true);
    try {
      if (!user?.first_name || !user?.email) {
        throw new Error('User name and email are required to post a comment');
      }

      const commentData: CreateBlogComment = {
        post_id: post.id,
        content: newComment.trim(),
        user_id: user?.id ? parseInt(user.id) : undefined,
        author_name: user.first_name,
        author_email: user.email
      };
      const response = await api.blog.createComment(commentData);

      if (response.success) {
        notify.success('Success', 'Comment submitted successfully');
        setNewComment('');
        // Refresh comments
        fetchComments();
      } else {
        throw new Error(response.error || 'Failed to submit comment');
      }
    } catch (err: any) {
      notify.error('Error', err.message);
    } finally {
      setCommentLoading(false);
    }
  };

  const handleShare = async (platform?: string) => {
    const url = window.location.href;
    const title = post?.title || '';

    switch (platform) {
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`, '_blank');
        break;
      case 'linkedin':
        window.open(`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`, '_blank');
        break;
      default:
        try {
          await navigator.clipboard.writeText(url);
          notify.success('Copied!', 'Link copied to clipboard');
        } catch (err) {
          notify.error('Error', 'Failed to copy link');
        }
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-red-50 flex items-center justify-center">
        <div className="container max-w-md mx-auto text-center px-4">
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Error Loading Post</h2>
          <p className="text-slate-600 mb-8 leading-relaxed">{error}</p>
          <div className="space-y-4">
            <Button
              onClick={() => {
                setError('');
                setRetryCount(0);
                fetchPost();
              }}
              className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
            >
              Try Again
            </Button>
            <Link to="/blog">
              <Button variant="outline" className="w-full border-slate-300 text-slate-700 hover:bg-slate-50 px-8 py-3 rounded-xl">
                Back to Blog
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
        {/* Hero Skeleton */}
        <div className="bg-gradient-to-br from-slate-200 to-slate-300 pt-24 pb-20">
          <div className="container">
            <div className="max-w-5xl mx-auto">
              <div className="animate-pulse">
                <div className="h-4 bg-white/30 rounded w-32 mb-8"></div>
                <div className="h-16 bg-white/30 rounded w-4/5 mx-auto mb-8"></div>
                <div className="flex justify-center gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-8 bg-white/30 rounded-full w-24"></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Content Skeleton */}
        <div className="container py-16">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse space-y-8">
              <div className="h-96 bg-slate-200 rounded-2xl"></div>
              <div className="space-y-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="h-4 bg-slate-200 rounded w-full"></div>
                ))}
              </div>
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-4 bg-slate-200 rounded w-full"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center">
        <div className="container max-w-md mx-auto text-center px-4">
          <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-12 h-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Post Not Found</h2>
          <p className="text-slate-600 mb-8 leading-relaxed">
            The post you're looking for doesn't exist or has been removed.
          </p>
          <Link to="/blog">
            <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200">
              Back to Blog
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Prepare schema markup
  const schemaMarkup = post ? {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": typeof window !== 'undefined' ? window.location.href : undefined
    },
    "headline": post.title,
    "description": post.excerpt,
    "image": post.featured_image,
    "author": {
      "@type": "Person",
      "name": post.author_name
    },
    "publisher": {
      "@type": "Organization",
      "name": "Nolads Engineering",
      "logo": {
        "@type": "ImageObject",
        "url": "https://noladsengineering.com/logo.png" // Update with your actual logo URL
      }
    },
    "datePublished": post.published_at,
    "dateModified": post.updated_at
  } : null;

  return (
    <ErrorBoundary>
      {schemaMarkup && (
        <Helmet>
          <script type="application/ld+json">
            {JSON.stringify(schemaMarkup)}
          </script>
        </Helmet>
      )}
      <article className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
        {/* Hero Section */}
        <header className="relative pt-24 pb-20 overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.05%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-transparent rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-indigo-400/20 to-transparent rounded-full blur-3xl"></div>
          </div>
          
          <div className="container relative z-10">
            <div className="max-w-5xl mx-auto">
              {/* Breadcrumb */}
              <nav className="mb-8">
                <Link 
                  to="/blog" 
                  className="inline-flex items-center gap-2 text-blue-100 hover:text-white transition-colors duration-200 group"
                >
                  <div className="p-1 rounded-full bg-white/10 group-hover:bg-white/20 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium">Back to Blog</span>
                </Link>
              </nav>

              {/* Title and Meta */}
              <div className="text-center mb-12">
                <h1 className="type-h2 font-bold text-white mb-6 leading-tight tracking-tight">
                  {post.title}
                </h1>
                
                {/* Meta Information */}
                <div className="flex flex-wrap items-center justify-center gap-6 text-blue-100 text-sm">
                  <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                    <Calendar className="w-4 h-4" />
                    <span className="font-medium">{format(new Date(post.published_at), 'MMMM d, yyyy')}</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                    <User className="w-4 h-4" />
                    <span className="font-medium">{post.author_name}</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                    <Tag className="w-4 h-4" />
                    <span className="font-medium">{post.category}</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                    <Eye className="w-4 h-4" />
                    <span className="font-medium">{post.views} views</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="container py-16">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Sidebar - Share Buttons */}
              <div className="lg:col-span-1 order-2 lg:order-1">
                <div className="sticky top-24">
                  <div className="flex lg:flex-col gap-3 justify-center lg:justify-start">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleShare('facebook')}
                            className="h-12 w-12 rounded-full bg-white shadow-lg hover:bg-blue-50 hover:text-blue-600 hover:shadow-xl transition-all duration-200"
                          >
                            <Facebook className="w-5 h-5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Share on Facebook</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleShare('twitter')}
                            className="h-12 w-12 rounded-full bg-white shadow-lg hover:bg-blue-50 hover:text-blue-600 hover:shadow-xl transition-all duration-200"
                          >
                            <Twitter className="w-5 h-5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Share on Twitter</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleShare('linkedin')}
                            className="h-12 w-12 rounded-full bg-white shadow-lg hover:bg-blue-50 hover:text-blue-600 hover:shadow-xl transition-all duration-200"
                          >
                            <Linkedin className="w-5 h-5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Share on LinkedIn</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleShare()}
                            className="h-12 w-12 rounded-full bg-white shadow-lg hover:bg-blue-50 hover:text-blue-600 hover:shadow-xl transition-all duration-200"
                          >
                            <Copy className="w-5 h-5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Copy Link</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
              </div>

              {/* Main Content */}
              <div className="lg:col-span-11 order-1 lg:order-2">
                {/* Featured Image */}
                <div className="mb-12 rounded-2xl overflow-hidden shadow-2xl">
                  <img
                    src={optimizeImage(post.featured_image, { width: 1200, height: 600 })}
                    alt={post.title}
                    className="w-full h-auto object-cover"
                  />
                </div>

                {/* Content */}
                <div className="max-w-4xl mx-auto">
                  <div
                    ref={contentRef}
                    className="prose prose-lg prose-slate max-w-none mb-16"
                    style={{ 
                      lineHeight: 1.8,
                      fontSize: '1.125rem'
                    }}
                    dangerouslySetInnerHTML={{
                      __html: DOMPurify.sanitize(parsedContent)
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Share Buttons */}
        <div className="container lg:hidden mb-12">
          <div className="flex items-center justify-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleShare('facebook')}
              className="flex items-center gap-2 bg-white shadow-md hover:shadow-lg transition-all duration-200"
            >
              <Facebook className="w-4 h-4" />
              Share
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleShare('twitter')}
              className="flex items-center gap-2 bg-white shadow-md hover:shadow-lg transition-all duration-200"
            >
              <Twitter className="w-4 h-4" />
              Tweet
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleShare('linkedin')}
              className="flex items-center gap-2 bg-white shadow-md hover:shadow-lg transition-all duration-200"
            >
              <Linkedin className="w-4 h-4" />
              Share
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleShare()}
              className="flex items-center gap-2 bg-white shadow-md hover:shadow-lg transition-all duration-200"
            >
              <Copy className="w-4 h-4" />
              Copy
            </Button>
          </div>
        </div>

        {/* Author Bio */}
        <div className="container mb-16">
          <div className="max-w-4xl mx-auto">
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 shadow-lg">
              <CardContent className="p-8">
                <div className="flex flex-col md:flex-row items-center gap-6">
                  <div className="relative">
                    <img
                      src={`https://www.gravatar.com/avatar/${post.author_email}?s=120&d=identicon`}
                      alt={post.author_name}
                      className="w-20 h-20 rounded-full ring-4 ring-white shadow-lg"
                    />
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white"></div>
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <h3 className="text-xl font-bold text-slate-900 mb-2">{post.author_name}</h3>
                    <p className="text-slate-600 mb-3">
                      Engineering expert and technical writer at Nolads Engineering
                    </p>
                    <div className="flex items-center justify-center md:justify-start gap-4 text-sm text-slate-500">
                      <span className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        Available for consultation
                      </span>
                      <span>•</span>
                      <span>5+ years experience</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Comments Section */}
        <div className="container mb-16">
          <div className="max-w-4xl mx-auto">
            <section>
              <div className="flex items-center gap-3 mb-8">
                <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-indigo-500 rounded-full"></div>
                <h3 className="text-3xl font-bold text-slate-900">
                  Comments ({comments.length})
                </h3>
              </div>

              {/* Comment Form */}
              {isAuthenticated ? (
                <Card className="mb-12 shadow-lg border-slate-200 bg-white">
                  <CardContent className="p-8">
                    <form onSubmit={handleCommentSubmit}>
                      <div className="mb-6">
                        <label className="block text-sm font-semibold text-slate-800 mb-3">
                          Share your thoughts
                        </label>
                        <Textarea
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          placeholder="Write your comment here..."
                          rows={5}
                          className="resize-none border-slate-300 focus:border-blue-500 focus:ring-blue-500 rounded-xl bg-white text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                          required
                        />
                      </div>
                      <div className="flex justify-end">
                        <Button
                          type="submit"
                          disabled={commentLoading}
                          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                        >
                          {commentLoading ? (
                            <>
                              <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full mr-2" />
                              Posting...
                            </>
                          ) : (
                            <>
                              <Send className="w-4 h-4 mr-2" />
                              Post Comment
                            </>
                          )}
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              ) : (
                <Card className="mb-12 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 shadow-lg">
                  <CardContent className="p-8 text-center">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <MessageSquare className="w-8 h-8 text-blue-600" />
                    </div>
                    <h4 className="text-xl font-semibold text-slate-900 mb-2">
                      Join the conversation
                    </h4>
                    <p className="text-slate-600 mb-6">
                      Please log in to post a comment and share your thoughts
                    </p>
                    <Link to="/login">
                      <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200">
                        Log In to Comment
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              )}

              {/* Comments List */}
              <div className="space-y-6">
                {comments.length === 0 ? (
                  <Card className="bg-white border-slate-200 shadow-sm">
                    <CardContent className="p-12 text-center">
                      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <MessageSquare className="w-8 h-8 text-slate-500" />
                      </div>
                      <h4 className="text-lg font-semibold text-slate-800 mb-2">
                        No comments yet
                      </h4>
                      <p className="text-slate-600">
                        Be the first to share your thoughts on this post!
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  comments.map((comment) => (
                    <Card key={comment.id} className="bg-white border-slate-200 shadow-md hover:shadow-lg transition-shadow duration-200">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="relative">
                            <img
                              src={`https://www.gravatar.com/avatar/${comment.author_name}?s=48&d=identicon`}
                              alt={comment.author_name}
                              className="w-12 h-12 rounded-full ring-2 ring-slate-100"
                            />
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="font-semibold text-slate-900 text-lg">
                                {comment.author_name}
                              </h4>
                              <span className="text-sm text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                                {format(new Date(comment.created_at), 'MMM d, yyyy')}
                              </span>
                            </div>
                            <div className="prose prose-slate max-w-none">
                              <p className="text-slate-700 leading-relaxed">{comment.content}</p>
                            </div>
                            <div className="flex items-center gap-4 mt-4">
                              <Button variant="ghost" size="sm" className="text-slate-500 hover:text-blue-600">
                                <ThumbsUp className="w-4 h-4 mr-1" />
                                Like
                              </Button>
                              <Button variant="ghost" size="sm" className="text-slate-500 hover:text-blue-600">
                                Reply
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </section>
          </div>
        </div>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <div className="container mb-16">
            <div className="max-w-6xl mx-auto">
              <section>
                <div className="flex items-center gap-3 mb-12">
                  <div className="w-1 h-8 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full"></div>
                  <h3 className="text-3xl font-bold text-slate-900">Related Posts</h3>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {relatedPosts.map((relatedPost) => (
                    <Link
                      key={relatedPost.id}
                      to={`/blog/${relatedPost.slug}`}
                      className="group block"
                    >
                      <Card className="h-full bg-white border-slate-200 shadow-md hover:shadow-xl transition-all duration-300 group-hover:-translate-y-2 overflow-hidden">
                        <div className="relative h-56 overflow-hidden">
                          <img
                            src={optimizeImage(relatedPost.featured_image, { width: 400, height: 300 })}
                            alt={relatedPost.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          <div className="absolute top-4 left-4">
                            <span className="bg-white/90 backdrop-blur-sm text-slate-700 text-xs font-semibold px-3 py-1 rounded-full">
                              {relatedPost.category}
                            </span>
                          </div>
                        </div>
                        <CardContent className="p-6">
                          <h4 className="font-bold text-lg text-slate-900 mb-3 group-hover:text-blue-600 transition-colors duration-200 line-clamp-2">
                            {relatedPost.title}
                          </h4>
                          <p className="text-slate-600 text-sm leading-relaxed line-clamp-3 mb-4">
                            {relatedPost.excerpt}
                          </p>
                          <div className="flex items-center justify-between text-xs text-slate-500">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {format(new Date(relatedPost.published_at), 'MMM d, yyyy')}
                            </span>
                            <span className="flex items-center gap-1">
                              <Eye className="w-3 h-3" />
                              {relatedPost.views} views
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </section>
            </div>
          </div>
        )}
      </article>
    </ErrorBoundary>
  );
}
