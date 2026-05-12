import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import api from './api';

// Template Components
import ExecutiveTemplate from './templates/ExecutiveTemplate';
import ProfessionalTemplate from './templates/ProfessionalTemplate';
import ModernTemplate from './templates/ModernTemplate';
import MinimalTemplate from './templates/MinimalTemplate';

import { trimToPageLimit } from './utils/pagination';

const TEMPLATE_COMPONENTS = {
  'Executive': ExecutiveTemplate,
  'Professional': ProfessionalTemplate,
  'Modern': ModernTemplate,
  'Minimal': MinimalTemplate,
};

function PrintableTemplate() {
  const { username, templateName } = useParams();
  const [searchParams] = useSearchParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState('free');
  const [currentUser, setCurrentUser] = useState(null);

  const isOptimized = searchParams.get('mode') === 'optimized';

  useEffect(() => {
    fetchData();
    fetchCurrentUser();
  }, [username, templateName, isOptimized]);

  const fetchCurrentUser = async () => {
    try {
      const res = await api.get('/auth/me');
      setCurrentUser(res.data);
      setSubscriptionStatus(res.data.subscription_status || 'free');
    } catch (err) {
      console.error('Not logged in');
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      let res;
      if (isOptimized) {
        res = await api.get(`/public/${username}/optimized/${templateName}`);
      } else {
        res = await api.get(`/public/${username}`);
      }
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Data not found');
    } finally {
      setLoading(false);
    }
  };

  const isOwner = currentUser?.username === username;
  const canPrint = subscriptionStatus === 'premium' || !isOwner;

  const handlePrint = () => {
    if (!canPrint) {
      alert('Upgrade to Premium to download and print your resume. Only $9.99/month!');
      return;
    }
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-500 font-medium">Preparing your professional resume...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-2xl shadow-sm border border-red-100">
          <h1 className="text-2xl font-bold text-red-500 mb-2">Error Loading Data</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <a href="/" className="text-blue-600 hover:underline">Return to Dashboard</a>
        </div>
      </div>
    );
  }

  const SelectedTemplate = TEMPLATE_COMPONENTS[templateName] || ExecutiveTemplate;
  let resumeData = data;
  
  // Apply hard trim for 2-page limit on Executive/Minimal
  if (resumeData && (templateName === 'Executive' || templateName === 'Minimal')) {
    resumeData = trimToPageLimit(resumeData, 2);
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Toolbar */}
      <div className="no-print bg-slate-900 text-white px-6 py-4 flex justify-between items-center sticky top-0 z-50 shadow-lg">
        <div className="flex items-center gap-4">
          <a href="/" className="text-slate-400 hover:text-white transition-colors flex items-center gap-2">
            <span>←</span> Back to Dashboard
          </a>
          <div className="h-4 w-px bg-slate-700"></div>
          <span className="text-sm font-medium text-slate-300">
            {templateName} Template {isOptimized ? '(AI Optimized)' : ''}
          </span>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={handlePrint} 
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all shadow-md active:scale-95 ${
              canPrint ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-slate-700 text-slate-400 cursor-not-allowed'
            }`}
          >
            🖨️ Print / Save as PDF
            {!canPrint && isOwner && <span className="text-[10px] bg-yellow-500 text-black px-1.5 py-0.5 rounded ml-1">PREMIUM</span>}
          </button>
        </div>
      </div>

      {/* Premium Upgrade Banner for Free Users */}
      {!canPrint && isOwner && (
        <div className="no-print bg-amber-50 border-b border-amber-100 text-amber-900 px-6 py-3 flex items-center justify-center gap-3">
          <span className="text-sm font-medium">🔓 Unlock printing, AI optimization, and PDF downloads globally.</span>
          <button className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-1.5 rounded-lg text-sm font-bold shadow-sm transition-colors">
            Upgrade to Premium
          </button>
        </div>
      )}

      {/* Resume Content */}
      <div className="py-12 px-4 print:p-0 print:bg-white flex justify-center">
        <div className="max-w-[794px] w-full bg-white shadow-2xl print:shadow-none">
          <SelectedTemplate data={resumeData} />
        </div>
      </div>

      {/* Print-only CSS */}
      <style>{`
        @media print {
          .no-print {
            display: none !important;
          }
          body {
            background-color: white !important;
          }
          @page {
            size: A4;
            margin: 0;
          }
          .max-w-[794px] {
            width: 210mm !important;
            max-width: none !important;
            margin: 0 !important;
            box-shadow: none !important;
          }
        }
      `}</style>
    </div>
  );
}

export default PrintableTemplate;
