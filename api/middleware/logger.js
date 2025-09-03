/**
 * Logging middleware
 */

const logger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const url = req.originalUrl;
  const ip = req.ip || req.connection.remoteAddress;
  const userAgent = req.get('User-Agent') || 'unknown';

  // Log request
  console.log(`[${timestamp}] ${method} ${url} - IP: ${ip}`);

  // Log request body for POST/PUT requests (excluding sensitive data)
  if ((method === 'POST' || method === 'PUT') && req.body) {
    const sanitizedBody = { ...req.body };
    
    // Remove sensitive fields from logs
    if (sanitizedBody.password) sanitizedBody.password = '[REDACTED]';
    if (sanitizedBody.token) sanitizedBody.token = '[REDACTED]';
    
    console.log(`[${timestamp}] Request body:`, sanitizedBody);
  }

  // Capture response details
  const originalSend = res.send;
  res.send = function(data) {
    const responseTime = Date.now() - req.startTime;
    console.log(`[${timestamp}] ${method} ${url} - ${res.statusCode} - ${responseTime}ms`);
    
    // Log error responses
    if (res.statusCode >= 400) {
      console.log(`[${timestamp}] Error response:`, {
        status: res.statusCode,
        url: url,
        ip: ip,
        userAgent: userAgent
      });
    }
    
    originalSend.call(this, data);
  };

  // Add start time for response time calculation
  req.startTime = Date.now();

  next();
};

module.exports = logger;
