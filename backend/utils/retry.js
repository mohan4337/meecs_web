// Retry utility with exponential backoff
const retry = async (fn, options = {}) => {
  const {
    maxAttempts = 3,
    minDelay = 100,
    maxDelay = 1000,
    factor = 2,
    onRetry = null
  } = options;

  let lastError;
  
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      // Don't retry on certain errors
      const retryableCodes = ['ECONNREFUSED', 'ETIMEDOUT', 'ENOTFOUND', 'ECONNRESET'];
      const isRetryable = retryableCodes.some(code => 
        error.message?.includes(code) || 
        error.code === code
      );
      
      if (!isRetryable && attempt < maxAttempts - 1) {
        console.log(`Non-retryable error, aborting: ${error.message}`);
        throw error;
      }

      if (attempt < maxAttempts - 1) {
        const delay = Math.min(
          minDelay * Math.pow(factor, attempt) + Math.random() * 100,
          maxDelay
        );
        
        console.log(`Attempt ${attempt + 1} failed, retrying in ${Math.round(delay)}ms: ${error.message}`);
        
        if (onRetry) {
          onRetry(error, attempt + 1);
        }
        
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError;
};

module.exports = retry;
