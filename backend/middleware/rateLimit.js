// Simple in-memory rate limiter for serverless environments
// For production with Redis, consider using @vercel/kv or Upstash Redis

class RateLimiter {
  constructor() {
    this.requests = new Map();
    this.cleanupInterval = null;
    
    // Clean up old entries every 5 minutes
    this.startCleanup();
  }

  startCleanup() {
    this.cleanupInterval = setInterval(() => {
      const now = Date.now();
      const oneHourAgo = now - (60 * 60 * 1000);
      
      for (const [key, timestamps] of this.requests.entries()) {
        const recentTimestamps = timestamps.filter(ts => ts > oneHourAgo);
        if (recentTimestamps.length === 0) {
          this.requests.delete(key);
        } else {
          this.requests.set(key, recentTimestamps);
        }
      }
    }, 5 * 60 * 1000);
  }

  async isLimited(key, limit, windowMs) {
    if (!this.requests.has(key)) {
      this.requests.set(key, []);
    }

    const now = Date.now();
    const keyTimestamps = this.requests.get(key);
    
    // Remove timestamps older than window
    const validTimestamps = keyTimestamps.filter(ts => now - ts < windowMs);
    
    if (validTimestamps.length >= limit) {
      return true; // Rate limit exceeded
    }
    
    // Add current timestamp
    validTimestamps.push(now);
    this.requests.set(key, validTimestamps);
    
    return false; // Not limited
  }

  stopCleanup() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
  }
}

// Singleton instance
const rateLimiter = new RateLimiter();

// Rate limiting middleware
const rateLimit = (options = {}) => {
  const {
    windowMs = 15 * 60 * 1000, // 15 minutes
    max = 100, // Maximum requests per window
    message = "Too many requests from this IP. Please try again later.",
    skipSuccessful = false // Skip counting successful requests
  } = options;

  return async (req, res, next) => {
    // Skip rate limiting for health checks
    if (req.path === '/' || req.path === '/_vercel/warmup' || req.path === '/api/status') {
      return next();
    }

    // Get client identifier (IP or user ID if authenticated)
    const clientId = req.ip || 
                     req.connection.remoteAddress || 
                     req.headers['x-forwarded-for'] || 
                     'unknown';

    try {
      const isLimited = await rateLimiter.isLimited(
        `${req.method}:${req.path}:${clientId}`,
        max,
        windowMs
      );

      if (isLimited) {
        res.status(429).json({
          success: false,
          message,
          retryAfter: Math.ceil(windowMs / 1000)
        });
        return;
      }
    } catch (error) {
      console.error('Rate limiter error:', error);
    }

    next();
  };
};

module.exports = rateLimit;
