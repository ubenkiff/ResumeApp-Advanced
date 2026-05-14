
/**
 * Resilient API service with retry logic and exponential backoff
 */
class ResilientAPI {
  constructor(baseURL = '') {
    this.baseURL = baseURL;
    this.defaultRetries = 3;
    this.initialDelay = 1000;
  }

  async fetchWithRetry(endpoint, options = {}, retries = this.defaultRetries) {
    const url = endpoint.startsWith('http') ? endpoint : `${this.baseURL}${endpoint}`;
    
    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        const response = await fetch(url, {
          ...options,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            ...options.headers,
          },
        });

        if (response.ok) {
          return await response.json();
        }

        // If it's a client error (except rate limit), don't retry
        if (response.status >= 400 && response.status < 500 && response.status !== 429) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `HTTP ${response.status}`);
        }

        throw new Error(`Server Error: ${response.status}`);
      } catch (error) {
        if (attempt === retries - 1) {
          console.error(`Final attempt for ${url} failed:`, error);
          throw error;
        }

        const delay = this.initialDelay * Math.pow(2, attempt);
        console.warn(`Attempt ${attempt + 1} for ${url} failed. Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  async get(endpoint, options = {}) {
    return this.fetchWithRetry(endpoint, { ...options, method: 'GET' });
  }

  async post(endpoint, data, options = {}) {
    return this.fetchWithRetry(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put(endpoint, data, options = {}) {
    return this.fetchWithRetry(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }
}

const resilientApi = new ResilientAPI(import.meta.env.VITE_API_URL || '');
export default resilientApi;
