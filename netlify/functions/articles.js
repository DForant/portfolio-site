// Netlify Function: articles fetcher from WordPress headless CMS
// Path: /.netlify/functions/articles

const CMS_BASE_URL = process.env.CMS_BASE_URL || 'http://dfd-cms.local';
const WP_API_BASE = `${CMS_BASE_URL.replace(/\/+$/, '')}/wp-json/wp/v2`;

// Rate limiting map (simple in-memory for demo; consider Redis for production)
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 30;

function checkRateLimit(ip) {
  const now = Date.now();
  const clientData = rateLimitMap.get(ip) || { count: 0, resetTime: now + RATE_LIMIT_WINDOW };
  
  if (now > clientData.resetTime) {
    // Reset the window
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }
  
  if (clientData.count >= MAX_REQUESTS_PER_WINDOW) {
    return false;
  }
  
  clientData.count++;
  rateLimitMap.set(ip, clientData);
  return true;
}

// Cleanup old entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [ip, data] of rateLimitMap.entries()) {
    if (now > data.resetTime) {
      rateLimitMap.delete(ip);
    }
  }
}, RATE_LIMIT_WINDOW);

function validatePagination(page, perPage) {
  const pageNum = parseInt(page, 10);
  const perPageNum = parseInt(perPage, 10);
  
  if (isNaN(pageNum) || pageNum < 1) {
    return { valid: false, error: 'Invalid page number' };
  }
  
  if (isNaN(perPageNum) || perPageNum < 1 || perPageNum > 100) {
    return { valid: false, error: 'Invalid per_page value (must be 1-100)' };
  }
  
  return { valid: true, page: pageNum, perPage: perPageNum };
}

async function fetchArticles(page = 1, perPage = 10) {
  const url = `${WP_API_BASE}/article?page=${page}&per_page=${perPage}&status=publish&_embed=true`;
  
  console.log('[Articles Function] Fetching from:', url);
  
  try {
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'DeanForantPortfolio/1.0'
      },
      signal: AbortSignal.timeout(10000) // 10 second timeout
    });
    
    if (!response.ok) {
      console.error('[Articles Function] Response not OK:', response.status);
      if (response.status === 404) {
        return { articles: [], total: 0, totalPages: 0 };
      }
      throw new Error(`WordPress API returned ${response.status}`);
    }
    
    const articles = await response.json();
    const total = parseInt(response.headers.get('X-WP-Total') || '0', 10);
    const totalPages = parseInt(response.headers.get('X-WP-TotalPages') || '0', 10);
    
    console.log('[Articles Function] Found', articles.length, 'articles. Total:', total, 'Pages:', totalPages);
    
    // Transform articles to safe format
    const transformedArticles = articles.map(article => {
      // Use the custom REST field we added in WordPress plugin
      const featuredImageUrl = article.featured_image_url || null;
      
      // Use the custom author_name field we added
      const authorName = article.author_name || 'Dean Forant';
      
      return {
        id: article.id,
        slug: article.slug || '',
        title: article.title?.rendered || '',
        excerpt: article.excerpt?.rendered || '',
        date: article.date || '',
        modified: article.modified || '',
        author_name: authorName,
        featured_image_url: featuredImageUrl,
        link: article.link || ''
      };
    });
    
    return {
      articles: transformedArticles,
      total,
      totalPages,
      currentPage: page
    };
  } catch (error) {
    console.error('[articles:function] Error fetching from WordPress:', error.message);
    throw error;
  }
}

exports.handler = async (event, context) => {
  // Only allow GET requests
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      body: JSON.stringify({ success: false, message: 'Method not allowed' })
    };
  }
  
  // Rate limiting
  const clientIp = event.headers['x-forwarded-for']?.split(',')[0] || 
                   event.headers['client-ip'] || 
                   'unknown';
  
  if (!checkRateLimit(clientIp)) {
    return {
      statusCode: 429,
      body: JSON.stringify({ 
        success: false, 
        message: 'Too many requests. Please try again later.' 
      })
    };
  }
  
  // Parse query parameters
  const params = event.queryStringParameters || {};
  const page = params.page || '1';
  const perPage = params.per_page || '10';
  
  // Validate pagination parameters
  const validation = validatePagination(page, perPage);
  if (!validation.valid) {
    return {
      statusCode: 400,
      body: JSON.stringify({ 
        success: false, 
        message: validation.error 
      })
    };
  }
  
  try {
    const result = await fetchArticles(validation.page, validation.perPage);
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300', // Cache for 5 minutes
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: true,
        data: result.articles, // Return articles array directly as 'data'
        pagination: {
          page: result.currentPage,
          perPage: validation.perPage,
          totalPages: result.totalPages,
          totalPosts: result.total,
          hasNextPage: result.currentPage < result.totalPages,
          hasPrevPage: result.currentPage > 1
        }
      })
    };
  } catch (error) {
    const isDev = process.env.ENABLE_EMAIL_DEBUG === '1' || process.env.NODE_ENV !== 'production';
    
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        message: 'Failed to fetch articles',
        ...(isDev ? { detail: error.message } : {})
      })
    };
  }
};
