import React, { useRef, useState } from 'react';
import { toPng } from 'html-to-image';
import { 
  Download, 
  Share2, 
  MapPin, 
  Mail, 
  Linkedin, 
  ChevronLeft,
  Award,
  BookOpen,
  Briefcase,
  User,
  ShieldCheck,
  Loader2
} from 'lucide-react';

function ProfessionalProfileView({ data, onClose }) {
  const profileRef = useRef(null);
  const [exporting, setExporting] = useState(false);
  const [shared, setShared] = useState(false);

  // Mock data/Fallbacks if data is incomplete
  const profile = data?.profile || {
    name: "Standard Applicant",
    title: "Industry Professional",
    bio: "Resourceful professional with a commitment to excellence.",
    location: "Global",
    email: "professional@example.com",
    linkedin: "linkedin.com/in/professional"
  };

  const experience = data?.experience || [];
  const education = data?.education || [];
  const skills = data?.skills || [];
  const achievements = data?.achievements || [];

  const handleDownload = async () => {
    if (profileRef.current === null) return;
    
    setExporting(true);
    try {
      // Add a small delay for DOM to settle
      await new Promise(resolve => setTimeout(resolve, 500));
      const dataUrl = await toPng(profileRef.current, { 
        cacheBust: true,
        backgroundColor: '#f8fafc', // slate-50
        style: {
          transform: 'scale(1)',
        }
      });
      const link = document.createElement('a');
      link.download = `Professional_Presence_${profile.name.replace(/\s+/g, '_')}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Export failed:', err);
      alert('Failed to generate image. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      setShared(true);
      setTimeout(() => setShared(false), 3000);
    });
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4 md:p-8">
      <div className="bg-white w-full max-w-4xl max-h-[95vh] overflow-hidden rounded-none shadow-2xl relative flex flex-col">
        
        {/* Toolbar */}
        <div className="bg-white z-10 border-b border-slate-100 p-4 flex justify-between items-center shrink-0">
          <button 
            onClick={onClose}
            className="flex items-center gap-2 text-slate-600 hover:text-purple-600 transition font-medium text-sm"
          >
            <ChevronLeft size={18} />
            Back to Scanner
          </button>
          
          <div className="flex gap-3">
            <button 
              onClick={handleShare}
              className={`px-4 py-2 text-sm font-semibold flex items-center gap-2 transition border ${
                shared ? 'bg-green-50 text-green-700 border-green-200' : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200'
              }`}
            >
              <Share2 size={16} />
              {shared ? 'Copied!' : 'Share Profile'}
            </button>
            <button 
              onClick={handleDownload}
              disabled={exporting}
              className="px-4 py-2 bg-purple-600 text-white hover:bg-purple-700 text-sm font-semibold flex items-center gap-2 transition disabled:bg-purple-300"
            >
              {exporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
              {exporting ? 'Generating...' : 'Export as PNG'}
            </button>
          </div>
        </div>

        {/* Profile Scroll Container */}
        <div className="flex-1 overflow-y-auto bg-slate-50">
          <div ref={profileRef} className="bg-slate-50 p-6 md:p-12 font-sans selection:bg-purple-100" id="profile-snapshot">
            <div className="max-w-3xl mx-auto space-y-8">
              
              {/* Header Section */}
              <div className="bg-white border border-slate-200 overflow-hidden shadow-sm">
                <div className="h-32 bg-slate-700 relative">
                  <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
                </div>
                <div className="p-8 pt-0 -mt-16 flex flex-col md:flex-row items-center md:items-end gap-6 text-center md:text-left">
                  <div className="w-40 h-40 bg-white border-8 border-white shadow-xl flex items-center justify-center relative overflow-hidden">
                    <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-300">
                      <User size={80} strokeWidth={1} />
                    </div>
                  </div>
                  <div className="flex-1 space-y-2 pb-2">
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight leading-tight">
                      {profile.name}
                    </h1>
                    <p className="text-xl text-slate-600 font-medium leading-relaxed">
                      {profile.title}
                    </p>
                    <div className="pt-2 flex flex-wrap justify-center md:justify-start gap-y-2 gap-x-4 text-sm text-slate-500 font-medium">
                      <span className="flex items-center gap-1.5"><MapPin size={14} className="text-slate-400" /> {profile.location}</span>
                      <span className="flex items-center gap-1.5"><Mail size={14} className="text-slate-400" /> {profile.email}</span>
                      <span className="flex items-center gap-1.5 text-purple-600 hover:underline cursor-pointer"><Linkedin size={14} /> {profile.linkedin}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* About Section */}
              <section className="bg-white border border-slate-200 p-8 shadow-sm">
                <h2 className="text-lg font-bold text-slate-900 mb-4 tracking-tight flex items-center gap-2">
                  <ShieldCheck size={20} className="text-purple-600" />
                  About
                </h2>
                <p className="text-slate-700 leading-relaxed text-lg whitespace-pre-wrap">
                  {profile.bio}
                </p>
              </section>

              {/* Experience Section */}
              <section className="bg-white border border-slate-200 p-8 shadow-sm">
                <h2 className="text-lg font-bold text-slate-900 mb-6 tracking-tight flex items-center gap-2">
                  <Briefcase size={20} className="text-purple-600" />
                  Professional Trajectory
                </h2>
                <div className="space-y-8">
                  {experience.length > 0 ? (
                    experience.slice(0, 5).map((exp, idx) => (
                      <div key={idx} className="relative">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="text-lg font-bold text-slate-900 leading-none mb-1">{exp.job_title}</h3>
                            <p className="text-slate-600 font-semibold">{exp.company}</p>
                          </div>
                          <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">{exp.start_date} — {exp.current ? 'PRESENT' : exp.end_date}</span>
                        </div>
                        {exp.highlights && exp.highlights.length > 0 && (
                          <ul className="space-y-3 mt-4">
                            {exp.highlights.slice(0, 4).map((h, i) => (
                              <li key={i} className="text-slate-700 text-base flex gap-3 leading-relaxed">
                                <span className="w-1.5 h-1.5 rounded-none bg-purple-400 mt-2.5 shrink-0"></span>
                                <span>{h}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-400 italic">No trajectory data extracted.</p>
                  )}
                </div>
              </section>

              <div className="grid md:grid-cols-2 gap-8">
                {/* Education */}
                <section className="bg-white border border-slate-200 p-8 shadow-sm h-full">
                  <h2 className="text-lg font-bold text-slate-900 mb-6 tracking-tight flex items-center gap-2">
                    <BookOpen size={20} className="text-purple-600" />
                    Academic Foundation
                  </h2>
                  <div className="space-y-6">
                    {education.length > 0 ? (
                      education.slice(0, 3).map((edu, idx) => (
                        <div key={idx} className="space-y-1">
                          <p className="font-bold text-slate-900">{edu.degree} {edu.field ? `in ${edu.field}` : ''}</p>
                          <p className="text-slate-600 text-sm">{edu.institution}</p>
                          <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">{edu.start_year} — {edu.end_year || 'CURRENT'}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-slate-400 italic">No academic data present.</p>
                    )}
                  </div>
                </section>

                {/* Skills */}
                <section className="bg-white border border-slate-200 p-8 shadow-sm h-full">
                  <h2 className="text-lg font-bold text-slate-900 mb-6 tracking-tight flex items-center gap-2">
                    <Award size={20} className="text-purple-600" />
                    Core Competencies
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {skills.length > 0 ? (
                      skills.slice(0, 15).map((skill, idx) => (
                        <span 
                          key={idx} 
                          className="px-3 py-1.5 bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wider hover:border-purple-300 transition-colors"
                        >
                          {typeof skill === 'string' ? skill : skill.name}
                        </span>
                      ))
                    ) : (
                      <p className="text-slate-400 italic">No competencies identified.</p>
                    )}
                  </div>
                </section>
              </div>

              {/* Achievements Section */}
              {achievements.length > 0 && (
                <section className="bg-white border border-slate-200 p-8 shadow-sm">
                  <h2 className="text-lg font-bold text-slate-900 mb-4 tracking-tight flex items-center gap-2">
                    <Award size={20} className="text-purple-600" />
                    Milestone Recognition
                  </h2>
                  <div className="grid md:grid-cols-2 gap-4">
                    {achievements.slice(0, 4).map((a, idx) => (
                      <div key={idx} className="p-4 bg-slate-50 border border-slate-100 flex gap-4 items-center">
                        <div className="w-10 h-10 bg-purple-100 flex items-center justify-center text-purple-600 shrink-0">
                          <Award size={20} />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-sm leading-tight">{a.title}</p>
                          <p className="text-slate-500 text-xs">{a.issuer} • {a.date}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Footer / Disclaimer */}
              <div className="pt-8 border-t border-slate-200 text-center space-y-2 pb-8">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mb-4">
                  Professional Presence Architecture / ResumeApp AI
                </p>
                <div className="max-w-md mx-auto p-4 bg-slate-100/50 rounded-none border border-slate-200">
                  <p className="text-[10px] text-slate-500 italic leading-relaxed">
                    This career snapshot is an AI-generated architectural reconstruction based on narratives provided by the user. 
                    Not affiliated with, endorsed by, or integrated with LinkedIn. 
                    All brand elements are for descriptive purposes within the ResumeApp ecosystem.
                  </p>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfessionalProfileView;
