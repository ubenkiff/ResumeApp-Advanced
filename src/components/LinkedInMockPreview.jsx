import React from 'react';
import { Shield, Sparkles } from 'lucide-react';

const LinkedInMockPreview = ({ data, isLoading }) => {
  if (isLoading) {
    return (
      <div className="text-center py-12 bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-600 mb-4"></div>
        <p className="text-gray-500 font-medium">Generating your LinkedIn-style preview...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12 text-gray-400 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
        <p className="mb-2 font-medium">🔍 Complete a scan to see your LinkedIn-style preview</p>
        <p className="text-sm">Your transformed profile will appear here after analysis</p>
      </div>
    );
  }

  // Handle both possible data structures from AI service
  const profile = data.extractedProfile || data.profilePreview || {
    fullName: data.fullName || data.name || 'Professional Applicant',
    headline: data.headline || data.title || 'Impact-Driven Professional',
    location: data.location || 'Global',
    about: data.about || data.summary || 'Summary not available',
    experience: data.experience || [],
    skills: data.skills || []
  };

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Cover Image */}
      <div className="h-32 bg-gradient-to-r from-purple-500 to-teal-500"></div>
      
      {/* Profile Header */}
      <div className="px-6 pb-6 relative">
        <div className="flex items-end justify-between -mt-16 mb-4">
          <div className="flex items-end gap-5">
            {/* Avatar */}
            <div className="w-32 h-32 bg-purple-600 rounded-full border-4 border-white flex items-center justify-center text-white text-4xl font-bold shadow-lg">
              {profile.fullName?.charAt(0) || 'P'}
            </div>
            
            {/* Name & Title */}
            <div className="pb-2">
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold text-gray-900">{profile.fullName || 'Professional Name'}</h2>
                <div className="px-2 py-0.5 bg-purple-100 text-purple-700 text-[10px] font-bold rounded uppercase tracking-wider">
                  Impact Verified
                </div>
              </div>
              <p className="text-gray-700 font-medium text-lg mt-1">{profile.headline || 'Professional Headline'}</p>
              <div className="flex items-center gap-3 text-sm text-gray-500 mt-2">
                <span>{profile.location || 'Location'}</span>
                <span>•</span>
                <span className="text-purple-600 font-semibold cursor-pointer hover:underline">Contact info</span>
              </div>
            </div>
          </div>
          
          <div className="hidden md:flex gap-2">
            <button className="px-4 py-1.5 bg-purple-600 text-white rounded-full text-sm font-bold hover:bg-purple-700 transition">Open to</button>
            <button className="px-4 py-1.5 border border-purple-600 text-purple-600 rounded-full text-sm font-bold hover:bg-purple-50 transition">More</button>
          </div>
        </div>
      </div>

      {/* About Section */}
      <div className="px-8 py-6 border-t border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-gray-900 text-lg">About</h3>
          <Sparkles size={16} className="text-purple-500" />
        </div>
        <p className="text-gray-600 leading-relaxed">
          {profile.about || 'A summary of your professional background and key impact areas will be generated here.'}
        </p>
      </div>

      {/* Experience Section */}
      <div className="px-8 py-6 border-t border-gray-100">
        <h3 className="font-bold text-gray-900 text-lg mb-5">Experience</h3>
        <div className="space-y-8">
          {profile.experience && profile.experience.length > 0 ? (
            profile.experience.map((exp, idx) => (
              <div key={idx} className="flex gap-4 group">
                <div className="w-12 h-12 bg-gray-100 rounded flex-shrink-0 flex items-center justify-center text-gray-400 font-bold border border-gray-200">
                  {exp.company?.charAt(0) || 'C'}
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-gray-900 group-hover:text-purple-600 transition-colors">{exp.title}</h4>
                  <p className="text-gray-700 text-sm font-medium">{exp.company}</p>
                  <p className="text-gray-500 text-xs mt-0.5">{exp.dates || 'Dates not specified'}</p>
                  
                  {exp.bullets && exp.bullets.length > 0 && (
                    <ul className="mt-3 space-y-2">
                      {exp.bullets.map((bullet, i) => (
                        <li key={i} className="text-sm text-gray-600 flex gap-2">
                          <span className="text-teal-500 font-bold">•</span>
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="py-4 text-gray-400 italic text-sm text-center bg-gray-50 rounded-lg">
              No detailed experience extraction available from current text snippet.
            </div>
          )}
        </div>
      </div>

      {/* Skills Section */}
      <div className="px-8 py-6 border-t border-gray-100">
        <h3 className="font-bold text-gray-900 text-lg mb-4">Skills</h3>
        <div className="flex flex-wrap gap-2">
          {profile.skills && profile.skills.length > 0 ? (
            profile.skills.map((skill, idx) => (
              <div key={idx} className="px-4 py-1.5 bg-purple-50 text-purple-700 border border-purple-100 rounded-full text-sm font-semibold transition hover:bg-purple-100 cursor-default">
                {skill}
              </div>
            ))
          ) : (
            <p className="text-gray-400 italic text-sm">Key skills will be identified here.</p>
          )}
        </div>
      </div>

      {/* Footer Disclaimer */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-center gap-2">
        <Shield size={14} className="text-teal-600" />
        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
          AI-generated preview based on scanned data • Not affiliated with LinkedIn
        </span>
      </div>
    </div>
  );
};

export default LinkedInMockPreview;
