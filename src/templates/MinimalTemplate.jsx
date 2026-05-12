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
    <div className="bg-white max-w-[794px] mx-auto shadow-lg print:shadow-none p-8" style={{ fontFamily: 'Arial, Calibri, sans-serif' }}>
      {/* Header - Straight from ATSScore.jsx */}
      <div className="border-b-2 border-gray-300 pb-4 mb-6">
        <h1 className="text-2xl font-bold text-black mb-1">{profile.name || 'Your Name'}</h1>
        <p className="text-md text-gray-700 mb-2">{profile.title || 'Professional Title'}</p>
        <div className="text-sm text-gray-600">
          {profile.email && <div>Email: {profile.email}</div>}
          {profile.phone && <div>Phone: {profile.phone}</div>}
          {profile.location && <div>Location: {profile.location}</div>}
          {profile.linkedin && <div>LinkedIn: {profile.linkedin}</div>}
        </div>
      </div>

      <div className="space-y-5">
        {/* Professional Summary */}
        {profile.bio && (
          <div className="mb-5">
            <h2 className="text-md font-bold text-black uppercase border-b border-gray-300 pb-1 mb-2">Professional Summary</h2>
            <p className="text-sm text-gray-800 leading-relaxed">{profile.bio}</p>
          </div>
        )}

        {/* Work Experience */}
        {experience.length > 0 && (
          <div className="mb-5">
            <h2 className="text-md font-bold text-black uppercase border-b border-gray-300 pb-1 mb-3">Work Experience</h2>
            {experience.map((exp) => (
              <div key={exp.id} className="mb-4">
                <div className="flex justify-between flex-wrap">
                  <div>
                    <h3 className="text-sm font-bold text-black">{exp.job_title}</h3>
                    <p className="text-sm text-gray-700">{exp.company}{exp.location ? `, ${exp.location}` : ''}</p>
                  </div>
                  <p className="text-sm text-gray-500">{exp.start_date} — {exp.current ? 'Present' : exp.end_date}</p>
                </div>
                {exp.highlights && exp.highlights.length > 0 && (
                  <ul className="mt-2 list-disc list-inside space-y-0.5">
                    {exp.highlights.slice(0, 6).map((h, i) => (
                      <li key={i} className="text-sm text-gray-700">{h}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Skills */}
        {skills.length > 0 && (
          <div className="mb-5">
            <h2 className="text-md font-bold text-black uppercase border-b border-gray-300 pb-1 mb-2">Skills</h2>
            {Object.entries(skillsByCategory).map(([cat, catSkills]) => (
              <div key={cat} className="mb-3">
                <h3 className="text-sm font-semibold text-gray-800">{cat}</h3>
                <p className="text-sm text-gray-700">{catSkills.map(s => s.name).join(', ')}</p>
              </div>
            ))}
          </div>
        )}

        {/* Projects */}
        {projects.length > 0 && (
          <div className="mb-5">
            <h2 className="text-md font-bold text-black uppercase border-b border-gray-300 pb-1 mb-2">Key Projects</h2>
            {projects.map((p) => (
              <div key={p.id} className="mb-3">
                <h3 className="text-sm font-bold text-black">{p.title}</h3>
                <p className="text-sm text-gray-700">{p.description}</p>
                {p.tech_stack && p.tech_stack.length > 0 && (
                  <p className="text-sm text-gray-600 mt-1 italic">Stack: {p.tech_stack.join(', ')}</p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Education */}
        {education.length > 0 && (
          <div className="mb-5">
            <h2 className="text-md font-bold text-black uppercase border-b border-gray-300 pb-1 mb-2">Education</h2>
            {education.map((edu) => (
              <div key={edu.id} className="mb-3">
                <div className="flex justify-between flex-wrap">
                  <div>
                    <h3 className="text-sm font-bold text-black">{edu.degree}{edu.field ? ` in ${edu.field}` : ''}</h3>
                    <p className="text-sm text-gray-700">{edu.institution}{edu.location ? `, ${edu.location}` : ''}</p>
                  </div>
                  <p className="text-sm text-gray-500">{edu.start_year} — {edu.end_year || 'Present'}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Achievements */}
        {achievements.length > 0 && (
          <div className="mb-5">
            <h2 className="text-md font-bold text-black uppercase border-b border-gray-300 pb-1 mb-2">Achievements</h2>
            {achievements.map((a) => (
              <div key={a.id} className="mb-2">
                <h3 className="text-sm font-bold text-black">{a.title}</h3>
                <p className="text-sm text-gray-600">{a.issuer} — {a.date}</p>
              </div>
            ))}
          </div>
        )}
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
