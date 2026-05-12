import React, { useState } from 'react';
import api from './api';

function ProfileForm({ profile, onRefresh }) {
  const [formData, setFormData] = useState(profile);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleImageUpload = async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    setUploading(true);
    try {
      const res = await api.post('/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setFormData(prev => ({ ...prev, avatar_url: res.data.url }));
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/profile', formData);
      onRefresh();
      alert('Profile saved successfully!');
    } catch (error) {
      console.error('Save error:', error);
      alert('Error saving profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Profile</h1>
        <p className="text-slate-400 text-sm mt-1">Your basic info shown on the portfolio and resume.</p>
      </div>
      <form onSubmit={handleSubmit} className="bg-slate-800 rounded-2xl shadow-xl p-8 border border-slate-700">
        <div className="mb-8 pb-6 border-b border-slate-700">
          <label className="block text-sm font-medium text-slate-300 mb-4">PROFILE PHOTO</label>
          <div className="flex items-center gap-6">
            {formData.avatar_url ? (
              <img src={formData.avatar_url} alt={formData.name} className="w-24 h-24 rounded-full object-cover border-4 border-blue-500" />
            ) : (
              <div className="w-24 h-24 rounded-full bg-slate-700 flex items-center justify-center border-4 border-slate-600">
                <i className="fas fa-user text-3xl text-slate-500"></i>
              </div>
            )}
            <div>
              <label className="cursor-pointer">
                <span className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-sm transition inline-block">
                  {formData.avatar_url ? 'Change Photo' : 'Upload Photo'}
                </span>
                <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e.target.files[0])} className="hidden" />
              </label>
              {uploading && <p className="text-blue-400 text-sm mt-2">Uploading...</p>}
              <p className="text-slate-500 text-xs mt-2">JPG, PNG or GIF. Max 5MB.</p>
            </div>
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-8 mb-6">
          <div className="space-y-5">
            <div><label className="block text-sm font-medium text-slate-300 mb-2">Full Name</label><input type="text" value={formData.name || ''} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full p-3 bg-slate-900 border border-slate-700 rounded-lg text-white" /></div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Career Level</label>
              <select 
                value={formData.career_level || 'mid'} 
                onChange={(e) => setFormData({ ...formData, career_level: e.target.value })}
                className="w-full p-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="executive">Executive</option>
                <option value="senior">Senior Manager</option>
                <option value="mid">Mid Level</option>
                <option value="junior">Junior</option>
                <option value="graduate">Graduate</option>
                <option value="intern">Intern</option>
              </select>
            </div>
            <div><label className="block text-sm font-medium text-slate-300 mb-2">Professional Title</label><input type="text" value={formData.title || ''} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full p-3 bg-slate-900 border border-slate-700 rounded-lg text-white" /></div>
            <div><label className="block text-sm font-medium text-slate-300 mb-2">Bio / Personal Statement</label><textarea rows="6" value={formData.bio || ''} onChange={(e) => setFormData({ ...formData, bio: e.target.value })} className="w-full p-3 bg-slate-900 border border-slate-700 rounded-lg text-white" /></div>
          </div>
          <div className="space-y-5">
            <div><label className="block text-sm font-medium text-slate-300 mb-2">Location</label><input type="text" value={formData.location || ''} onChange={(e) => setFormData({ ...formData, location: e.target.value })} className="w-full p-3 bg-slate-900 border border-slate-700 rounded-lg text-white" /></div>
            <div><label className="block text-sm font-medium text-slate-300 mb-2">Email</label><input type="email" value={formData.email || ''} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full p-3 bg-slate-900 border border-slate-700 rounded-lg text-white" /></div>
            <div><label className="block text-sm font-medium text-slate-300 mb-2">Phone</label><input type="text" value={formData.phone || ''} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full p-3 bg-slate-900 border border-slate-700 rounded-lg text-white" /></div>
            <div><label className="block text-sm font-medium text-slate-300 mb-2">LinkedIn URL</label><input type="text" value={formData.linkedin || ''} onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })} className="w-full p-3 bg-slate-900 border border-slate-700 rounded-lg text-white" /></div>
            
            {formData.career_level === 'executive' && (
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2 font-bold text-blue-400">Executive Summary (Overrides Bio)</label>
                  <textarea 
                    rows="4" 
                    value={formData.executive_summary || ''} 
                    onChange={(e) => setFormData({ ...formData, executive_summary: e.target.value })} 
                    className="w-full p-3 bg-slate-900 border border-blue-900/30 rounded-lg text-white focus:ring-2 focus:ring-blue-500" 
                    placeholder="3-5 line career narrative focusing on impact and vision..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2 font-bold text-blue-400">Core Competencies (Comma Separated)</label>
                  <textarea 
                    rows="2" 
                    value={Array.isArray(formData.core_competencies) ? formData.core_competencies.join(', ') : formData.core_competencies || ''} 
                    onChange={(e) => {
                      const val = e.target.value;
                      const arr = val.split(',').map(s => s.trim()).filter(s => s !== '');
                      setFormData({ ...formData, core_competencies: arr });
                    }} 
                    className="w-full p-3 bg-slate-900 border border-blue-900/30 rounded-lg text-white focus:ring-2 focus:ring-blue-500 text-sm" 
                    placeholder="Strategic Planning, Team Leadership, Crisis Management..."
                  />
                  <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-widest">Added to the top of Executive/Senior Templates</p>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="pt-4 border-t border-slate-700">
          <button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg transition disabled:opacity-50">{saving ? 'Saving...' : 'Save Profile'}</button>
        </div>
      </form>
    </div>
  );
}

export default ProfileForm;