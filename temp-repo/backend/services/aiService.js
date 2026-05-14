import { GoogleGenerativeAI } from '@google/generative-ai';
import CircuitBreaker from './circuitBreaker.js';

class AIService {
  constructor() {
    this.mode = 'mock'; // Default to mock for stability
    this.genAI = null;
    this.breaker = new CircuitBreaker('GeminiAI', 3, 60000); 

    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && apiKey !== 'undefined') {
      this.genAI = new GoogleGenerativeAI(apiKey);
      if (process.env.AI_MODE !== 'mock') {
        this.mode = 'gemini';
      }
    }
  }

  async _safeGenerate(prompt, fallbackResult, responseFormat = 'json') {
    if (this.mode === 'mock' || !this.genAI) {
      return typeof fallbackResult === 'function' ? fallbackResult() : fallbackResult;
    }

    const task = async () => {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      
      if (!response.candidates || response.candidates.length === 0) {
        throw new Error('No response from AI');
      }

      const text = response.text();
      
      if (responseFormat === 'json') {
        const jsonMatch = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
        if (!jsonMatch) throw new Error('Invalid JSON response from AI');
        return JSON.parse(jsonMatch[0]);
      }
      
      return text;
    };

    return await this.breaker.call(task, () => {
      return typeof fallbackResult === 'function' ? fallbackResult() : fallbackResult;
    });
  }

  async extractKeywords(jobDescription) {
    const fallback = ['React', 'Node.js', 'Typescript', 'AWS', 'REST API'];
    const prompt = `Extract key skills and requirements as a JSON array from: ${jobDescription.substring(0, 3000)}`;
    return await this._safeGenerate(prompt, fallback, 'json');
  }

  async scan(text) {
    if (this.mode === 'mock') {
      console.log('🔧 Using MOCK mode for scanning');
      
      // Extract real data from text (not placeholder)
      const nameMatch = text.match(/([A-Z][a-z]+ [A-Z][a-z]+)/);
      const name = nameMatch ? nameMatch[0] : 'Professional Applicant';
      
      const headlineMatch = text.match(/([A-Z][a-z]+ [A-Z][a-z]+ \| [^\n]+)/);
      const headline = headlineMatch ? headlineMatch[0] : 'Strategic Professional';
      
      // Extract lines for experience/about
      const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 10);

      return {
        score: Math.floor(Math.random() * 30) + 65,
        extractedProfile: {
          fullName: name,
          headline: headline,
          location: 'Extracted from profile',
          about: text.substring(0, 250).trim() + '...',
          experience: [
            {
              company: lines[2]?.substring(0, 50) || 'Company found in text',
              title: headline,
              dates: 'Present',
              bullets: ['Successfully led high-impact initiatives identified in text', 'Optimized operational efficiency by translating text data to results']
            }
          ],
          skills: ['Leadership', 'Project Management', 'Strategic Planning', 'Analysis']
        },
        benchmarks: {
          leadershipLanguage: { passed: true, found: ['led', 'managed'] },
          keywordDensity: { passed: true, percentage: 4.2 },
          achievementMetrics: { passed: false, found: 2, required: 3 },
          sectionCompleteness: { passed: true, completed: 5, total: 6 },
          actionVerbVariety: { passed: true, unique: 8 }
        },
        suggestions: [
          'Add more quantifiable metrics (%, $, #) to your bullets',
          'Use stronger action verbs to start your sentences',
          'Optimize your headline for industry-specific keywords'
        ],
        copyrightSafe: true,
        improvedBullets: ['Architected scalable solutions resulting in measurable performance gains.']
      };
    }

    const fallback = () => {
      // Re-use logic above if API fails
      return this.scan(text); 
    };

    const prompt = `Analyze this profile for Impact and return JSON. 
    Return:
    { "score": number, "metrics": { "found": number, "missing": number, "density": string }, "copyrightSafe": boolean, "suggestions": string[], "improvedBullets": string[], "extractedProfile": { "fullName": string, "headline": string, "location": string, "about": string, "experience": Array<{company, title, dates, bullets: string[]}>, "skills": string[] }, "benchmarks": object }
    Text: ${text.substring(0, 5000)}`;

    return await this._safeGenerate(prompt, fallback, 'json');
  }

  async generateCoverLetter(data) {
    const fallback = "Dear Hiring Manager,\n\nI am excited to apply for this position. Based on my experience in the industry, I believe I would be a great fit.\n\nBest regards,\nCandidate";
    const prompt = `Write a professional cover letter based on this data: ${JSON.stringify(data).substring(0, 4000)}`;
    return await this._safeGenerate(prompt, fallback, 'text');
  }

  async analyzeGap(data) {
    const fallback = {
      targetKeywords: ['Kubernetes', 'Go'],
      missingKeywords: ['Rust'],
      matchedKeywords: ['Docker'],
      matchPercentage: 75,
      suggestedBulletPoints: ['Implemented container orchestration using Kubernetes']
    };
    const prompt = `Analyze the skill gap and return JSON: {targetKeywords, missingKeywords, matchedKeywords, matchPercentage, suggestedBulletPoints}. Data: ${JSON.stringify(data).substring(0, 4000)}`;
    return await this._safeGenerate(prompt, fallback, 'json');
  }

  async searchJobs(keyword, location) {
    const fallback = [
      { title: 'Software Engineer', company: 'Tech Corp', location: location || 'Remote', salary: '$120k', description: 'Great role.', postedDate: '1d ago', url: '#', isInfrastructureRelated: true }
    ];
    const prompt = `Generate 5 job listings for "${keyword}" in "${location}" as JSON array.`;
    return await this._safeGenerate(prompt, fallback, 'json');
  }

  async crystallize(templateName, rawData) {
    const fallback = { optimizedData: rawData };
    const prompt = `Optimize this data for "${templateName}" template and return JSON with "optimizedData" field. Data: ${JSON.stringify(rawData).substring(0, 5000)}`;
    const result = await this._safeGenerate(prompt, fallback, 'json');
    return result.optimizedData || result;
  }
}

export default new AIService();
