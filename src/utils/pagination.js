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
  
  // Truncate Bio to max 3 paragraphs
  let trimmedBio = profile.bio || '';
  if (trimmedBio) {
    const paragraphs = trimmedBio.split('\n').filter(p => p.trim().length > 0);
    if (paragraphs.length > 3) {
      trimmedBio = paragraphs.slice(0, 3).join('\n\n');
    }
  }

  // Approximate "units" of vertical space (1 unit ~ 1 line of text)
  // Page 1 + Page 2 total = ~105 units (A4/Letter at 11pt/10pt)
  const PAGE_CAPACITY = maxPages === 2 ? 105 : 55;
  
  let currentUnits = 0;
  
  // Header (approx 6-8 units)
  currentUnits += 8;
  
  // Bio (approx 2 units per paragraph + spacing)
  const bioParagraphs = trimmedBio.split('\n').filter(p => p.trim().length > 0);
  currentUnits += bioParagraphs.length * 3;
  
  // Achievements (Priority 2)
  const trimmedAchievements = achievements.slice(0, 4);
  currentUnits += trimmedAchievements.length * 4;
  
  // Skills (Priority 3) - compact grid
  currentUnits += Math.min(4, Math.ceil(skills.length / 5)) * 2;
  
  // Education (Bottom of Page 2 usually)
  const trimmedEducation = education.slice(0, 2);
  currentUnits += trimmedEducation.length * 3;
  
  // Projects (Bottom of Page 2 usually)
  const trimmedProjects = projects.slice(0, 2);
  currentUnits += trimmedProjects.length * 5;
  
  // Experience (The most flexible part) - Fill the remaining units
  const availableExperienceUnits = PAGE_CAPACITY - currentUnits;
  let expUnits = 0;
  const trimmedExperience = [];
  
  for (const exp of experience) {
    // Basic weight: Title/Dates (2) + Company (1) + Spacing (1) = 4 units baseline
    let highlightsToKeep = exp.highlights?.length || 0;
    let expCost = 4 + highlightsToKeep * 1.5;

    if (expUnits + expCost <= availableExperienceUnits) {
      trimmedExperience.push(exp);
      expUnits += expCost;
    } else {
      // Try to fit at least the top role with reduced bullets
      const remainingUnits = availableExperienceUnits - expUnits;
      if (remainingUnits >= 6) { // Enough for title + company + 1-2 bullets
        const allowedBullets = Math.floor((remainingUnits - 4) / 1.5);
        if (allowedBullets >= 1) {
          trimmedExperience.push({
            ...exp,
            highlights: (exp.highlights || []).slice(0, allowedBullets)
          });
          expUnits += 4 + allowedBullets * 1.5;
        }
      }
      break; 
    }
  }

  return {
    ...data,
    profile: { ...profile, bio: trimmedBio },
    experience: trimmedExperience,
    education: trimmedEducation,
    projects: trimmedProjects,
    achievements: trimmedAchievements
  };
};
