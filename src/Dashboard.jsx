import React, { useState, useEffect } from 'react';
import api from './api';
import ProfileForm from './ProfileForm';
import ExperienceManager from './ExperienceManager';
import EducationManager from './EducationManager';
import SkillsManager from './SkillsManager';
import ProjectsManager from './ProjectsManager';
import AchievementsManager from './AchievementsManager';
import WhatsAppButton from './components/WhatsAppButton';
import AIAssistant from './pages/AIAssistant';
import ReferencesManager from './components/ReferencesManager';
import BlurSnipTool from './components/BlurSnipTool';
import TemplateManager from './templates/TemplateManager';
import ScannerView from './pages/ScannerView';
import Settings from './pages/Settings';
import AdminHeroUploader from './components/AdminHeroUploader';
import HeroDisplay from './components/HeroDisplay';
import { 
  Shield, 
  Sparkles, 
  LayoutDashboard, 
  User, 
  Briefcase, 
  GraduationCap, 
  Code, 
  FolderOpen, 
  Trophy, 
  Bot, 
  Users, 
  Wand2, 
  LineChart, 
  Settings as SettingsIcon,
  LogOut
} from 'lucide-react';
import featureFlags from './config/featureFlags';

function Dashboard({ user, onLogout }) {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [profile, setProfile] = useState({});
  const [experience, setExperience] = useState([]);
  const [education, setEducation] = useState([]);
  const [skills, setSkills] = useState([]);
  const [projects, setProjects] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subscriptionStatus, setSubscriptionStatus] = useState('free');
  const [showBlurSnip, setShowBlurSnip] = useState(false);
  const [resumeDataForBlur, setResumeDataForBlur] = useState(null);
  const [globalImages, setGlobalImages] = useState({});

  const DEFAULT_IMAGES = {
    executive: "input_file_0.png",
    professional: "input_file_1.png",
    ats: "input_file_2.png",
    modern: "input_file_3.png",
    minimal: "input_file_4.png",
    creative: "input_file_5.png"
  };

  const isAdmin = user?.username === 'Uddi_Test2';

  const fetchGlobalImages = async () => {
    try {
      const response = await api.get('/global-templates');
      setGlobalImages(response.data);
    } catch (error) {
      console.error('Error loading global images:', error);
    }
  };

  useEffect(() => {
    fetchGlobalImages();
  }, []);

  useEffect(() => {
    fetchAllData();
    fetchSubscriptionStatus();
  }, []);

  const fetchSubscriptionStatus = async () => {
    try {
      const res = await api.get('/auth/me');
      setSubscriptionStatus(res.data.subscription_status || 'free');
    } catch (err) {
      console.error('Error fetching subscription status:', err);
    }
  };

  const fetchAllData = async () => {
    try {
      const [profileRes, expRes, eduRes, skillsRes, projectsRes, achievementsRes] = await Promise.all([
        api.get('/profile'),
        api.get('/experience'),
        api.get('/education'),
        api.get('/skills'),
        api.get('/projects'),
        api.get('/achievements')
      ]);
      setProfile(profileRes.data || {});
      setExperience(expRes.data);
      setEducation(eduRes.data);
      setSkills(skillsRes.data);
      setProjects(projectsRes.data);
      setAchievements(achievementsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshData = () => {
    fetchAllData();
  };

  const openBlurSnipTool = () => {
    setResumeDataForBlur({
      name: profile?.fullName || profile?.username || 'Your Name',
      email: profile?.email || user?.email || 'your@email.com',
      phone: profile?.phone || '(555) 123-4567',
      company: experience?.[0]?.company || 'Current Company',
      dates: experience?.[0]?.startDate ? `${experience[0].startDate} - ${experience[0].endDate || 'Present'}` : '2020 - Present',
      location: profile?.location || 'City, State'
    });
    setShowBlurSnip(true);
  };

  const menuItems = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'experience', name: 'Experience', icon: Briefcase },
    { id: 'education', name: 'Education', icon: GraduationCap },
    { id: 'skills', name: 'Skills', icon: Code },
    { id: 'projects', name: 'Projects', icon: FolderOpen },
    { id: 'achievements', name: 'Achievements', icon: Trophy },
    { id: 'ai-assistant', name: 'AI Assistant', icon: Bot },
    { id: 'references', name: 'References', icon: Users },
    { id: 'templates', name: 'AI Templates', icon: Wand2 },
    ...(featureFlags.impactScanner ? [{ id: 'scanner', name: 'Impact Scanner', icon: LineChart }] : []),
    { id: 'settings', name: 'Settings', icon: SettingsIcon }
  ];

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-500 text-center">
            <i className="fas fa-spinner fa-spin text-3xl mb-3"></i>
            <p>Loading your data...</p>
          </div>
        </div>
      );
    }

    switch (currentPage) {
      case 'dashboard':
        return (
          <div>
            {/* Welcome Section */}
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Dashboard</h1>
              <p className="text-gray-500">Welcome back, {user?.username}!</p>
            </div>

            {/* Resume Hero Section */}
            <div className="mb-10">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Resume Templates</h2>
                {isAdmin && <span className="bg-purple-100 text-purple-700 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase">Admin Mode</span>}
              </div>
              
              {isAdmin ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
                  {['executive', 'professional', 'ats', 'modern', 'minimal', 'creative'].map(type => (
                    <AdminHeroUploader
                      key={type}
                      templateType={type}
                      currentImage={globalImages[type]}
                      defaultImage={DEFAULT_IMAGES[type]}
                      onUpload={fetchGlobalImages}
                      label={type.charAt(0).toUpperCase() + type.slice(1)}
                    />
                  ))}
                </div>
              ) : (
                <HeroDisplay 
                  images={globalImages} 
                  defaultImages={DEFAULT_IMAGES} 
                  onTemplateClick={() => setCurrentPage('templates')} 
                />
              )}
            </div>

            {/* Subscription Banner */}
            {subscriptionStatus !== 'premium' && (
              <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white p-4 rounded-lg mb-6">
                <div className="flex justify-between items-center flex-wrap gap-4">
                  <div>
                    <p className="font-semibold">🔓 Upgrade to Premium</p>
                    <p className="text-sm opacity-90">Share your resume, print PDF, and more!</p>
                  </div>
                  <button 
                    onClick={() => alert('Upgrade now - Only $9.99/month! Contact admin for payment.')}
                    className="bg-white text-orange-600 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-100 transition"
                  >
                    Upgrade Now
                  </button>
                </div>
              </div>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition cursor-pointer" onClick={() => setCurrentPage('profile')}>
                <div className="flex items-center justify-between mb-2">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <User size={20} className="text-blue-600" />
                  </div>
                </div>
                <h3 className="text-gray-900 font-bold text-sm">Profile</h3>
                <p className="text-gray-500 text-xs mt-1">Personal Info</p>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition cursor-pointer" onClick={() => setCurrentPage('experience')}>
                <div className="flex items-center justify-between mb-2">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Briefcase size={20} className="text-green-600" />
                  </div>
                  <span className="text-xl font-bold text-gray-800">{experience.length}</span>
                </div>
                <h3 className="text-gray-900 font-bold text-sm">Experience</h3>
                <p className="text-gray-500 text-xs mt-1">Work History</p>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition cursor-pointer" onClick={() => setCurrentPage('skills')}>
                <div className="flex items-center justify-between mb-2">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Code size={20} className="text-purple-600" />
                  </div>
                  <span className="text-xl font-bold text-gray-800">{skills.length}</span>
                </div>
                <h3 className="text-gray-900 font-bold text-sm">Skills</h3>
                <p className="text-gray-500 text-xs mt-1">Core Expertise</p>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition cursor-pointer" onClick={() => setCurrentPage('projects')}>
                <div className="flex items-center justify-between mb-2">
                  <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <FolderOpen size={20} className="text-indigo-600" />
                  </div>
                  <span className="text-xl font-bold text-gray-800">{projects.length}</span>
                </div>
                <h3 className="text-gray-900 font-bold text-sm">Projects</h3>
                <p className="text-gray-500 text-xs mt-1">Recent Work</p>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition cursor-pointer" onClick={() => setCurrentPage('achievements')}>
                <div className="flex items-center justify-between mb-2">
                  <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                    <Trophy size={20} className="text-amber-600" />
                  </div>
                  <span className="text-xl font-bold text-gray-800">{achievements.length}</span>
                </div>
                <h3 className="text-gray-900 font-bold text-sm">Awards</h3>
                <p className="text-gray-500 text-xs mt-1">Achievements</p>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition cursor-pointer" onClick={() => setCurrentPage('templates')}>
                <div className="flex items-center justify-between mb-2">
                  <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
                    <Sparkles size={20} className="text-pink-600" />
                  </div>
                </div>
                <h3 className="text-gray-900 font-bold text-sm">AI Studio</h3>
                <p className="text-gray-500 text-xs mt-1">Crystallize</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4 mb-8">
              {/* View Portfolio - Always free */}
              <button
                onClick={() => window.open(`/#/view/${user?.username}`, '_blank')}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 transition shadow-sm"
              >
                <i className="fas fa-eye"></i> View Public Portfolio
              </button>
              
              {/* ATS Resume - Always free */}
              <button
                onClick={() => window.open(`/#/ats-resume/${user?.username}`, '_blank')}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center gap-2 transition shadow-sm"
              >
                <i className="fas fa-chart-line"></i> View ATS Resume
              </button>
              
              {/* Blur & Snip Tool - Free for all users */}
              <button
                onClick={openBlurSnipTool}
                className="px-6 py-3 bg-pink-600 hover:bg-pink-700 text-white rounded-lg flex items-center gap-2 transition shadow-sm"
              >
                <Shield size={18} />
                Blur & Snip
              </button>
              
              {/* Impact Scanner - New Docked Tab */}
              <button
                onClick={() => setCurrentPage('scanner')}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-2 transition shadow-sm"
              >
                <i className="fas fa-chart-line"></i> Impact Scanner
              </button>
              
              {/* Share Link - Premium only */}
              {subscriptionStatus === 'premium' ? (
                <button
                  onClick={() => { 
                    navigator.clipboard.writeText(`${window.location.origin}/#/view/${user?.username}`); 
                    alert('Link copied to clipboard!'); 
                  }}
                  className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center gap-2 transition shadow-sm"
                >
                  <i className="fas fa-share-alt"></i> Copy Shareable Link
                </button>
              ) : (
                <button
                  onClick={() => alert('🔓 Upgrade to Premium to share your resume! Only $9.99/month. Contact admin to upgrade.')}
                  className="px-6 py-3 bg-gray-400 hover:bg-gray-500 text-white rounded-lg flex items-center gap-2 transition shadow-sm cursor-pointer"
                >
                  <i className="fas fa-lock"></i> Share Link (Upgrade)
                </button>
              )}
              
              {/* Print/Download - Premium only */}
              {subscriptionStatus === 'premium' ? (
                <button
                  onClick={() => window.open(`/#/resume/${user?.username}`, '_blank')}
                  className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-2 transition shadow-sm"
                >
                  <i className="fas fa-print"></i> Print / Download PDF
                </button>
              ) : (
                <button
                  onClick={() => alert('🔓 Upgrade to Premium to print and download your resume! Only $9.99/month. Contact admin to upgrade.')}
                  className="px-6 py-3 bg-gray-400 hover:bg-gray-500 text-white rounded-lg flex items-center gap-2 transition shadow-sm cursor-pointer"
                >
                  <i className="fas fa-lock"></i> Print (Upgrade)
                </button>
              )}
            </div>

            {/* Quick Tips */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
              <h3 className="text-blue-800 font-semibold mb-2 flex items-center gap-2">
                <i className="fas fa-lightbulb text-yellow-500"></i> Quick Tips
              </h3>
              <ul className="text-gray-600 text-sm space-y-1">
                <li>• Add your profile information to get started</li>
                <li>• Upload a professional profile photo (Max 5MB)</li>
                <li>• Add your work experience with key highlights</li>
                <li>• List your skills and projects to showcase your expertise</li>
                <li>• Use the ATS Resume to check how recruiters see your resume</li>
                <li>• Use <span className="text-pink-600 font-semibold" onClick={() => setCurrentPage('templates')} style={{ cursor: 'pointer' }}>AI Template Studio</span> to crystallize your experience into specific styles</li>
                <li>• Use <span className="text-blue-600 font-semibold">Blur & Snip</span> to create shareable snippets with hidden sensitive info</li>
                {subscriptionStatus !== 'premium' && <li>• <span className="text-orange-600 font-semibold">Upgrade to Premium</span> to share your resume and print PDF</li>}
              </ul>
            </div>
          </div>
        );
      case 'profile':
        return <ProfileForm profile={profile} onRefresh={refreshData} />;
      case 'experience':
        return <ExperienceManager experience={experience} onRefresh={refreshData} />;
      case 'education':
        return <EducationManager education={education} onRefresh={refreshData} />;
      case 'skills':
        return <SkillsManager skills={skills} onRefresh={refreshData} />;
      case 'projects':
        return <ProjectsManager projects={projects} onRefresh={refreshData} />;
      case 'achievements':
        return <AchievementsManager achievements={achievements} onRefresh={refreshData} />;
      case 'ai-assistant':
        return <AIAssistant />;
      case 'references':
        return <ReferencesManager />;
      case 'templates':
        return <TemplateManager username={user?.username} />;
      case 'scanner':
        return featureFlags.impactScanner ? (
          <ScannerView />
        ) : null;
      case 'settings':
        return <Settings />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-gray-900 shadow-lg flex flex-col h-screen sticky top-0">
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center shadow-lg">
              <i className="fas fa-file-alt text-white text-sm"></i>
            </div>
            <div className="flex flex-col">
              <span className="font-black text-lg text-white tracking-tighter leading-none font-display">
                Resume<span className="text-blue-400">App</span>
              </span>
              <span className="text-[8px] font-bold text-gray-500 uppercase tracking-widest mt-1 font-display">
                Engineering Professionals
              </span>
            </div>
          </div>
        </div>
        <nav className="p-4 flex-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentPage(item.id)}
                className={`w-full flex items-center px-4 py-3 rounded-lg mb-1 transition-colors ${
                  currentPage === item.id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <Icon size={18} className="mr-3" />
                {item.name}
              </button>
            );
          })}
        </nav>
        <div className="p-4 border-t border-gray-800 mt-auto">
          <button
            onClick={onLogout}
            className="w-full flex items-center px-4 py-3 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
          >
            <LogOut size={18} className="mr-3" />
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-auto bg-white-gloss">
        {renderContent()}
      </div>

      {/* WhatsApp Floating Button */}
      <WhatsAppButton />

      {/* Blur & Snip Modal */}
      {showBlurSnip && (
        <BlurSnipTool
          isOpen={showBlurSnip}
          onClose={() => setShowBlurSnip(false)}
          resumeData={resumeDataForBlur}
        />
      )}
    </div>
  );
}

export default Dashboard;
