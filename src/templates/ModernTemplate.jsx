import React from 'react';

function ModernTemplate({ data }) {
  if (!data) return null;
  const { profile = {}, experience = [], education = [], skills = [], projects = [], achievements = [] } = data;

  const skillsByCategory = {};
  skills.forEach(s => {
    if (!skillsByCategory[s.category]) skillsByCategory[s.category] = [];
    skillsByCategory[s.category].push(s);
  });

  return (
    <div className="bg-white max-w-[794px] mx-auto shadow-lg print:shadow-none flex min-h-[1100px]">
      {/* Sidebar - Skills Left */}
      <div className="w-1/3 bg-slate-900 text-white p-8 space-y-8">
        <div className="space-y-4">
          {profile.avatar_url && (
            <img src={profile.avatar_url} className="w-32 h-32 rounded-2xl object-cover border-2 border-blue-500 mx-auto" referrerPolicy="no-referrer" />
          )}
          <div className="text-center">
            <h1 className="text-xl font-bold tracking-tight">{profile.name}</h1>
            <p className="text-xs text-blue-400 font-medium uppercase tracking-wider">{profile.title}</p>
          </div>
        </div>

        <div className="space-y-2 text-xs opacity-90">
          <p className="flex items-center gap-2">📧 {profile.email}</p>
          <p className="flex items-center gap-2">📞 {profile.phone}</p>
          <p className="flex items-center gap-2">📍 {profile.location}</p>
        </div>

        <div className="space-y-6">
          {Object.entries(skillsByCategory).map(([cat, catSkills]) => (
            <div key={cat}>
              <h2 className="text-xs font-black uppercase text-blue-400 mb-3 tracking-widest">{cat}</h2>
              <div className="flex flex-wrap gap-2">
                {catSkills.map(s => (
                  <span key={s.id} className="text-[10px] px-2 py-1 bg-slate-800 rounded border border-slate-700">
                    {s.name}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
        
        {education.length > 0 && (
          <div>
            <h2 className="text-xs font-black uppercase text-blue-400 mb-3 tracking-widest">Education</h2>
            <div className="space-y-4">
              {education.map(edu => (
                <div key={edu.id}>
                  <p className="text-xs font-bold">{edu.degree}</p>
                  <p className="text-[10px] opacity-70">{edu.institution}</p>
                  <p className="text-[10px] text-blue-300">{edu.end_year}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main Content - Experience Right */}
      <div className="flex-1 p-10 space-y-8">
        {profile.bio && (
          <div>
            <h2 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
              <span className="w-8 h-1 bg-blue-500 rounded"></span> Profile
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">{profile.bio}</p>
          </div>
        )}

        {experience.length > 0 && (
          <div>
            <h2 className="text-lg font-bold text-slate-800 mb-5 flex items-center gap-2">
              <span className="w-8 h-1 bg-blue-500 rounded"></span> Experience
            </h2>
            <div className="space-y-6">
              {experience.map((exp) => (
                <div key={exp.id} className="relative pl-6 border-l-2 border-slate-100 pb-2">
                  <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-white border-2 border-blue-500"></div>
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="text-sm font-bold text-slate-900">{exp.job_title}</h3>
                    <span className="text-xs font-bold text-blue-600">{exp.start_date} — {exp.current ? 'Present' : exp.end_date}</span>
                  </div>
                  <p className="text-xs font-bold text-slate-500 mb-2 tracking-wide uppercase">{exp.company}</p>
                  <ul className="space-y-1.5">
                    {exp.highlights?.map((h, i) => (
                      <li key={i} className="text-xs text-slate-600 flex items-start gap-2">
                        <span className="text-blue-500 mt-1">▹</span> {h}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {projects.length > 0 && (
          <div>
            <h2 className="text-lg font-bold text-slate-800 mb-5 flex items-center gap-2">
              <span className="w-8 h-1 bg-blue-500 rounded"></span> Projects
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {projects.map((p) => (
                <div key={p.id} className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <h3 className="text-xs font-bold text-slate-800 mb-1">{p.title}</h3>
                  <p className="text-[10px] text-slate-500 line-clamp-3">{p.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ModernTemplate;
