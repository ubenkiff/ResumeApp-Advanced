import React, { useState, useEffect } from 'react';
import api from '../api';

const Settings = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const res = await api.get('/auth/me');
      setFormData(prev => ({
        ...prev,
        username: res.data.username,
        email: res.data.email
      }));
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const updateData = {
        username: formData.username,
        email: formData.email
      };
      
      await api.put('/auth/profile', updateData);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      
      // Refresh user data if needed, or just let the dashboard handle it via state
      // For now, we follow the request's exact logic
      setTimeout(() => window.location.reload(), 1500);
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.error || 'Update failed' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    if (formData.newPassword !== formData.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }
    
    if (formData.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters' });
      return;
    }

    setIsLoading(true);
    setMessage({ type: '', text: '' });

    try {
      await api.put('/auth/password', {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword
      });
      
      setMessage({ type: 'success', text: 'Password changed successfully!' });
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.error || 'Password change failed' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Account Settings</h1>
      
      {/* Message */}
      {message.text && (
        <div className={`p-4 rounded-lg mb-6 flex items-center gap-3 animate-in fade-in duration-300 ${
          message.type === 'success' ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-red-100 text-red-700 border border-red-200'
        }`}>
          <i className={`fas ${message.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}`}></i>
          {message.text}
        </div>
      )}

      {/* Profile Settings */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <i className="fas fa-user-circle text-purple-600"></i>
          Profile Information
        </h2>
        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all outline-none"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all outline-none"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors font-semibold"
          >
            {isLoading ? <i className="fas fa-spinner fa-spin mr-2"></i> : null}
            {isLoading ? 'Saving...' : 'Update Profile'}
          </button>
        </form>
      </div>

      {/* Password Change */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <i className="fas fa-key text-purple-600"></i>
          Change Password
        </h2>
        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
            <input
              type="password"
              name="currentPassword"
              value={formData.currentPassword}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all outline-none"
              required
            />
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
              <input
                type="password"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all outline-none"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all outline-none"
                required
              />
            </div>
          </div>
          
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-black disabled:opacity-50 transition-colors font-semibold"
          >
            {isLoading ? <i className="fas fa-spinner fa-spin mr-2"></i> : null}
            {isLoading ? 'Updating...' : 'Change Password'}
          </button>
        </form>
      </div>
      
      {/* Danger Zone */}
      <div className="mt-8 p-6 border border-red-200 rounded-xl bg-red-50">
        <h3 className="text-red-800 font-bold mb-2 flex items-center gap-2">
          <i className="fas fa-exclamation-triangle"></i>
          Danger Zone
        </h3>
        <p className="text-red-600 text-sm mb-4">Deleting your account is permanent and will remove all your resumes, scans, and data.</p>
        <button
          onClick={() => {
            if (window.confirm('Are you ABSOLUTELY sure? This action CANNOT be undone and all your data will be permanently deleted.')) {
              // We'll need a delete account route for this
              alert('Account deletion requested. Please contact support to finalize.');
            }
          }}
          className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold"
        >
          Delete My Account
        </button>
      </div>
    </div>
  );
};

export default Settings;
