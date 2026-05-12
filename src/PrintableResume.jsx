import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import api from './api';
import ExecutiveTemplate from './templates/ExecutiveTemplate';
import ProfessionalTemplate from './templates/ProfessionalTemplate';
import ModernTemplate from './templates/ModernTemplate';
import MinimalTemplate from './templates/MinimalTemplate';
import { trimToPageLimit } from './utils/pagination';

const TEMPLATE_COMPONENTS = {
  Executive: ExecutiveTemplate,
  Professional: ProfessionalTemplate,
  Modern: ModernTemplate,
  Minimal: MinimalTemplate,
};

function PrintableResume() {
  const { username, templateId } = useParams();
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode') || 'standard';
  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState('free');
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    fetchData();
    fetchCurrentUser();
  }, [username, templateId, mode]);

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
    try {
      let res;
      if (mode === 'optimized') {
        // Fetch specific optimized version for this template
        const optimizedRes = await api.get('/user/optimized-resumes');
        const version = optimizedRes.data.find(v => v.template_name === templateId);
        if (version) {
          setData(version.optimized_data);
        } else {
          // Fallback to standard public data if optimized not found
          res = await api.get(`/public/${username}`);
          setData(res.data);
        }
      } else {
        res = await api.get(`/public/${username}`);
        setData(res.data);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'User not found');
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
    return <div className="min-h-screen bg-slate-100 flex items-center justify-center font-sans tracking-tight">Crystallizing document...</div>;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-2xl shadow-sm">
          <h1 className="text-2xl font-bold text-red-500 mb-2">Access Error</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  // Get template component
  const TemplateComponent = TEMPLATE_COMPONENTS[templateId] || ExecutiveTemplate;
  
  // Apply hard trim for 2-page limit on Executive/Minimal
  let displayData = data;
  if (displayData && (templateId === 'Executive' || templateId === 'Minimal')) {
    displayData = trimToPageLimit(displayData, 2);
  }

  return (
    <div className="min-h-screen bg-slate-100 font-sans">
      {/* Toolbar */}
      <div className="no-print bg-slate-900 border-b border-slate-800 text-white px-8 py-4 flex justify-between sticky top-0 z-10 items-center">
        <div className="flex flex-col">
          <a href="/" className="text-[10px] uppercase font-black tracking-widest text-blue-500 hover:text-blue-400">← Back to Dashboard</a>
          <span className="text-xs text-slate-400 font-medium">Viewing: {templateId} ({mode} mode)</span>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={handlePrint} 
            className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg active:scale-95 ${canPrint ? 'bg-blue-600 hover:bg-blue-700' : 'bg-slate-700 cursor-not-allowed opacity-50'}`}
          >
            🖨️ PDF Export
            {!canPrint && isOwner && <span className="ml-2 text-xs">(Premium)</span>}
          </button>
        </div>
      </div>

      {/* Premium Upgrade Banner for Free Users */}
      {!canPrint && isOwner && (
        <div className="no-print bg-blue-600 text-white px-8 py-4 text-center">
          <p className="font-bold text-sm uppercase tracking-widest">Executive Printing Required</p>
          <p className="text-xs opacity-90 mt-1">Upgrade to Premium to export this 2-page Executive version.</p>
          <button className="mt-4 bg-white text-blue-600 px-6 py-2 rounded-xl text-xs font-black uppercase tracking-wider shadow-xl hover:bg-slate-50 transition-colors">
            Upgrade Now
          </button>
        </div>
      )}

      {/* Content wrapper with A4 / page constraints */}
      <div className="py-12 px-4 print:p-0 print:bg-white bg-slate-100 flex flex-col items-center gap-8">
        <div className="print:shadow-none shadow-2xl">
          <TemplateComponent data={displayData} />
        </div>
        
        {/* Page counter for UX in desktop view */}
        <div className="no-print text-[10px] font-black text-slate-400 uppercase tracking-widest bg-white/50 backdrop-blur pb-12 px-4 rounded-full">
          Hard Check: Strictly optimized for 2 pages
        </div>
      </div>

      {/* Print-only CSS */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; margin: 0; padding: 0; }
          @page {
            size: A4;
            margin: 0;
          }
        }
      `}</style>
    </div>
  );
}

export default PrintableResume;
