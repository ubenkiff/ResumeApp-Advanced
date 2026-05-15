import React, { useState } from 'react';
import { Upload, X, Image as ImageIcon, Trash2 } from 'lucide-react';
import api from '../api';

const AdminHeroUploader = ({ templateType, currentImage, onUpload, label, defaultImage }) => {
  const [isUploading, setIsUploading] = useState(false);
  const displayImage = currentImage || defaultImage;

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      alert('Please upload a valid image file (JPG, PNG, WebP, or SVG)');
      return;
    }
    
    setIsUploading(true);
    const formData = new FormData();
    formData.append('image', file);
    formData.append('templateType', templateType);
    
    try {
      const response = await api.post('/global-templates/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      onUpload(response.data.imageUrl);
    } catch (error) {
      console.error('Admin upload error:', error);
      alert('Failed to update global image');
    } finally {
      setIsUploading(false);
    }
  };

  const handleReset = async () => {
    if (!window.confirm(`Reset ${label} to default image?`)) return;
    
    try {
      await api.delete(`/global-templates/${templateType}`);
      onUpload(null);
    } catch (error) {
      alert('Failed to reset image');
    }
  };

  return (
    <div className="flex flex-col items-center gap-3 p-4 border-2 border-dashed border-purple-200 rounded-xl bg-purple-50/30">
      <div className="relative group w-full">
        <img 
          src={displayImage} 
          alt={label} 
          className="hero-thumb w-full shadow-lg"
        />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
          <span className="text-white text-xs font-bold uppercase tracking-wider">Admin Edit</span>
        </div>
      </div>
      
      <div className="flex flex-col w-full gap-2">
        <span className="text-xs font-bold text-gray-500 text-center uppercase tracking-tight">{label}</span>
        
        <div className="flex gap-1">
          <button
            onClick={() => document.getElementById(`admin-upload-${templateType}`).click()}
            disabled={isUploading}
            className="flex-1 px-2 py-1.5 bg-purple-600 text-white text-[10px] uppercase font-bold rounded-md hover:bg-purple-700 flex items-center justify-center gap-1"
          >
            <Upload size={12} />
            {isUploading ? 'Uploading...' : 'Upload'}
          </button>
          
          <button
            onClick={handleReset}
            className="px-2 py-1.5 bg-gray-200 text-gray-600 text-[10px] uppercase font-bold rounded-md hover:bg-gray-300"
            title="Reset to default"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>
      
      <input
        id={`admin-upload-${templateType}`}
        type="file"
        accept=".jpg,.jpeg,.png,.webp,.svg"
        className="hidden"
        onChange={handleFileSelect}
      />
    </div>
  );
};

export default AdminHeroUploader;
