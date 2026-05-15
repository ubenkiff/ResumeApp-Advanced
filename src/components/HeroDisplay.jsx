import React from 'react';

const HeroDisplay = ({ images, defaultImages, onTemplateClick }) => {
  const templates = [
    { id: 'executive', label: 'Executive' },
    { id: 'professional', label: 'Professional' },
    { id: 'ats', label: 'ATS Friendly' },
    { id: 'modern', label: 'Modern' },
    { id: 'minimal', label: 'Minimal' },
    { id: 'creative', label: 'Creative' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-12">
      {templates.map((template) => (
        <div key={template.id} className="flex flex-col items-center gap-3 group px-1">
          <div className="relative w-full aspect-[1/1.414] overflow-hidden rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-purple-200 transition-all duration-300 bg-white">
            <img 
              src={images[template.id] || defaultImages[template.id]} 
              alt={template.label} 
              className="w-full h-full object-cover object-top cursor-pointer group-hover:scale-105 transition-transform duration-500"
              onClick={() => onTemplateClick(template.id)}
            />
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="text-[11px] font-bold text-gray-800 uppercase tracking-wider">{template.label}</span>
            <div className="h-0.5 w-4 bg-gray-200 group-hover:w-8 group-hover:bg-purple-400 transition-all"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default HeroDisplay;
