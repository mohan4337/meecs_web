// API client with retry logic and error handling

export class ApiClient {
  constructor(baseURL, options = {}) {
    this.baseURL = baseURL.replace(/\/+$/, "");
    this.defaultRetries = options.retries || 3;
    this.defaultTimeout = options.timeout || 30000;
    this.retryDelay = options.retryDelay || 1000;
  }

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

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        clearTimeout(timeoutId);
        const response = await fetch(url, config);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({
            message: `HTTP ${response.status}: ${response.statusText}`
          }));

          const error = new Error(errorData.message || `HTTP ${response.status}`);
          error.status = response.status;
          error.data = errorData;

          if (response.status >= 400 && response.status < 500 && !skipRetry) {
            throw error;
          }

          if (attempt < retries && (response.status >= 500 || response.status === 0)) {
            lastError = error;
            await this._delay(this._getRetryDelay(attempt));
            continue;
          }

          throw error;
        }

        const data = await response.json();
        return { success: true, data };

      } catch (error) {
        lastError = error;

        if (error.name === 'AbortError') {
          if (attempt < retries) {
            await this._delay(this._getRetryDelay(attempt));
            continue;
          }
          const timeoutError = new Error('Request timeout - server is not responding');
          timeoutError.code = 'TIMEOUT';
          throw timeoutError;
        }

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

        if (error.message.includes('CORS')) {
          const corsError = new Error('CORS error - please contact support');
          corsError.code = 'CORS_ERROR';
          throw corsError;
        }

        if (attempt < retries && skipRetry === false) {
          await this._delay(this._getRetryDelay(attempt));
          continue;
        }

        throw error;
      }
    }

    throw lastError || new Error('Request failed after retries');
  }

  _getRetryDelay(attempt) {
    const baseDelay = this.retryDelay * Math.pow(2, attempt);
    const jitter = Math.random() * 1000;
    return Math.min(baseDelay + jitter, 10000);
  }

  _delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' });
  }

  post(endpoint, data, options = {}) {
    return this.request(endpoint, { ...options, method: 'POST', body: data });
  }

  put(endpoint, data, options = {}) {
    return this.request(endpoint, { ...options, method: 'PUT', body: data });
  }

  delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  }
}

// Singleton instances
let apiClientInstance = null;
let chatApiClientInstance = null;

/**
 * Get configured API client for contact form
 */
export const getApiClient = (baseURL) => {
  if (!apiClientInstance || apiClientInstance.baseURL !== baseURL) {
    apiClientInstance = new ApiClient(baseURL, {
      retries: 3,
      timeout: 30000,
      retryDelay: 1000
    });
  }
  return apiClientInstance;
};

/**
 * Get configured API client for chatbot
 */
export const getChatApiClient = (baseURL) => {
  if (!chatApiClientInstance || chatApiClientInstance.baseURL !== baseURL) {
    chatApiClientInstance = new ApiClient(baseURL, {
      retries: 2,
      timeout: 15000,
      retryDelay: 500
    });
  }
  return chatApiClientInstance;
};

/**
 * Keep-alive ping to prevent cold starts
 */
let keepAliveInterval = null;

export const startKeepAlive = (baseURL, interval = 60000) => {
  stopKeepAlive();

  const client = new ApiClient(baseURL, {
    retries: 1,
    timeout: 10000
  });

  client.get('/api/status')
    .then(() => console.log('Keep-alive ping successful'))
    .catch(err => console.log('Keep-alive ping failed:', err.message));

  keepAliveInterval = setInterval(() => {
    client.get('/api/status')
      .then(() => console.log('Keep-alive ping successful'))
      .catch(err => console.log('Keep-alive ping failed:', err.message));
  }, interval);
};

export const stopKeepAlive = () => {
  if (keepAliveInterval) {
    clearInterval(keepAliveInterval);
    keepAliveInterval = null;
  }
};
