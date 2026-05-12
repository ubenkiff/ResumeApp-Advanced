import React from 'react';

function ProfessionalTemplate({ data }) {
  if (!data) return null;
  const { profile = {}, experience = [], education = [], skills = [], projects = [], achievements = [] } = data;

  const skillsByCategory = {};
  skills.forEach(s => {
    if (!skillsByCategory[s.category]) skillsByCategory[s.category] = [];
    skillsByCategory[s.category].push(s);
  });

  return (
    <div className="bg-white max-w-[794px] mx-auto shadow-lg print:shadow-none p-10 print:p-8 font-serif">
      {/* Centered Header for Professional look */}
      <div className="text-center border-b-2 border-gray-800 pb-6 mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2 uppercase tracking-tighter">{profile.name || 'Your Name'}</h1>
        <div className="flex justify-center flex-wrap gap-4 text-xs text-gray-600 font-sans">
          {profile.location && <span>{profile.location}</span>}
          {profile.phone && <span>{profile.phone}</span>}
          {profile.email && <span>{profile.email}</span>}
          {profile.linkedin && <span>LinkedIn</span>}
        </div>
      </div>

      <div className="space-y-6 font-sans">
        {/* Summary */}
        {profile.bio && (
          <div>
            <h2 className="text-sm font-bold uppercase border-b border-gray-800 mb-2">Professional Profile</h2>
            <p className="text-xs leading-relaxed text-gray-800">{profile.bio}</p>
          </div>
        )}

        {/* Experience - Detailed focus */}
        {experience.length > 0 && (
          <div>
            <h2 className="text-sm font-bold uppercase border-b border-gray-800 mb-3">Professional Experience</h2>
            <div className="space-y-5">
              {experience.map((exp) => (
                <div key={exp.id}>
                  <div className="flex justify-between font-bold text-xs uppercase">
                    <span>{exp.company}</span>
                    <span>{exp.start_date} — {exp.current ? 'Present' : exp.end_date}</span>
                  </div>
                  <div className="flex justify-between text-xs italic mb-2">
                    <span>{exp.job_title}</span>
                    <span>{exp.location}</span>
                  </div>
                  {exp.highlights && exp.highlights.length > 0 && (
                    <ul className="list-disc list-outside ml-4 space-y-1">
                      {exp.highlights.map((h, i) => (
                        <li key={i} className="text-xs text-gray-700 leading-snug">{h}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Technical Skills */}
        {skills.length > 0 && (
          <div>
            <h2 className="text-sm font-bold uppercase border-b border-gray-800 mb-2">Core Skills</h2>
            <div className="grid grid-cols-2 gap-x-8 gap-y-1">
              {Object.entries(skillsByCategory).map(([cat, catSkills]) => (
                <div key={cat} className="flex text-xs">
                  <span className="font-bold w-32 shrink-0">{cat}:</span>
                  <span className="text-gray-700">{catSkills.map(s => s.name).join(', ')}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education */}
        {education.length > 0 && (
          <div>
            <h2 className="text-sm font-bold uppercase border-b border-gray-800 mb-3">Education</h2>
            <div className="space-y-3">
              {education.map((edu) => (
                <div key={edu.id} className="flex justify-between text-xs">
                  <div>
                    <span className="font-bold">{edu.institution}</span>
                    <span className="ml-2">— {edu.degree}{edu.field ? ` in ${edu.field}` : ''}</span>
                  </div>
                  <span className="font-bold">{edu.end_year || 'Present'}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProfessionalTemplate;
