import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  PhotoIcon,
  PlusIcon,
  TrashIcon,
  PencilIcon,
  XMarkIcon,
  EyeIcon,
  CloudArrowUpIcon
} from '@heroicons/react/24/outline';
import { PhotoIcon as PhotoIconSolid } from '@heroicons/react/24/solid';

const Gallery = () => {
  const { user } = useAuth();
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadModal, setUploadModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [viewModal, setViewModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const [uploading, setUploading] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: ''
  });

  // Fetch gallery images
  const fetchImages = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/gallery`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setImages(data.data);
      } else {
        console.error('Failed to fetch images');
      }
    } catch (error) {
      console.error('Error fetching images:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  // Handle image upload
  const handleUpload = async (e) => {
    e.preventDefault();
    const file = e.target.image.files[0];
    
    if (!file) {
      showNotification('Please select an image', 'error');
      return;
    }

    setUploading(true);
    try {
      const token = localStorage.getItem('admin_token');
      const formData = new FormData();
      formData.append('image', file);
      formData.append('title', formData.title);
      formData.append('description', formData.description);

      const response = await fetch(`${import.meta.env.VITE_API_URL}/gallery/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        showNotification('Image uploaded successfully', 'success');
        setUploadModal(false);
        setFormData({ title: '', description: '' });
        fetchImages();
      } else {
        showNotification('Failed to upload image', 'error');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      showNotification('Error uploading image', 'error');
    } finally {
      setUploading(false);
    }
  };

  // Handle image delete
  const handleDelete = async (imageId) => {
    if (!window.confirm('Are you sure you want to delete this image?')) {
      return;
    }

    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/gallery/${imageId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        showNotification('Image deleted successfully', 'success');
        fetchImages();
      } else {
        showNotification('Failed to delete image', 'error');
      }
    } catch (error) {
      console.error('Error deleting image:', error);
      showNotification('Error deleting image', 'error');
    }
  };

  // Handle image update
  const handleUpdate = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/gallery/${selectedImage.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        showNotification('Image updated successfully', 'success');
        setEditModal(false);
        setSelectedImage(null);
        setFormData({ title: '', description: '' });
        fetchImages();
      } else {
        showNotification('Failed to update image', 'error');
      }
    } catch (error) {
      console.error('Error updating image:', error);
      showNotification('Error updating image', 'error');
    }
  };

  const showNotification = (message, type) => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: '' });
    }, 3000);
  };

  const openEditModal = (image) => {
    setSelectedImage(image);
    setFormData({
      title: image.title,
      description: image.description
    });
    setEditModal(true);
  };

  const openViewModal = (image) => {
    setSelectedImage(image);
    setViewModal(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gallery</h1>
          <p className="text-gray-600">Manage gallery images</p>
        </div>
        {user?.role === 'admin' && (
          <button
            onClick={() => setUploadModal(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            Upload Image
          </button>
        )}
      </div>

      {/* Notification */}
      {notification.show && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${
          notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        } text-white`}>
          {notification.message}
        </div>
      )}

      {/* Images Grid */}
      {images.length === 0 ? (
        <div className="text-center py-12">
          <PhotoIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No images in gallery</p>
          {user?.role === 'admin' && (
            <button
              onClick={() => setUploadModal(true)}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Upload First Image
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {images.map((image) => (
            <div key={image.id} className="bg-white rounded-lg shadow-md overflow-hidden group">
              <div className="aspect-square relative">
                <img
                  src={image.image_url}
                  alt={image.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300 flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex space-x-2">
                    <button
                      onClick={() => openViewModal(image)}
                      className="p-2 bg-white rounded-full hover:bg-gray-100"
                    >
                      <EyeIcon className="w-4 h-4 text-gray-700" />
                    </button>
                    {user?.role === 'admin' && (
                      <>
                        <button
                          onClick={() => openEditModal(image)}
                          className="p-2 bg-white rounded-full hover:bg-gray-100"
                        >
                          <PencilIcon className="w-4 h-4 text-gray-700" />
                        </button>
                        <button
                          onClick={() => handleDelete(image.id)}
                          className="p-2 bg-white rounded-full hover:bg-gray-100"
                        >
                          <TrashIcon className="w-4 h-4 text-red-600" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 truncate">{image.title}</h3>
                <p className="text-sm text-gray-600 truncate">{image.description}</p>
                <p className="text-xs text-gray-500 mt-2">
                  By {image.uploader_name} • {new Date(image.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {uploadModal && user?.role === 'admin' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Upload Image</h2>
              <button
                onClick={() => setUploadModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleUpload}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Image
                </label>
                <input
                  type="file"
                  name="image"
                  accept="image/*"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setUploadModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {uploading ? 'Uploading...' : 'Upload'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editModal && selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Edit Image</h2>
              <button
                onClick={() => setEditModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleUpdate}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setEditModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Modal */}
      {viewModal && selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">{selectedImage.title}</h2>
              <button
                onClick={() => setViewModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            <div className="mb-4">
              <img
                src={selectedImage.image_url}
                alt={selectedImage.title}
                className="w-full h-auto max-h-96 object-contain"
              />
            </div>
            <div>
              <p className="text-gray-700 mb-2">{selectedImage.description}</p>
              <p className="text-sm text-gray-500">
                Uploaded by {selectedImage.uploader_name} ({selectedImage.uploader_role}) on {new Date(selectedImage.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Gallery;
