// Netlify Function: articles proxy for WordPress headless CMS
// Path: /.netlify/functions/articles
// This function acts as a secure proxy to the WordPress API

/**
 * Fetches articles from WordPress headless CMS
 * Implements security best practices and error handling
 */

// Rate limiting state (simple in-memory store for Netlify Functions)
const requestCounts = new Map();
const RATE_LIMIT = 100; // requests per window
const RATE_WINDOW = 60000; // 1 minute in milliseconds

/**
 * Simple rate limiter
 */
function checkRateLimit(ip) {
  const now = Date.now();
  const userRequests = requestCounts.get(ip) || [];
  
  // Remove old requests outside the window
  const recentRequests = userRequests.filter(time => now - time < RATE_WINDOW);
  
  if (recentRequests.length >= RATE_LIMIT) {
    return false;
  }
  
  recentRequests.push(now);
  requestCounts.set(ip, recentRequests);
  return true;
}

/**
 * Validate and sanitize query parameters
 */
function validateParams(params) {
  const page = parseInt(params.page || '1', 10);
  const perPage = parseInt(params.per_page || '10', 10);
  
  // Validate ranges
  if (page < 1 || page > 1000) {
    throw new Error('Invalid page number');
  }
  
  if (perPage < 1 || perPage > 100) {
    throw new Error('Invalid per_page value');
  }
  
  return { page, perPage };
}

/**
 * Build WordPress API URL
 */
function buildApiUrl(baseUrl, page, perPage) {
  // Ensure baseUrl doesn't end with slash
  const cleanBaseUrl = baseUrl.replace(/\/$/, '');
  
  // Build URL with validated parameters
  return `${cleanBaseUrl}/wp-json/wp/v2/posts?page=${page}&per_page=${perPage}&_embed=true`;
}

/**
 * Main handler
 */
exports.handler = async (event) => {
  // Only allow GET requests
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store'
      },
      body: JSON.stringify({ 
        success: false, 
        message: 'Method not allowed' 
      })
    };
  }

  // Get client IP for rate limiting
  const clientIp = event.headers['x-forwarded-for'] || 
                   event.headers['client-ip'] || 
                   'unknown';

  // Check rate limit
  if (!checkRateLimit(clientIp)) {
    return {
      statusCode: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': '60'
      },
      body: JSON.stringify({
        success: false,
        message: 'Rate limit exceeded. Please try again later.'
      })
    };
  }

  try {
    // Get WordPress API base URL from environment
    const WP_API_BASE = process.env.WP_API_BASE_URL;
    
    if (!WP_API_BASE) {
      console.error('[articles:function] WP_API_BASE_URL not configured');
      return {
        statusCode: 503,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          success: false,
          message: 'CMS integration not configured'
        })
      };
    }

    // Validate and extract query parameters
    const queryParams = event.queryStringParameters || {};
    const { page, perPage } = validateParams(queryParams);

    // Build API URL
    const apiUrl = buildApiUrl(WP_API_BASE, page, perPage);

    if (process.env.ENABLE_ARTICLES_DEBUG === '1') {
      console.log(`[articles:function] Fetching from: ${apiUrl}`);
    }

    // Fetch from WordPress API with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'DeanForantPortfolio/1.0'
      },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    // Check if response is OK
    if (!response.ok) {
      console.error(`[articles:function] WordPress API error: ${response.status}`);
      
      // Handle specific WordPress errors
      if (response.status === 400) {
        return {
          statusCode: 400,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            success: false,
            message: 'Invalid request parameters'
          })
        };
      }
      
      return {
        statusCode: 502,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          success: false,
          message: 'Unable to fetch articles from CMS'
        })
      };
    }

    // Parse response
    const articles = await response.json();
    
    // Get total count and pages from headers
    const totalArticles = parseInt(response.headers.get('X-WP-Total') || '0', 10);
    const totalPages = parseInt(response.headers.get('X-WP-TotalPages') || '1', 10);

    // Transform the WordPress response to a cleaner format
    const transformedArticles = articles.map(article => {
      // Get featured image if available
      let featuredImage = null;
      if (article._embedded && article._embedded['wp:featuredmedia']) {
        const media = article._embedded['wp:featuredmedia'][0];
        featuredImage = {
          url: media.source_url,
          alt: media.alt_text || article.title.rendered,
          thumbnail: media.media_details?.sizes?.thumbnail?.source_url || media.source_url,
          medium: media.media_details?.sizes?.medium?.source_url || media.source_url
        };
      }

      // Get author if available
      let author = 'Unknown';
      if (article._embedded && article._embedded.author) {
        author = article._embedded.author[0].name;
      }

      return {
        id: article.id,
        title: article.title.rendered,
        excerpt: article.excerpt.rendered,
        date: article.date,
        modified: article.modified,
        slug: article.slug,
        link: article.link,
        author: author,
        featuredImage: featuredImage
      };
    });

    // Return successful response with pagination info
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300' // Cache for 5 minutes
      },
      body: JSON.stringify({
        success: true,
        data: transformedArticles,
        pagination: {
          page: page,
          perPage: perPage,
          total: totalArticles,
          totalPages: totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      })
    };

  } catch (error) {
    console.error('[articles:function] Error:', error.message);
    
    // Handle timeout
    if (error.name === 'AbortError') {
      return {
        statusCode: 504,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          success: false,
          message: 'Request timeout. Please try again.'
        })
      };
    }

    // Generic error response
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: false,
        message: 'An error occurred while fetching articles'
      })
    };
  }
};
