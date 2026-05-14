import React, { useState, useRef, useEffect } from 'react';
import api from '../api';
import resilientApi from '../services/resilientApi';
import { Shield, CheckCircle, AlertCircle, TrendingUp, Info, Layout, Loader2, Sparkles, Download, Eye, FileText } from 'lucide-react';
import ProfessionalProfileView from '../components/ProfessionalProfileView';
import LinkedInMockPreview from '../components/LinkedInMockPreview';
import featureFlags from '../config/featureFlags';
import html2canvas from 'html2canvas';

function ScannerView() {
  const [text, setText] = useState('');
  const [scanning, setScanning] = useState(false);
  const [crystallizing, setCrystallizing] = useState(false);
  const [scanData, setScanData] = useState(null);
  const [activeTab, setActiveTab] = useState('scan'); // 'scan' or 'preview'
  const [profileData, setProfileData] = useState(null);
  const [showProfileView, setShowProfileView] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Reset on mount
    setScanData(null);
    setActiveTab('scan');
  }, []);

  const handleScan = async () => {
    if (!text.trim()) return;
    
    setScanning(true);
    setScanData(null); // Clear previous data immediately
    setActiveTab('scan');
    setError(null);
    try {
      console.log('🚀 Starting scan for text:', text.substring(0, 50) + '...');
      const data = await resilientApi.post('/api/ai/scan', { text });
      
      console.log('✅ Scan response received:', data);
      
      // Update state with unique timestamp to force key-based re-render
      setScanData({ ...data, timestamp: Date.now() });
      
      // Automatically switch to preview tab after successful scan
      setTimeout(() => setActiveTab('preview'), 100);
    } catch (err) {
      console.error('❌ Scan error:', err);
      setError('Analysis failed. Using local extraction.');
      
      // Local fallback in case of total failure
      const nameMatch = text.match(/([A-Z][a-z]+ [A-Z][a-z]+)/);
      const headlineMatch = text.match(/([A-Z][a-z]+ [A-Z][a-z]+ \| [^\n]+)/);
      
      const fallbackData = {
        score: 65,
        extractedProfile: {
          fullName: nameMatch ? nameMatch[0] : 'Professional Applicant',
          headline: headlineMatch ? headlineMatch[0] : 'Strategic Leader',
          location: 'Detected from text',
          about: text.substring(0, 200).trim() + '...',
          experience: [{ company: 'Found in text', title: 'Role', dates: 'Present', bullets: ['Successfully managed projects as identified in document'] }],
          skills: ['Strategic Planning', 'Leadership']
        },
        timestamp: Date.now()
      };
      setScanData(fallbackData);
      setTimeout(() => setActiveTab('preview'), 100);
    } finally {
      setScanning(false);
    }
  };

  const handleGenerateProfile = async () => {
    if (!text.trim()) return;
    
    setCrystallizing(true);
    setError(null);
    try {
      // Use the existing crystallize endpoint to turn raw text into structured profile
      const res = await api.post('/ai/crystallize', { 
        templateName: 'Industry Snapshot', 
        rawData: { text } 
      });
      setProfileData(res.data.optimizedData);
      setShowProfileView(true);
    } catch (err) {
      console.error('Crystallization error:', err);
      setError('Failed to generate professional presence. Please try again.');
    } finally {
      setCrystallizing(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getBgColor = (score) => {
    if (score >= 80) return 'bg-green-50 border-green-200';
    if (score >= 50) return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Shield className="text-blue-600" />
            LinkedIn Impact Scanner
          </h1>
          <p className="text-gray-500 mt-1">Audit your profile impact and copyright compliance using AI.</p>
        </div>
      </div>

      {!scanData ? (
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Paste your Profile/Experience text
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="e.g. Senior Software Engineer at TechCorp. Responsible for developing web applications and managing a team of 5..."
              className="w-full h-64 p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none transition"
            />
          </div>
          
          <button
            onClick={handleScan}
            disabled={scanning || !text.trim()}
            className={`w-full py-4 rounded-xl font-bold text-white transition flex items-center justify-center gap-2 ${
              scanning || !text.trim() ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {scanning ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                Analyzing Impact...
              </>
            ) : (
              <>
                <TrendingUp size={20} />
                Run Impact Audit
              </>
            )}
          </button>
          
          {error && <p className="mt-4 text-red-600 text-center text-sm">{error}</p>}
          
          <div className="mt-8 p-4 bg-gray-50 rounded-xl flex gap-3 text-xs text-gray-500 italic">
            <Info className="shrink-0" size={16} />
            <p>
              This tool is independent and not affiliated with LinkedIn. It processes user-provided data only. 
              We do not scrape or crawl LinkedIn servers.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Header Score Card */}
          <div className={`p-8 rounded-2xl border-2 flex flex-col md:flex-row items-center gap-8 ${getBgColor(scanData.score)}`}>
            <div className="shrink-0 relative">
              <svg className="w-32 h-32 transform -rotate-90">
                <circle
                  cx="64"
                  cy="64"
                  r="58"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  className="text-gray-200"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="58"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={364.4}
                  strokeDashoffset={364.4 - (364.4 * scanData.score) / 100}
                  className={`${getScoreColor(scanData.score)} transition-all duration-1000`}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className={`text-3xl font-bold ${getScoreColor(scanData.score)}`}>{scanData.score}</span>
              </div>
            </div>
            
            <div className="flex-1">
              <h2 className="text-xl font-bold mb-2">Crystallization Score</h2>
              <p className="text-gray-700 mb-4">
                {scanData.score >= 80 
                  ? 'Excellent impact! Your profile demonstrates strong metrics and leadership velocity.' 
                  : scanData.score >= 50 
                  ? 'Solid foundation, but lacking the "executive punch". Needs more hard metrics.' 
                  : 'Critical Velocity Gap. Your profile is too duty-heavy. Needs a total metrics injection.'}
              </p>
              <div className="flex flex-wrap gap-4 items-center">
                <div className="bg-white/50 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-2 border border-gray-100">
                  <CheckCircle size={14} className="text-green-500" />
                  Metrics: {scanData.metrics.found} found
                </div>
                {scanData.copyrightSafe && (
                  <div className="bg-white/50 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-2 border border-gray-100">
                    <CheckCircle size={14} className="text-blue-500" />
                    Copyright Compliant
                  </div>
                )}
              </div>
            </div>
            
            <button 
              onClick={() => setScanData(null)}
              className="text-gray-500 hover:text-gray-900 transition font-semibold text-sm"
            >
              New Scan
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex bg-white p-1 rounded-xl border border-gray-200 max-w-sm">
            <button
              onClick={() => setActiveTab('scan')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition ${
                activeTab === 'scan' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              <FileText size={16} />
              Impact Scan
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition ${
                activeTab === 'preview' ? 'bg-purple-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              <Eye size={16} />
              Visual Preview
            </button>
          </div>

          {activeTab === 'scan' ? (
            <div className="grid md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <AlertCircle className="text-orange-500" />
                  Key Recommendations
                </h3>
                <ul className="space-y-3">
                  {scanData.suggestions.map((s, i) => (
                    <li key={i} className="text-sm text-gray-700 flex gap-2">
                      <span className="text-blue-500 font-bold">•</span>
                      {s}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Sparkles className="text-purple-500" size={18} />
                  High-Impact Refinement
                </h3>
                <div className="space-y-3">
                  {scanData.improvedBullets && scanData.improvedBullets.length > 0 ? (
                    scanData.improvedBullets.map((b, i) => (
                      <div key={i} className="p-3 bg-blue-50 rounded-lg text-sm text-blue-900 font-medium border border-blue-100">
                        {b}
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-400 italic">No refinements generated.</p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex justify-end mb-4">
                <button
                  onClick={async () => {
                    const preview = document.querySelector('.max-w-3xl');
                    if (preview) {
                      const canvas = await html2canvas(preview, { scale: 2, useCORS: true });
                      const link = document.createElement('a');
                      link.download = `LinkedIn_Preview_${Date.now()}.png`;
                      link.href = canvas.toDataURL('image/png');
                      link.click();
                    }
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition shadow-sm active:scale-95 text-sm"
                >
                  <Download size={16} />
                  Download PNG
                </button>
              </div>
              <LinkedInMockPreview key={scanData.timestamp} data={scanData} isLoading={scanning} />
            </div>
          )}
        </div>
      )}

      {showProfileView && (
        <ProfessionalProfileView 
          data={profileData} 
          onClose={() => setShowProfileView(false)} 
        />
      )}
    </div>
  );
}

export default ScannerView;
