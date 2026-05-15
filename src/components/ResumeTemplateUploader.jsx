import React, { useState } from 'react';
import { Upload, Eye, X, Image as ImageIcon } from 'lucide-react';
import api from '../api';

const ResumeTemplateUploader = ({ templateType, currentImage, onUpload, label }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState(currentImage);

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      alert('Please upload a valid image file (JPG, PNG, WebP, or SVG)');
      return;
    }
    
    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }
    
    setIsUploading(true);
    
    const formData = new FormData();
    formData.append('image', file);
    formData.append('templateType', templateType);
    
    try {
      const response = await api.post('/profile/upload-template-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setPreviewImage(response.data.imageUrl);
      onUpload(response.data.imageUrl);
      alert(`${label} template preview uploaded successfully!`);
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <>
      <div className="relative group">
        {/* Thumbnail Image */}
        <div 
          className="relative cursor-pointer overflow-hidden rounded-lg border-2 border-gray-200 hover:border-purple-400 transition-all"
          onClick={openModal}
        >
          {previewImage ? (
            <img 
              src={previewImage} 
              alt={`${label} template preview`}
              className="w-full h-48 object-cover object-top"
            />
          ) : (
            <div className="w-full h-48 bg-gray-100 flex flex-col items-center justify-center">
              <ImageIcon className="w-8 h-8 text-gray-400 mb-2" />
              <span className="text-xs text-gray-400">No preview</span>
            </div>
          )}
          
          {/* Hover overlay */}
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center">
            <Eye className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-all" />
          </div>
        </div>
        
        {/* Upload Button */}
        <div className="mt-2 flex gap-2">
          <button
            onClick={() => document.getElementById(`upload-${templateType}`).click()}
            disabled={isUploading}
            className="flex-1 px-3 py-1.5 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center justify-center gap-1"
          >
            <Upload size={14} />
            {isUploading ? 'Uploading...' : 'Upload Image'}
          </button>
        </div>
        
        <input
          id={`upload-${templateType}`}
          type="file"
          accept=".jpg,.jpeg,.png,.webp,.svg"
          className="hidden"
          onChange={handleFileSelect}
        />
      </div>
      
      {/* Full Page Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90 p-4">
          <div className="relative max-w-4xl w-full max-h-[90vh] bg-white rounded-xl overflow-hidden">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="font-semibold text-lg">{label} Template - Full Preview</h3>
              <button onClick={closeModal} className="p-1 hover:bg-gray-100 rounded">
                <X size={20} />
              </button>
            </div>
            
            {/* Modal Image */}
            <div className="overflow-y-auto max-h-[70vh] p-4">
              {previewImage ? (
                <img 
                  src={previewImage} 
                  alt={`${label} template full preview`}
                  className="w-full h-auto"
                />
              ) : (
                <div className="text-center py-12 text-gray-400">
                  <ImageIcon className="w-12 h-12 mx-auto mb-2" />
                  <p>No preview uploaded yet</p>
                  <p className="text-sm">Click "Upload Image" to add a preview</p>
                </div>
              )}
            </div>
            
            {/* Modal Footer */}
            <div className="flex justify-end gap-3 p-4 border-t bg-gray-50">
              <button
                onClick={() => {
                  document.getElementById(`upload-${templateType}`).click();
                  closeModal();
                }}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
              >
                <Upload size={16} />
                Replace Image
              </button>
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ResumeTemplateUploader;
