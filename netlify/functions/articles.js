// Netlify Function: articles proxy handler
// Path: /.netlify/functions/articles
// Proxies requests to WordPress headless CMS with security and caching

const https = require('https');
const http = require('http');

// Get CMS API URL from environment variable
const CMS_API_URL = process.env.CMS_API_URL || 'http://dfd-cms.local/wp-json/wp/v2';

// Rate limiting: simple in-memory store (for serverless, consider Redis in production)
const rateLimitStore = new Map();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 30; // 30 requests per minute per IP

/**
 * Check rate limit for an IP address
 * @param {string} ip - Client IP address
 * @returns {boolean} - True if rate limit exceeded
 */
function checkRateLimit(ip) {
  const now = Date.now();
  const key = `articles:${ip}`;
  
  if (!rateLimitStore.has(key)) {
    rateLimitStore.set(key, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return false;
  }
  
  const record = rateLimitStore.get(key);
  
  // Reset if window expired
  if (now > record.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return false;
  }
  
  // Increment and check limit
  record.count++;
  if (record.count > RATE_LIMIT_MAX_REQUESTS) {
    return true;
  }
  
  return false;
}

/**
 * Validate and sanitize query parameters
 * @param {Object} params - Query parameters
 * @returns {Object} - Sanitized parameters
 */
function sanitizeParams(params) {
  const sanitized = {};
  
  // Only allow specific WordPress API parameters
  const allowedParams = ['page', 'per_page', 'search', 'orderby', 'order'];
  
  allowedParams.forEach(param => {
    if (params[param]) {
      switch (param) {
        case 'page':
        case 'per_page':
          // Ensure integers, with safe limits
          const num = parseInt(params[param], 10);
          if (!isNaN(num) && num > 0) {
            sanitized[param] = param === 'per_page' ? Math.min(num, 10) : num;
          }
          break;
        case 'orderby':
          // Only allow safe orderby values
          if (['date', 'title', 'modified'].includes(params[param])) {
            sanitized[param] = params[param];
          }
          break;
        case 'order':
          // Only allow asc or desc
          if (['asc', 'desc'].includes(params[param].toLowerCase())) {
            sanitized[param] = params[param].toLowerCase();
          }
          break;
        case 'search':
          // Basic sanitization for search - limit length and remove special chars
          const search = params[param].substring(0, 100).replace(/[<>]/g, '');
          if (search) {
            sanitized[param] = search;
          }
          break;
      }
    }
  });
  
  return sanitized;
}

/**
 * Make HTTP/HTTPS request to WordPress API
 * @param {string} url - Full URL to fetch
 * @returns {Promise<Object>} - Response object with data and headers
 */
function fetchFromWordPress(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const timeout = 10000; // 10 second timeout
    
    const req = protocol.get(url, { timeout }, (res) => {
      let data = '';
      
      res.on('data', chunk => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            const parsed = JSON.parse(data);
            resolve({
              data: parsed,
              headers: res.headers,
              statusCode: res.statusCode
            });
          } catch (e) {
            reject(new Error('Invalid JSON response from CMS'));
          }
        } else {
          reject(new Error(`CMS API returned status ${res.statusCode}`));
        }
      });
    });
    
    req.on('error', (err) => {
      reject(err);
    });
    
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request to CMS API timed out'));
    });
  });
}

exports.handler = async (event, context) => {
  // Only allow GET requests
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      body: JSON.stringify({ success: false, message: 'Method not allowed' })
    };
  }
  
  // Get client IP for rate limiting
  const clientIP = event.headers['x-forwarded-for']?.split(',')[0] || 
                   event.headers['client-ip'] || 
                   context.clientContext?.ip || 
                   'unknown';
  
  // Check rate limit
  if (checkRateLimit(clientIP)) {
    return {
      statusCode: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': '60'
      },
      body: JSON.stringify({ 
        success: false, 
        message: 'Too many requests. Please try again later.' 
      })
    };
  }
  
  try {
    // Parse and sanitize query parameters
    const queryParams = event.queryStringParameters || {};
    const sanitizedParams = sanitizeParams(queryParams);
    
    // Set default values
    if (!sanitizedParams.per_page) {
      sanitizedParams.per_page = 10;
    }
    if (!sanitizedParams.page) {
      sanitizedParams.page = 1;
    }
    if (!sanitizedParams.orderby) {
      sanitizedParams.orderby = 'date';
    }
    if (!sanitizedParams.order) {
      sanitizedParams.order = 'desc';
    }
    
    // Build WordPress API URL
    const queryString = Object.entries(sanitizedParams)
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
      .join('&');
    
    const apiUrl = `${CMS_API_URL}/article?${queryString}`;
    
    if (process.env.ENABLE_EMAIL_DEBUG === '1' || process.env.NODE_ENV !== 'production') {
      console.log('[articles:function] Fetching from:', apiUrl);
    }
    
    // Fetch from WordPress
    const response = await fetchFromWordPress(apiUrl);
    
    // Extract pagination info from WordPress headers
    const totalItems = response.headers['x-wp-total'] || '0';
    const totalPages = response.headers['x-wp-totalpages'] || '0';
    
    // Return successful response with pagination metadata
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300' // Cache for 5 minutes
      },
      body: JSON.stringify({
        success: true,
        data: response.data,
        pagination: {
          page: sanitizedParams.page,
          perPage: sanitizedParams.per_page,
          total: parseInt(totalItems, 10),
          totalPages: parseInt(totalPages, 10)
        }
      })
    };
    
  } catch (error) {
    console.error('[articles:function] Error:', error.message);
    
    // Don't expose internal error details in production
    const isDev = process.env.NODE_ENV === 'development' || process.env.ENABLE_EMAIL_DEBUG === '1';
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        success: false,
        message: 'Unable to fetch articles. Please try again later.',
        ...(isDev && { detail: error.message })
      })
    };
  }
};
