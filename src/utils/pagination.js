/**
 * Executive Resume Pagination Logic
 * Estimates if the content will fit on 2 pages and trims accordingly.
 * Priorities: 
 * 1. Profile/Summary (Never trim)
 * 2. Key Achievements (Top 5)
 * 3. Work Experience (Prioritize recent, trim bullets then old roles)
 * 4. Education (Compact)
 * 5. Projects (Top 2-3)
 */

export const trimToPageLimit = (data, maxPages = 2) => {
  const { profile, experience, education, skills, projects, achievements } = data;
  
  // Approximate "units" of vertical space (1 unit ~ 1 line of text)
  // Page 1 + Page 2 total = ~100-110 units depending on font size
  const PAGE_CAPACITY = maxPages === 2 ? 105 : 55;
  
  let currentUnits = 0;
  
  // Header + Summary
  currentUnits += 10;
  
  // Achievements
  const trimmedAchievements = achievements.slice(0, 4);
  currentUnits += trimmedAchievements.length * 4;
  
  // Skills
  currentUnits += Math.ceil(skills.length / 4) * 2;
  
  // Education
  const trimmedEducation = education.slice(0, 2);
  currentUnits += trimmedEducation.length * 3;
  
  // Projects
  const trimmedProjects = projects.slice(0, 2);
  currentUnits += trimmedProjects.length * 5;
  
  // Experience (The most flexible part)
  const availableExperienceUnits = PAGE_CAPACITY - currentUnits;
  let expUnits = 0;
  const trimmedExperience = [];
  
  for (const exp of experience) {
    const expCost = 4 + (exp.highlights?.length || 0) * 1.5;
    if (expUnits + expCost <= availableExperienceUnits) {
      trimmedExperience.push(exp);
      expUnits += expCost;
    } else if (trimmedExperience.length < 2) {
      // If we don't even have 2 jobs, trim bullets of the current one to fit
      const allowedHighlights = Math.floor((availableExperienceUnits - expUnits - 3) / 1.5);
      if (allowedHighlights > 1) {
        trimmedExperience.push({
          ...exp,
          highlights: exp.highlights.slice(0, allowedHighlights)
        });
        break;
      }
    } else {
      break; // No more room
    }
  }

  return {
    ...data,
    experience: trimmedExperience,
    education: trimmedEducation,
    projects: trimmedProjects,
    achievements: trimmedAchievements
  };
};
