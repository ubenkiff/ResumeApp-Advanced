import api from '../api';

/**
 * Service to transform raw resume data using AI based on a target template style.
 */
export async function crystallizeResumeData(templateName, rawData) {
  try {
    const response = await api.post('/ai/crystallize', {
      templateName,
      rawData
    });
    return response.data.optimizedData;
  } catch (error) {
    console.error('Crystallization error:', error);
    throw new Error('Failed to transform resume data with AI');
  }
}

/**
 * Saves optimized resume data to the database.
 */
export async function saveOptimizedResume(templateName, optimizedData) {
  try {
    const response = await api.post('/user/optimized-resumes', {
      templateName,
      optimizedData
    });
    return response.data;
  } catch (error) {
    console.error('Error saving optimized resume:', error);
    throw error;
  }
}

/**
 * Fetches optimized resume data for a user.
 */
export async function getOptimizedResume(username, templateName) {
  try {
    const response = await api.get(`/public/${username}/optimized/${templateName}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching optimized resume:', error);
    return null;
  }
}
