import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useNotify } from '@/hooks/use-notify';
import { api } from '@/lib/api';
import { BlogPost, BlogCategory, BlogComment } from '@shared/api';
import { FileUploader } from '@/components/FileUploader';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import {
  Plus,
  Edit,
  Trash,
  Check,
  X,
  Image as ImageIcon,
  Save,
  RefreshCw,
  Star,
  MessageSquare,
  Tag
} from 'lucide-react';

export default function BlogAdmin() {
  const [activeTab, setActiveTab] = useState('posts');
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [comments, setComments] = useState<BlogComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<BlogPost | BlogCategory | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [imageFile, setImageFile] = useState<File | null>(null);
  const notify = useNotify();

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch all data in parallel
      const [postsRes, categoriesRes] = await Promise.all([
        api.blog.listAll(),
        api.blog.getCategories()
      ]);

      if (postsRes.success) {
        // Transform the data to include the required fields
        const transformedPosts = postsRes.data.map(post => ({
          ...post,
          is_published: post.status === 'published',
          is_featured: false,
          views: 0
        }));
        setPosts(transformedPosts);
      }
      if (categoriesRes.success) {
        // Transform the categories data
        const transformedCategories = categoriesRes.data.map(category => ({
          ...category,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }));
        setCategories(transformedCategories);
      }

      // Fetch comments for all published posts
      const publishedPosts = postsRes.success ? 
        postsRes.data.filter(p => p.status === 'published') : [];
      const commentsPromises = publishedPosts.map(post => api.blog.getComments(post.id));
      const commentsResponses = await Promise.all(commentsPromises);
      
      const allComments = commentsResponses
        .filter(res => res.success)
        .flatMap(res => res.data.map(comment => {
          const now = new Date().toISOString();
          return {
            id: comment.id,
            post_id: comment.post_id,
            user_id: 0,
            author_name: 'Anonymous',
            author_email: '',
            content: comment.content,
            is_approved: false,
            is_spam: false,
            created_at: comment.created_at,
            updated_at: now
          } as BlogComment;
        }))
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      
      setComments(allComments);
    } catch (err) {
      notify.error('Error', 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let response: any;

      if (activeTab === 'posts') {
        if (editingItem) {
          // Update flow: optionally upload image first using existing post id
          let imageUrl = '';
          if (imageFile) {
            const uploadRes = await api.images.upload(imageFile, 'blog_images', Number(editingItem.id));
            if (!uploadRes.success || !uploadRes.data) {
              throw new Error(uploadRes.error || 'Image upload failed');
            }
            imageUrl = uploadRes.data;
          }

          const dataToUpdate = {
            ...formData,
            ...(imageUrl && { featured_image: imageUrl })
          };
          response = await api.blog.update(editingItem.id, dataToUpdate);
        } else {
          // Create flow: create post first to get id, then upload image and update
          const { featured_image: _ignored, ...dataWithoutImage } = formData;
          const createRes = await api.blog.create(dataWithoutImage);
          if (!createRes.success || !createRes.data) {
            throw new Error(createRes.error || 'Failed to create post');
          }
          const createdPost = createRes.data as BlogPost;

          if (imageFile) {
            const uploadRes = await api.images.upload(imageFile, 'blog_images', Number(createdPost.id));
            if (!uploadRes.success || !uploadRes.data) {
              throw new Error(uploadRes.error || 'Image upload failed');
            }
            const imageUrl = uploadRes.data;
            await api.blog.update(createdPost.id, { featured_image: imageUrl });
          }
          response = createRes;
        }
      } else if (activeTab === 'categories') {
        if (editingItem) {
          response = await api.blog.updateCategory((editingItem as any).id, formData);
        } else {
          response = await api.blog.createCategory(formData);
        }
      }

      if (response?.success) {
        notify.success('Success', `${activeTab === 'posts' ? 'Post' : 'Category'} ${editingItem ? 'updated' : 'created'} successfully`);
        fetchData();
        handleCancel();
      } else {
        throw new Error(response?.error || 'Operation failed');
      }
    } catch (err: any) {
      notify.error('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setFormData(item);
    setShowForm(true);
  };

  const handleDelete = async (item: any) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    setLoading(true);
    try {
      let response;

      if (activeTab === 'posts') {
        response = await api.blog.delete(item.id);
      } else if (activeTab === 'categories') {
        response = await api.blog.deleteCategory(item.id);
      }

      if (response?.success) {
        notify.success('Success', `${activeTab === 'posts' ? 'Post' : 'Category'} deleted successfully`);
        fetchData();
      } else {
        throw new Error(response?.error || 'Failed to delete');
      }
    } catch (err: any) {
      notify.error('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveComment = async (commentId: number) => {
    try {
      const response = await api.blog.approveComment(commentId);
      if (response.success) {
        notify.success('Success', 'Comment approved successfully');
        fetchData();
      } else {
        throw new Error(response.error || 'Failed to approve comment');
      }
    } catch (err: any) {
      notify.error('Error', err.message);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!confirm('Are you sure you want to delete this comment?')) return;

    try {
      const response = await api.blog.deleteComment(commentId);
      if (response.success) {
        notify.success('Success', 'Comment deleted successfully');
        fetchData();
      } else {
        throw new Error(response.error || 'Failed to delete comment');
      }
    } catch (err: any) {
      notify.error('Error', err.message);
    }
  };

  const handleCancel = () => {
    setEditingItem(null);
    setFormData({});
    setImageFile(null);
    setShowForm(false);
  };

  return (
    <ErrorBoundary>
      <div className="container py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-8">
            <TabsTrigger value="posts">
              Posts
            </TabsTrigger>
            <TabsTrigger value="categories">
              Categories
            </TabsTrigger>
            <TabsTrigger value="comments">
              Comments
            </TabsTrigger>
          </TabsList>

          {/* Posts Tab */}
          <TabsContent value="posts">
            <div className="mb-6 flex justify-between items-center">
              <h2 className="text-2xl font-bold">Blog Posts</h2>
              {!showForm && (
                <Button onClick={() => setShowForm(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  New Post
                </Button>
              )}
            </div>

            {showForm && (
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>{editingItem ? 'Edit' : 'New'} Post</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                      <div className="col-span-2">
                        <label className="block mb-2">Title</label>
                        <Input
                          name="title"
                          value={formData.title || ''}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      
                      <div className="col-span-2">
                        <label className="block mb-2">Excerpt</label>
                        <Textarea
                          name="excerpt"
                          value={formData.excerpt || ''}
                          onChange={handleInputChange}
                          rows={3}
                        />
                      </div>

                      <div>
                        <label className="block mb-2">Category</label>
                        <select
                          name="category"
                          value={formData.category || ''}
                          onChange={handleInputChange}
                          required
                          className="w-full border rounded-md h-10 px-3"
                        >
                          <option value="">Select Category</option>
                          {categories.map(category => (
                            <option key={category.id} value={category.slug}>
                              {category.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block mb-2">Featured Image</label>
                        <FileUploader
                          onFileSelect={setImageFile}
                          accept="image/*"
                          preview={formData.featured_image}
                        />
                      </div>

                      <div className="col-span-2">
                        <label className="block mb-2">Content</label>
                        <Textarea
                          name="content"
                          value={formData.content || ''}
                          onChange={handleInputChange}
                          rows={10}
                          required
                        />
                      </div>

                      <div>
                        <label className="block mb-2">Meta Title</label>
                        <Input
                          name="meta_title"
                          value={formData.meta_title || ''}
                          onChange={handleInputChange}
                        />
                      </div>

                      <div>
                        <label className="block mb-2">Meta Description</label>
                        <Input
                          name="meta_description"
                          value={formData.meta_description || ''}
                          onChange={handleInputChange}
                        />
                      </div>

                      <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2">
                          <Switch
                            name="is_published"
                            checked={formData.is_published || false}
                            onCheckedChange={(checked) => 
                              setFormData(prev => ({ ...prev, is_published: checked }))
                            }
                          />
                          Published
                        </label>
                        
                        <label className="flex items-center gap-2">
                          <Switch
                            name="is_featured"
                            checked={formData.is_featured || false}
                            onCheckedChange={(checked) => 
                              setFormData(prev => ({ ...prev, is_featured: checked }))
                            }
                          />
                          Featured
                        </label>
                      </div>
                    </div>

                    <div className="flex justify-end gap-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleCancel}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={loading}
                      >
                        {loading ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <Save className="w-4 h-4 mr-2" />
                            {editingItem ? 'Update' : 'Create'}
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {loading ? (
              <div className="flex justify-center py-8">
                <RefreshCw className="w-8 h-8 animate-spin" />
              </div>
            ) : (
              <div className="grid gap-6">
                {posts.map(post => (
                  <Card key={post.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {post.is_featured && (
                              <Star className="w-4 h-4 text-yellow-500" />
                            )}
                            <h3 className="text-lg font-semibold">
                              {post.title}
                            </h3>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                            <span>{new Date(post.published_at).toLocaleDateString()}</span>
                            <span className="flex items-center gap-1">
                              <Tag className="w-4 h-4" />
                              {post.category}
                            </span>
                            <span className="flex items-center gap-1">
                              <MessageSquare className="w-4 h-4" />
                              {comments.filter(c => c.post_id === post.id).length}
                            </span>
                          </div>
                          <p className="text-gray-600 line-clamp-2">
                            {post.excerpt}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 ml-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(post)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(post)}
                          >
                            <Trash className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Categories Tab */}
          <TabsContent value="categories">
            <div className="mb-6 flex justify-between items-center">
              <h2 className="text-2xl font-bold">Categories</h2>
              {!showForm && (
                <Button onClick={() => setShowForm(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  New Category
                </Button>
              )}
            </div>

            {showForm && (
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>{editingItem ? 'Edit' : 'New'} Category</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <label className="block mb-2">Name</label>
                      <Input
                        name="name"
                        value={formData.name || ''}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    <div>
                      <label className="block mb-2">Description</label>
                      <Textarea
                        name="description"
                        value={formData.description || ''}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <Switch
                        name="is_active"
                        checked={formData.is_active || false}
                        onCheckedChange={(checked) => 
                          setFormData(prev => ({ ...prev, is_active: checked }))
                        }
                      />
                      <label>Active</label>
                    </div>

                    <div className="flex justify-end gap-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleCancel}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={loading}
                      >
                        {loading ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <Save className="w-4 h-4 mr-2" />
                            {editingItem ? 'Update' : 'Create'}
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {loading ? (
              <div className="flex justify-center py-8">
                <RefreshCw className="w-8 h-8 animate-spin" />
              </div>
            ) : (
              <div className="grid gap-4">
                {categories.map(category => (
                  <Card key={category.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold">{category.name}</h3>
                          {category.description && (
                            <p className="text-sm text-gray-600">
                              {category.description}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-sm text-gray-500">
                            {category.post_count || 0} posts
                          </span>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(category)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDelete(category)}
                              disabled={category.post_count ? true : false}
                              title={category.post_count ? "Cannot delete category with posts" : "Delete category"}
                            >
                              <Trash className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Comments Tab */}
          <TabsContent value="comments">
            <div className="mb-6">
              <h2 className="text-2xl font-bold">Comments</h2>
            </div>

            {loading ? (
              <div className="flex justify-center py-8">
                <RefreshCw className="w-8 h-8 animate-spin" />
              </div>
            ) : (
              <div className="grid gap-4">
                {comments.map(comment => {
                  const post = posts.find(p => p.id === comment.post_id);
                  return (
                    <Card key={comment.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-semibold">
                                {comment.author_name}
                              </span>
                              <span className="text-sm text-gray-500">
                                on "{post?.title}"
                              </span>
                            </div>
                            <p className="text-gray-600">{comment.content}</p>
                            <div className="text-sm text-gray-500 mt-2">
                              {new Date(comment.created_at).toLocaleString()}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {!comment.is_approved && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleApproveComment(comment.id)}
                              >
                                <Check className="w-4 h-4" />
                              </Button>
                            )}
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteComment(comment.id)}
                            >
                              <Trash className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}

                {comments.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No comments yet
                  </div>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </ErrorBoundary>
  );
}
