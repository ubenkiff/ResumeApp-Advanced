import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Save, Download, Layout, ChevronRight, Check, Loader2, Globe } from 'lucide-react';
import { crystallizeResumeData, saveOptimizedResume } from '../services/aiCrystallizeService';
import api from '../api';

// Template Components
import ExecutiveTemplate from './ExecutiveTemplate';
import ProfessionalTemplate from './ProfessionalTemplate';
import ModernTemplate from './ModernTemplate';
import MinimalTemplate from './MinimalTemplate';

import { trimToPageLimit } from '../utils/pagination';

const TEMPLATES = [
  { id: 'Executive', name: 'Executive', description: 'Leadership focus with high-level summary.', component: ExecutiveTemplate },
  { id: 'Professional', name: 'Professional', description: 'Formal, solid corporate structure.', component: ProfessionalTemplate },
  { id: 'Modern', name: 'Modern', description: 'Two-column layout highlighting skills.', component: ModernTemplate },
  { id: 'Minimal', name: 'Minimal', description: 'Clean, punchy and highly focused.', component: MinimalTemplate },
];

export default function TemplateManager({ username }) {
  const [selectedTemplate, setSelectedTemplate] = useState('Executive');
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizedData, setOptimizedData] = useState(null);
  const [rawData, setRawData] = useState(null);
  const [storedVersions, setStoredVersions] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    fetchRawData();
    fetchStoredVersions();
  }, []);

  const fetchRawData = async () => {
    try {
      const res = await api.get('/resume/data');
      setRawData(res.data);
    } catch (err) {
      console.error('Failed to fetch resume data:', err);
    }
  };

  const fetchStoredVersions = async () => {
    try {
      const res = await api.get('/user/optimized-resumes');
      const versions = {};
      res.data.forEach(v => {
        versions[v.template_name] = v.optimized_data;
      });
      setStoredVersions(versions);
      
      // If the currently selected template has a stored version, show it
      if (versions[selectedTemplate]) {
        setOptimizedData(versions[selectedTemplate]);
      }
    } catch (err) {
      console.error('Failed to fetch optimized versions:', err);
    }
  };

  useEffect(() => {
    if (storedVersions[selectedTemplate]) {
      setOptimizedData(storedVersions[selectedTemplate]);
    } else {
      setOptimizedData(null);
    }
  }, [selectedTemplate, storedVersions]);

  const handleCrystallize = async () => {
    if (!rawData) return;
    setIsOptimizing(true);
    setSaveSuccess(false);
    try {
      const optimized = await crystallizeResumeData(selectedTemplate, rawData);
      setOptimizedData(optimized);
    } catch (err) {
      alert('Crystallization failed: ' + err.message);
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleSave = async () => {
    if (!optimizedData) return;
    setIsSaving(true);
    try {
      await saveOptimizedResume(selectedTemplate, optimizedData);
      setStoredVersions(prev => ({ ...prev, [selectedTemplate]: optimizedData }));
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
       console.error('Save failed:', err);
       alert('Save failed. This might happen if your data is too large or contains complex characters.');
    } finally {
      setIsSaving(false);
    }
  };

  const publicLink = username ? `${window.location.origin}/#/public/${username}/optimized/${selectedTemplate}` : null;

  const handleCopyLink = () => {
    if (publicLink) {
      navigator.clipboard.writeText(publicLink);
      alert('Public template link copied!');
    }
  };

  const SelectedComponent = TEMPLATES.find(t => t.id === selectedTemplate)?.component;
  let previewData = optimizedData || rawData;
  
  // Apply hard trim for Executive and Minimal to guarantee 2-page limit
  if (previewData && (selectedTemplate === 'Executive' || selectedTemplate === 'Minimal')) {
    previewData = trimToPageLimit(previewData, 2);
  }

  const isUsingOptimized = !!optimizedData;

  const handlePrint = () => {
    if (!username) return;
    const mode = optimizedData ? 'optimized' : 'standard';
    window.open(`/#/printable/${username}/${selectedTemplate}?mode=${mode}`, '_blank');
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Selector UI */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">AI Template Studio</h2>
            <p className="text-sm text-slate-500">Pick a template and let AI crystallize your experience.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleCrystallize}
              disabled={isOptimizing || !rawData}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center gap-2 transition-all shadow-md active:scale-95 disabled:opacity-50"
            >
              {isOptimizing ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
              {storedVersions[selectedTemplate] ? 'Recrystallize with AI' : 'Crystallize with AI'}
            </button>
            {optimizedData && (
              <button
                onClick={handleSave}
                disabled={isSaving}
                className={`px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-md active:scale-95 ${
                  saveSuccess ? 'bg-emerald-500 text-white' : 'bg-slate-800 hover:bg-slate-900 text-white'
                }`}
              >
                {isSaving ? <Loader2 className="animate-spin" size={18} /> : saveSuccess ? <Check size={18} /> : <Save size={18} />}
                {saveSuccess ? 'Saved!' : 'Save Version'}
              </button>
            )}
            {previewData && (
              <button
                onClick={handlePrint}
                className="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl font-bold flex items-center gap-2 transition-all shadow-sm active:scale-95"
              >
                <Download size={18} />
                Print PDF
              </button>
            )}
          </div>
        </div>

        {publicLink && storedVersions[selectedTemplate] && (
          <div className="mb-8 p-4 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3 text-blue-700 overflow-hidden">
              <Globe size={18} className="shrink-0" />
              <div className="text-xs truncate">
                <span className="font-bold uppercase tracking-wider opacity-60 mr-2">Public Link:</span>
                <span className="font-mono">{publicLink}</span>
              </div>
            </div>
            <button 
              onClick={handleCopyLink}
              className="text-xs font-bold text-blue-600 hover:text-blue-800 px-3 py-1.5 bg-white border border-blue-200 rounded-lg shadow-sm whitespace-nowrap ml-4 transition-colors"
            >
              Copy Link
            </button>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {TEMPLATES.map((t) => (
            <button
              key={t.id}
              onClick={() => setSelectedTemplate(t.id)}
              className={`p-4 rounded-xl border-2 transition-all text-left group relative ${
                selectedTemplate === t.id
                  ? 'border-blue-500 bg-blue-50 shadow-inner'
                  : 'border-slate-100 bg-slate-50 hover:border-slate-300'
              }`}
            >
              <Layout className={`mb-3 ${selectedTemplate === t.id ? 'text-blue-500' : 'text-slate-400 group-hover:text-slate-600'}`} size={20} />
              <h3 className="font-bold text-slate-800 text-sm mb-1">{t.name}</h3>
              <p className="text-[10px] text-slate-500 leading-tight">{t.description}</p>
              {storedVersions[t.id] && (
                <div className="absolute top-2 right-2 text-emerald-500">
                  <Check size={14} />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Preview Area */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between px-2 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isUsingOptimized ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.5)]'}`}></div>
              <span>{isUsingOptimized ? 'AI Optimized Mode' : 'Live Preview Mode'}</span>
            </div>
            {!isUsingOptimized && rawData && (
              <div className="flex items-center gap-1.5 text-slate-500 lowercase font-medium tracking-normal normal-case">
                <Sparkles size={12} className="text-blue-400" />
                <span>Crystallize to enhance with AI</span>
              </div>
            )}
          </div>
          {storedVersions[selectedTemplate] && (
            <div className="flex items-center gap-2 text-blue-500">
              <Globe size={12} />
              <span>Version Published</span>
            </div>
          )}
        </div>
        
        <div className="relative min-h-[600px] bg-slate-100 rounded-2xl overflow-hidden border border-slate-200 shadow-inner">
          <AnimatePresence mode="wait">
            {!previewData && !isOptimizing ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center text-slate-400"
              >
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-200 shadow-sm">
                  <Sparkles size={32} />
                </div>
                <h3 className="text-lg font-bold text-slate-600 mb-2">No Profile Data Found</h3>
                <p className="text-sm max-w-xs">Fill out your profile and experience to see them in these beautiful templates.</p>
              </motion.div>
            ) : isOptimizing ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex flex-col items-center justify-center p-12 bg-white/70 backdrop-blur-md z-10"
              >
                 <div className="relative w-20 h-20 mb-6">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 border-4 border-blue-500 border-t-transparent rounded-full shadow-[0_0_15px_rgba(59,130,246,0.3)]"
                  />
                  <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-500" size={24} />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">AI Crystallizing...</h3>
                <p className="text-sm text-slate-500 max-w-xs text-center">Your experience is being transformed into professional excellence. This takes 5-10 seconds.</p>
              </motion.div>
            ) : (
              <motion.div
                key={selectedTemplate + (isUsingOptimized ? 'opt' : 'raw')}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="p-8 pb-32 origin-top scale-75 md:scale-90 lg:scale-100"
              >
                <div id="resume-preview-container" className="shadow-2xl">
                  <SelectedComponent data={previewData} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
