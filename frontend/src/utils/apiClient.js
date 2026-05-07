// API client with retry logic and error handling
class ApiClient {
  constructor(baseURL, options = {}) {
    this.baseURL = baseURL.replace(/\/+$/, "");
    this.defaultRetries = options.retries || 3;
    this.defaultTimeout = options.timeout || 30000;
    this.retryDelay = options.retryDelay || 1000;
  }

  /**
   * Make an API request with retry logic
   */
  async request(endpoint, options = {}) {
    const {
      method = 'GET',
      body,
      headers = {},
      retries = this.defaultRetries,
      timeout = this.defaultTimeout,
      skipRetry = false
    } = options;

    const url = `${this.baseURL}${endpoint}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const config = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      },
      signal: controller.signal,
      keepalive: true,
      cache: 'no-store'
    };

    if (body) {
      config.body = JSON.stringify(body);
    }

    let lastError;

    // Retry logic with exponential backoff
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        clearTimeout(timeoutId);

        const response = await fetch(url, config);

        // Check for HTTP errors
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({
            message: `HTTP ${response.status}: ${response.statusText}`
          }));

          const error = new Error(errorData.message || `HTTP ${response.status}`);
          error.status = response.status;
          error.data = errorData;

          // Don't retry on 4xx errors (client errors)
          if (response.status >= 400 && response.status < 500 && !skipRetry) {
            throw error;
          }

          // Retry on 5xx errors and network failures
          if (attempt < retries && (response.status >= 500 || response.status === 0)) {
            lastError = error;
            await this._delay(this._getRetryDelay(attempt));
            continue;
          }

          throw error;
        }

        // Success - parse response
        const data = await response.json();
        return { success: true, data };

      } catch (error) {
        lastError = error;

        // Don't retry if abort/timeout on last attempt
        if (error.name === 'AbortError') {
          if (attempt < retries) {
            await this._delay(this._getRetryDelay(attempt));
            continue;
          }
          const timeoutError = new Error('Request timeout - server is not responding');
          timeoutError.code = 'TIMEOUT';
          throw timeoutError;
        }

        // Network error
        if (error.message.includes('Failed to fetch') || 
            error.message.includes('NetworkError') ||
            error.code === 'NETWORK_ERROR') {
          if (attempt < retries) {
            console.log(`Network error, retrying attempt ${attempt + 1}/${retries}`);
            await this._delay(this._getRetryDelay(attempt));
            continue;
          }
          const networkError = new Error('Network error - please check your connection');
          networkError.code = 'NETWORK_ERROR';
          throw networkError;
        }

        // CORS error (won't be caught here usually, but just in case)
        if (error.message.includes('CORS')) {
          const corsError = new Error('CORS error - please contact support');
          corsError.code = 'CORS_ERROR';
          throw corsError;
        }

        // Other errors - throw immediately unless we should retry
        if (attempt < retries && skipRetry === false) {
          await this._delay(this._getRetryDelay(attempt));
          continue;
        }

        throw error;
      }
    }

    throw lastError || new Error('Request failed after retries');
  }

  /**
   * Exponential backoff delay
   */
  _getRetryDelay(attempt) {
    // Base delay + random jitter to prevent thundering herd
    const baseDelay = this.retryDelay * Math.pow(2, attempt);
    const jitter = Math.random() * 1000;
    return Math.min(baseDelay + jitter, 10000); // Max 10s delay
  }

  /**
   * Simple delay helper
   */
  _delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * GET request
   */
  get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' });
  }

  /**
   * POST request
   */
  post(endpoint, data, options = {}) {
    return this.request(endpoint, { ...options, method: 'POST', body: data });
  }

  /**
   * PUT request
   */
  put(endpoint, data, options = {}) {
    return this.request(endpoint, { ...options, method: 'PUT', body: data });
  }

  /**
   * DELETE request
   */
  delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  }
}

// Create singleton instances
let apiClient = null;
let chatApiClient = null;

/**
 * Get configured API client for contact form
 */
const getApiClient = (baseURL) => {
  if (!apiClient || apiClient.baseURL !== baseURL) {
    apiClient = new ApiClient(baseURL, {
      retries: 3,
      timeout: 30000,
      retryDelay: 1000
    });
  }
  return apiClient;
};

/**
 * Get configured API client for chatbot (more aggressive retries)
 */
const getChatApiClient = (baseURL) => {
  if (!chatApiClient || chatApiClient.baseURL !== baseURL) {
    chatApiClient = new ApiClient(baseURL, {
      retries: 2, // Fewer retries for chat (user expects fast response)
      timeout: 15000,
      retryDelay: 500
    });
  }
  return chatApiClient;
};

/**
 * Keep-alive ping to prevent cold starts
 */
let keepAliveInterval = null;

const startKeepAlive = (baseURL, interval = 60000) => {
  // Clear existing interval
  stopKeepAlive();

  const client = new ApiClient(baseURL, {
    retries: 1,
    timeout: 10000
  });

  // Ping immediately
  client.get('/api/status')
    .then(() => console.log('Keep-alive ping successful'))
    .catch(err => console.log('Keep-alive ping failed:', err.message));

  // Then ping periodically
  keepAliveInterval = setInterval(() => {
    client.get('/api/status')
      .then(() => console.log('Keep-alive ping successful'))
      .catch(err => console.log('Keep-alive ping failed:', err.message));
  }, interval);
};

const stopKeepAlive = () => {
  if (keepAliveInterval) {
    clearInterval(keepAliveInterval);
    keepAliveInterval = null;
  }
};

module.exports = {
  ApiClient,
  getApiClient,
  getChatApiClient,
  startKeepAlive,
  stopKeepAlive
};
