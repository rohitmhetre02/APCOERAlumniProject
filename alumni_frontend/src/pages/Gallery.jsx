import React, { useState, useEffect } from 'react';
import { EyeIcon, XMarkIcon } from '@heroicons/react/24/outline';

const Gallery = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewModal, setViewModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  // Fetch gallery images from API
  const fetchImages = async () => {
    try {
      const token = localStorage.getItem('alumni_token');
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
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Photo Gallery</h1>
        <p className="text-gray-600">Memories from our events and activities</p>
      </div>

      {/* Images Grid */}
      {images.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <EyeIcon className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-500">No images in gallery yet</p>
          <p className="text-sm text-gray-400 mt-2">Check back later for new photos!</p>
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
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button
                      onClick={() => openViewModal(image)}
                      className="p-2 bg-white rounded-full hover:bg-gray-100"
                    >
                      <EyeIcon className="w-4 h-4 text-gray-700" />
                    </button>
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