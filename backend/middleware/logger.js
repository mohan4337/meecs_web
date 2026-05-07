// Request logger middleware
const { generateRequestId } = require("../utils/requestId");

const logger = (req, res, next) => {
  // Generate unique request ID
  const requestId = generateRequestId();
  req.id = requestId;
  
  // Attach to response for client debugging
  res.setHeader('X-Request-ID', requestId);
  
  const start = Date.now();
  req.startTime = start;
  
  // Log request
  console.log({
    requestId,
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url,
    ip: req.ip || req.connection?.remoteAddress || 'unknown',
    userAgent: req.get('user-agent') || 'unknown',
    contentLength: req.get('content-length') || 0
  });

  // Intercept response to log duration
  const originalSend = res.send;
  const originalJson = res.json;
  
  const logResponse = (body) => {
    const duration = Date.now() - start;
    
    // Handle both string and object bodies
    let bodySize = 0;
    if (body) {
      bodySize = typeof body === 'string' ? body.length : JSON.stringify(body)?.length || 0;
    }
    
    console.log({
      requestId,
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
      contentLength: bodySize
    });
  };

  res.send = function(body) {
    logResponse(body);
    return originalSend.apply(res, arguments);
  };

  res.json = function(body) {
    logResponse(body);
    return originalJson.apply(res, arguments);
  };

  next();
};

module.exports = logger;
