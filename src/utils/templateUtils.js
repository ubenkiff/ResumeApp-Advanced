export const getSectionOrder = (careerLevel) => {
  const defaultOrder = ['summary', 'experience', 'education', 'skills', 'projects', 'achievements'];
  
  const orders = {
    executive: ['summary', 'competencies', 'achievements', 'experience', 'education'],
    senior: ['summary', 'experience', 'achievements', 'education', 'skills'],
    mid: ['summary', 'experience', 'education', 'skills', 'projects'],
    junior: ['skills', 'education', 'projects', 'experience'],
    graduate: ['education', 'skills', 'internships', 'projects', 'experience'],
    intern: ['education', 'skills', 'projects', 'experience'],
  };

  return orders[careerLevel] || defaultOrder;
};
