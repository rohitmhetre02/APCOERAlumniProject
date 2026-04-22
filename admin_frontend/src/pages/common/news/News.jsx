import React, { useState, useEffect } from 'react';
import Card, { CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Textarea from '../../../components/ui/Textarea';
import { Select } from '../../../components/ui/Select';
import Badge from "../../../components/ui/Badge";
import { useAuth } from '../../../context/AuthContext';
import { Plus, Edit, Trash2, Eye, Image, X, Check, Clock, Search } from 'lucide-react';

const News = () => {
  const { user } = useAuth();
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingNews, setViewingNews] = useState(null);
  const [editingNews, setEditingNews] = useState(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPostedBy, setFilterPostedBy] = useState('all');

  const [formData, setFormData] = useState({
    title: '',
    category: '',
    short_content: '',
    full_content: '',
    image_url: '',
    tags: [],
    featured: false
  });

  const [tagInput, setTagInput] = useState('');

  // Categories for news
  const newsCategories = [
    'Announcement',
    'Achievement',
    'Event',
    'Alumni Spotlight',
    'Career',
    'Education',
    'Research',
    'Sports',
    'Culture',
    'Other'
  ];

  useEffect(() => {
    fetchNews();
    fetchCategories();
  }, []);

  const fetchNews = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('admin_token');
      
      if (!token) {
        setError('Please login to access news');
        setLoading(false);
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/news`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to fetch news');
      
      const data = await response.json();
      setNews(data.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/news/categories`);
      const data = await response.json();
      setCategories(data.data || []);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        setImageUploading(true);
        setError('');
        
        // Upload directly to Cloudinary
        const imageUrl = await uploadImageToCloudinary(file);
        
        if (imageUrl) {
          setFormData(prev => ({ ...prev, image_url: imageUrl }));
          setSuccess('Image uploaded successfully!');
        }
      } catch (err) {
        setError('Failed to upload image: ' + err.message);
      } finally {
        setImageUploading(false);
      }
    }
  };

  const uploadImageToCloudinary = async (file) => {
    // Convert file to base64
    const reader = new FileReader();
    return new Promise((resolve, reject) => {
      reader.onload = async () => {
        try {
          const base64data = reader.result;
          
          const response = await fetch(`${import.meta.env.VITE_API_URL}/events/upload-image`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
            },
            body: JSON.stringify({
              image: base64data,
              folder: 'news'
            })
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Upload failed');
          }

          const data = await response.json();
          resolve(data.url);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('admin_token') || localStorage.getItem('coordinator_token');
      
      const newsData = {
        ...formData,
        tags: formData.tags
      };

      const url = editingNews 
        ? `${import.meta.env.VITE_API_URL}/news/${editingNews.id}`
        : `${import.meta.env.VITE_API_URL}/news`;
      
      const method = editingNews ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newsData)
      });

      if (!response.ok) throw new Error('Failed to save news article');

      const data = await response.json();
      
      // Send email notification to all users if this is a new news post by admin
      if (!editingNews && user?.role === 'admin') {
        try {
          const emailResponse = await fetch(`${import.meta.env.VITE_API_URL}/news/send-news-notification`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              newsId: data.data.id
            })
          });
          
          if (emailResponse.ok) {
            const emailData = await emailResponse.json();
            setSuccess(prev => prev + ' Email notifications sent to ' + emailData.stats.totalUsers + ' users.');
          } else {
            const errorData = await emailResponse.json();
            setError('Failed to send email notifications: ' + (errorData.message || 'Unknown error'));
          }
        } catch (emailError) {
          setError('Error sending email notifications: ' + emailError.message);
        }
      }
      
      setSuccess(data.message);
      setShowAddModal(false);
      resetForm();
      fetchNews();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (newsItem) => {
    setEditingNews(newsItem);
    setFormData({
      title: newsItem.title,
      category: newsItem.category,
      short_content: newsItem.short_content || '',
      full_content: newsItem.full_content,
      image_url: newsItem.image_url || '',
      tags: newsItem.tags || [],
      featured: newsItem.featured || false
    });
    setShowAddModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this news article?')) return;

    try {
      const token = localStorage.getItem('admin_token');
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/news/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to delete news article');

      setSuccess('News article deleted successfully');
      fetchNews();
    } catch (err) {
      setError(err.message);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      category: '',
      short_content: '',
      full_content: '',
      image_url: '',
      tags: [],
      featured: false
    });
    setEditingNews(null);
    setTagInput('');
  };

  const openViewModal = (newsItem) => {
    setViewingNews(newsItem);
    setShowViewModal(true);
  };

  const closeViewModal = () => {
    setShowViewModal(false);
    setViewingNews(null);
  };

  const canEditNews = (newsItem) => {
    return user && (newsItem.author_id === user.id || user.role === 'admin');
  };

  const handleEditClick = (newsItem) => {
    if (canEditNews(newsItem)) {
      handleEdit(newsItem);
    } else {
      alert('You do not have access to edit this news article. You can only edit news you have posted.');
    }
  };

  const filteredNews = news.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.author_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || article.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || (article.status || 'approved') === filterStatus;
    const matchesPostedBy = filterPostedBy === 'all' || article.author_role === filterPostedBy;
    return matchesSearch && matchesCategory && matchesStatus && matchesPostedBy;
  });

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">{status}</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">{status}</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">{status}</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };

  // Show Add News button only for admins (coordinators cannot create news)
  const canAddNews = user?.role === 'admin';

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">News Management</h1>
        {canAddNews && (
          <Button onClick={() => setShowAddModal(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add News
          </Button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search news articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="w-full sm:w-48">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Categories</option>
              {newsCategories.map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          <div className="w-full sm:w-48">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <div className="w-full sm:w-48">
            <select
              value={filterPostedBy}
              onChange={(e) => setFilterPostedBy(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Posted By (All)</option>
              <option value="admin">Admin</option>
              <option value="coordinator">Coordinator</option>
              <option value="alumni">Alumni</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading news...</div>
      ) : filteredNews.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No news articles found.
        </div>
      ) : (
        <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Article
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Posted By
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Posted
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredNews.map((article) => (
                  <tr key={article.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-start gap-3">
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <div className="text-sm font-medium text-gray-900">
                              {article.title}
                            </div>
                            
                          </div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                           {article.featured && (
                              <Badge className="bg-blue-100 text-blue-800 text-xs">Featured</Badge>
                            )}
                          </div>
                          
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant="outline">{article.category}</Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        <div className="text-gray-900 font-medium">
                          {article.author_name || 'Unknown'}
                        </div>
                        <div className="text-gray-500 text-xs">
                          {article.author_department || 'N/A'}
                        </div>
                        <div className="text-xs text-gray-400 capitalize">
                          {article.author_role}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(article.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(article.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => openViewModal(article)}
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {user.role !== 'coordinator' && (
                          <>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleEditClick(article)}
                              title={canEditNews(article) ? "Edit Article" : "You don't have access to edit"}
                              className={!canEditNews(article) ? "opacity-50 cursor-not-allowed" : ""}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleDelete(article.id)}
                              className="text-red-600 hover:text-red-700"
                              title="Delete Article"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add/Edit News Modal */}
      {showAddModal && canAddNews && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                {editingNews ? 'Edit News Article' : 'Add News Article'}
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowAddModal(false);
                  resetForm();
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Article Title *</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  required
                  placeholder="Enter article title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Category *</label>
                <Select 
                  value={formData.category} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                >
                  <option value="">Select category</option>
                  {newsCategories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Short Content</label>
                <Textarea
                  value={formData.short_content}
                  onChange={(e) => setFormData(prev => ({ ...prev, short_content: e.target.value }))}
                  placeholder="Brief summary of the article"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Full Content *</label>
                <Textarea
                  value={formData.full_content}
                  onChange={(e) => setFormData(prev => ({ ...prev, full_content: e.target.value }))}
                  required
                  placeholder="Full article content"
                  rows={6}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Image Upload</label>
                <div className="flex items-center gap-4">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={imageUploading}
                  />
                  {imageUploading && <span className="text-sm text-blue-600">Uploading...</span>}
                </div>
                {formData.image_url && (
                  <div className="mt-2">
                    <img
                      src={formData.image_url}
                      alt="Preview"
                      className="h-32 w-32 object-cover rounded"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Tags</label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    placeholder="Add a tag"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  />
                  <Button type="button" onClick={addTag}>Add</Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {tag}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => removeTag(tag)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="featured"
                  checked={formData.featured}
                  onChange={(e) => setFormData(prev => ({ ...prev, featured: e.target.checked }))}
                  className="mr-2"
                />
                <label htmlFor="featured" className="text-sm font-medium">
                  Featured Article
                </label>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowAddModal(false);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Saving...' : (editingNews ? 'Update' : 'Create')}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">News Article Details</h2>
              <Button variant="ghost" size="sm" onClick={closeViewModal}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            {viewingNews && (
              <div className="space-y-6">
                {/* Header Section */}
                <div className="border-b pb-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">
                        {viewingNews.title}
                      </h3>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline">{viewingNews.category}</Badge>
                        {viewingNews.featured && (
                          <Badge className="bg-blue-100 text-blue-800">Featured</Badge>
                        )}
                        {getStatusBadge(viewingNews.status)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500">Posted on</div>
                      <div className="text-sm font-medium">
                        {new Date(viewingNews.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Image */}
                {viewingNews.image_url && (
                  <div className="flex justify-center mb-6">
                    <img
                      src={viewingNews.image_url}
                      alt={viewingNews.title}
                      className="max-w-full h-64 object-cover rounded-lg"
                    />
                  </div>
                )}

                {/* Content */}
                <div>
                  <div className="text-sm font-medium text-gray-700 mb-2">Content</div>
                  <div className="text-sm text-gray-900 whitespace-pre-wrap">
                    {viewingNews.full_content || viewingNews.short_content || 'No content provided'}
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <div className="text-sm font-medium text-gray-700 mb-1">Posted By</div>
                      <div className="text-sm">
                        <div className="text-gray-900 font-medium">
                          {viewingNews.author_name || 'Unknown'}
                        </div>
                        <div className="text-gray-500 text-xs">
                          {viewingNews.author_department || 'N/A'}
                        </div>
                        <div className="text-xs text-gray-400 capitalize">
                          {viewingNews.author_role}
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="text-sm font-medium text-gray-700 mb-1">Tags</div>
                      {viewingNews.tags && viewingNews.tags.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {viewingNews.tags.map((tag, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <div className="text-sm text-gray-400">No tags</div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <div className="text-sm font-medium text-gray-700 mb-1">Statistics</div>
                      <div className="space-y-2">
                        <div className="flex items-center text-sm text-gray-900">
                          <Eye className="h-4 w-4 mr-2 text-gray-400" />
                          {viewingNews.views || 0} views
                        </div>
                        <div className="flex items-center text-sm text-gray-900">
                          <span className="h-4 w-4 mr-2">💬</span>
                          {viewingNews.comments || 0} comments
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="text-sm font-medium text-gray-700 mb-1">Status</div>
                      <div>
                        {getStatusBadge(viewingNews.status)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-2 pt-4 border-t">
                  {canEditNews(viewingNews) && (
                    <Button 
                      onClick={() => {
                        closeViewModal();
                        handleEdit(viewingNews);
                      }}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Article
                    </Button>
                  )}
                  <Button variant="outline" onClick={closeViewModal}>
                    Close
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default News;
