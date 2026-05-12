import React from 'react';

function ExecutiveTemplate({ data }) {
  if (!data) return null;
  const { profile = {}, experience = [], education = [], skills = [], projects = [], achievements = [] } = data;

  const skillsByCategory = {};
  skills.forEach(s => {
    if (!skillsByCategory[s.category]) skillsByCategory[s.category] = [];
    skillsByCategory[s.category].push(s);
  });

  return (
    <div className="bg-white max-w-[794px] mx-auto shadow-lg print:shadow-none p-10 print:p-8">
      {/* Header - Signature Style */}
      <div className="border-b-2 border-blue-500 pb-4 mb-6">
        <div className="flex gap-6">
          {profile.avatar_url && <img src={profile.avatar_url} alt={profile.name} className="w-24 h-24 rounded-full object-cover border-2 border-blue-500" referrerPolicy="no-referrer" />}
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-800 mb-1">{profile.name || 'Your Name'}</h1>
            <p className="text-sm font-semibold text-blue-600 uppercase tracking-wide mb-3">{profile.title || 'Executive Leadership'}</p>
            <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-gray-600">
              {profile.email && <span>📧 {profile.email}</span>}
              {profile.phone && <span>📞 {profile.phone}</span>}
              {profile.location && <span>📍 {profile.location}</span>}
              {profile.linkedin && <span>🔗 {profile.linkedin}</span>}
            </div>
          </div>
        </div>
      </div>
      
      <div className="space-y-6">
        {/* PAGE 1 CONTENT */}
        <div className="space-y-6">
          {/* Executive Summary */}
          {profile.bio && (
            <div>
              <h2 className="text-[10px] font-bold uppercase tracking-widest text-blue-600 mb-1.5 border-b border-gray-100 pb-1">Executive Summary</h2>
              <p className="text-[11px] leading-relaxed text-gray-700 whitespace-pre-line font-medium pr-10">{profile.bio}</p>
            </div>
          )}

          {/* Core Competencies */}
          {skills.length > 0 && (
            <div>
              <h2 className="text-[10px] font-bold uppercase tracking-widest text-blue-600 mb-2 border-b border-gray-100 pb-1">Core Competencies</h2>
              <div className="flex flex-wrap gap-1.5">
                {skills.slice(0, 15).map((s) => (
                  <span key={s.id} className="text-[9px] px-2 py-0.5 bg-blue-50 text-blue-700 rounded-sm border border-blue-100 font-bold uppercase tracking-tighter">
                    {s.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Key Achievements */}
          {achievements.length > 0 && (
            <div>
              <h2 className="text-[10px] font-bold uppercase tracking-widest text-blue-600 mb-2 border-b border-gray-100 pb-1">Key Professional Achievements</h2>
              <div className="grid grid-cols-1 gap-1.5">
                {achievements.slice(0, 4).map((a) => (
                  <div key={a.id} className="bg-slate-50 p-2 rounded border-l-2 border-blue-500 shadow-sm">
                    <div className="flex justify-between items-start mb-0.5">
                      <p className="text-[10px] font-bold text-gray-800 uppercase tracking-tight">{a.title}</p>
                      <p className="text-[8px] font-bold text-blue-600 px-1.5 py-0.5 bg-white rounded border border-blue-50">{a.issuer}</p>
                    </div>
                    {a.description && <p className="text-[9px] text-gray-600 leading-snug font-medium line-clamp-2 italic">{a.description}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* PAGE 2 CONTENT */}
        <div className="space-y-6 pt-4 border-t border-dashed border-gray-200">
          {/* Professional Experience */}
          {experience.length > 0 && (
            <div>
              <h2 className="text-[10px] font-bold uppercase tracking-widest text-blue-600 mb-3 border-b border-gray-100 pb-1">Professional Leadership Experience</h2>
              <div className="space-y-4">
                {experience.map((exp) => (
                  <div key={exp.id}>
                    <div className="flex justify-between items-baseline">
                      <p className="text-[10.5px] font-bold text-gray-800 uppercase tracking-tight">{exp.job_title}</p>
                      <p className="text-[9px] text-gray-500 font-bold tracking-tighter uppercase whitespace-nowrap ml-4">{exp.start_date} — {exp.current ? 'Present' : exp.end_date}</p>
                    </div>
                    <p className="text-[9.5px] text-blue-600 font-bold mb-1 tracking-tight">{exp.company}{exp.location ? ` | ${exp.location}` : ''}</p>
                    
                    {exp.highlights && exp.highlights.length > 0 && (
                      <ul className="space-y-0.5">
                        {exp.highlights.slice(0, 4).map((h, i) => (
                          <li key={i} className="text-[9.5px] text-gray-700 flex items-start gap-2 pr-4">
                            <span className="text-blue-500 font-bold mt-[-2px]">›</span> 
                            <span className="leading-tight">{h}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Select Projects */}
          {projects.length > 0 && (
            <div>
              <h2 className="text-[10px] font-bold uppercase tracking-widest text-blue-600 mb-2 border-b border-gray-100 pb-1">Strategic Initiatives</h2>
              <div className="grid grid-cols-2 gap-3">
                {projects.slice(0, 2).map((p) => (
                  <div key={p.id} className="border border-gray-100 p-2 rounded bg-white">
                    <p className="text-[10px] font-bold text-gray-800 leading-tight">{p.title}</p>
                    {p.description && <p className="text-[9px] text-gray-500 line-clamp-2 mt-0.5 leading-snug">{p.description}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Education & Credentials */}
          <div className="grid grid-cols-2 gap-6 border-t border-gray-50 pt-4">
            {education.length > 0 && (
              <div>
                <h2 className="text-[10px] font-bold uppercase tracking-widest text-blue-600 mb-2 border-b border-gray-50 pb-1">Academic Background</h2>
                <div className="space-y-2">
                  {education.map((edu) => (
                    <div key={edu.id}>
                      <p className="text-[10px] font-bold text-gray-800 leading-tight">{edu.degree}</p>
                      <p className="text-[9px] text-gray-500 font-medium uppercase tracking-tighter">{edu.institution} | {edu.end_year}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div>
              <h2 className="text-[10px] font-bold uppercase tracking-widest text-blue-600 mb-2 border-b border-gray-50 pb-1">Credentials</h2>
              <p className="text-[9px] text-gray-600 leading-snug italic">
                Active strategic leader with confirmed expertise in global business operations and organizational transformation.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ExecutiveTemplate;
