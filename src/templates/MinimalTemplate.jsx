import React from 'react';

function MinimalTemplate({ data }) {
  if (!data) return null;
  const { profile = {}, experience = [], education = [], skills = [], projects = [], achievements = [] } = data;

  const skillsByCategory = {};
  skills.forEach(s => {
    if (!skillsByCategory[s.category]) skillsByCategory[s.category] = [];
    skillsByCategory[s.category].push(s);
  });

  return (
    <div className="bg-white max-w-[794px] mx-auto shadow-lg print:shadow-none p-10 text-black" style={{ fontFamily: '"Inter", "Segoe UI", Arial, sans-serif', color: '#000' }}>
      {/* Header - ATS Style */}
      <div className="text-center border-b-2 border-black pb-4 mb-6">
        <h1 className="text-2xl font-bold uppercase tracking-tight mb-1">{profile.name || 'Your Name'}</h1>
        <p className="text-sm font-semibold mb-2">{profile.title || 'Professional Title'}</p>
        <div className="text-xs space-x-3">
          {profile.email && <span>{profile.email}</span>}
          {profile.phone && <span>| {profile.phone}</span>}
          {profile.location && <span>| {profile.location}</span>}
          {profile.linkedin && <span>| LinkedIn: {profile.linkedin}</span>}
        </div>
      </div>

      <div className="space-y-6">
        {/* Professional Summary */}
        {profile.bio && (
          <div className="mb-6">
            <h2 className="text-sm font-bold uppercase border-b border-black pb-1 mb-2">Experience Summary</h2>
            <p className="text-xs leading-relaxed text-justify">{profile.bio.split('\n').slice(0, 3).join('\n')}</p>
          </div>
        )}

        {/* Work Experience */}
        {experience.length > 0 && (
          <div className="mb-6">
            <h2 className="text-sm font-bold uppercase border-b border-black pb-1 mb-3">Professional Experience</h2>
            {experience.slice(0, 5).map((exp) => (
              <div key={exp.id} className="mb-4">
                <div className="flex justify-between items-baseline mb-1">
                  <h3 className="text-xs font-bold uppercase">{exp.job_title}</h3>
                  <span className="text-[10px] font-semibold">{exp.start_date} — {exp.current ? 'Present' : exp.end_date}</span>
                </div>
                <p className="text-[10px] font-bold italic mb-1">{exp.company}{exp.location ? ` | ${exp.location}` : ''}</p>
                {exp.highlights && exp.highlights.length > 0 && (
                  <ul className="mt-1 space-y-0.5">
                    {exp.highlights.slice(0, 5).map((h, i) => (
                      <li key={i} className="text-[10px] flex gap-2">
                        <span className="shrink-0">-</span>
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Skills */}
        {skills.length > 0 && (
          <div className="mb-6">
            <h2 className="text-sm font-bold uppercase border-b border-black pb-1 mb-2">Technical Skills & Core Competencies</h2>
            <div className="space-y-1">
              {Object.entries(skillsByCategory).map(([cat, catSkills]) => (
                <div key={cat} className="flex gap-2 text-[10px]">
                  <span className="font-bold w-32 shrink-0">{cat}:</span>
                  <span className="flex-1">{catSkills.map(s => s.name).join(', ')}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education */}
        {education.length > 0 && (
          <div className="mb-6">
            <h2 className="text-sm font-bold uppercase border-b border-black pb-1 mb-2">Education</h2>
            {education.slice(0, 2).map((edu) => (
              <div key={edu.id} className="mb-2">
                <div className="flex justify-between items-baseline">
                  <h3 className="text-xs font-bold uppercase">{edu.degree}{edu.field ? ` in ${edu.field}` : ''}</h3>
                  <span className="text-[10px] font-semibold">{edu.start_year} — {edu.end_year || 'Present'}</span>
                </div>
                <p className="text-[10px]">{edu.institution}{edu.location ? `, ${edu.location}` : ''}</p>
              </div>
            ))}
          </div>
        )}

        {/* Achievements / Projects Integrated */}
        {(achievements.length > 0 || projects.length > 0) && (
          <div className="mb-6">
            <h2 className="text-sm font-bold uppercase border-b border-black pb-1 mb-2">Key Projects & Recognition</h2>
            <div className="grid grid-cols-2 gap-x-8 gap-y-2">
              {projects.slice(0, 4).map(p => (
                <div key={p.id}>
                  <h3 className="text-[10px] font-bold uppercase">{p.title}</h3>
                  <p className="text-[10px] leading-tight text-gray-700">{p.description}</p>
                </div>
              ))}
              {achievements.slice(0, 4).map(a => (
                <div key={a.id}>
                  <h3 className="text-[10px] font-bold uppercase">{a.title}</h3>
                  <p className="text-[10px] leading-tight text-gray-700">{a.issuer}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="mt-8 text-center border-t border-gray-100 pt-4 print:hidden">
        <p className="text-[10px] text-gray-400 italic">Minimal Template optimized for ATS and 2-page achievement focus.</p>
      </div>

      <style>{`
        @media print {
          @page {
            size: A4;
            margin: 0.5in;
          }
          body {
            background: white !important;
          }
        }
      `}</style>
    </div>
  );
}

export default MinimalTemplate;
