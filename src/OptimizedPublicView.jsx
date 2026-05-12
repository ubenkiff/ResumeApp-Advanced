import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from './api';
import WhatsAppButton from './components/WhatsAppButton';

// Template Components
import ExecutiveTemplate from './templates/ExecutiveTemplate';
import ProfessionalTemplate from './templates/ProfessionalTemplate';
import ModernTemplate from './templates/ModernTemplate';
import MinimalTemplate from './templates/MinimalTemplate';

const TEMPLATES = {
  'Executive': ExecutiveTemplate,
  'Professional': ProfessionalTemplate,
  'Modern': ModernTemplate,
  'Minimal': MinimalTemplate,
};

function OptimizedPublicView() {
  const { username, templateName } = useParams();
  const [optimizedData, setOptimizedData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOptimizedData();
  }, [username, templateName]);

  const fetchOptimizedData = async () => {
    try {
      const res = await api.get(`/public/${username}/optimized/${templateName}`);
      setOptimizedData(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Optimized resume not found');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-500 text-xl">Loading optimized resume...</div>;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-500 mb-2">Notice</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <a href="/#/" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">Back to Home</a>
        </div>
        <WhatsAppButton />
      </div>
    );
  }

  const TemplateComponent = TEMPLATES[templateName] || ModernTemplate;

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4">
      <div className="max-w-[794px] mx-auto shadow-2xl bg-white rounded-sm overflow-hidden">
        <TemplateComponent data={optimizedData} />
      </div>
      
      {/* Floating Action Buttons */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 no-print">
        <button onClick={() => window.print()} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 transition text-sm">
          <i className="fas fa-print"></i> Save as PDF
        </button>
        <a href={`/#/view/${username}`} className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 transition text-sm">
          <i className="fas fa-user"></i> View Original Portfolio
        </a>
      </div>

      <WhatsAppButton />
    </div>
  );
}

export default OptimizedPublicView;
