// Netlify Function: WordPress articles proxy
// Path: /.netlify/functions/articles

const WP_API_URL = process.env.WP_API_URL || 'http://dfd-cms.local/wp-json/wp/v2';

/**
 * Validate and sanitize query parameters
 */
function validateParams(params) {
  const page = parseInt(params.page || '1', 10);
  const perPage = parseInt(params.per_page || '10', 10);
  
  // Validate page number (1-1000 to prevent abuse)
  if (isNaN(page) || page < 1 || page > 1000) {
    throw new Error('Invalid page number. Must be between 1 and 1000.');
  }
  
  // Validate per_page (1-100 to prevent abuse)
  if (isNaN(perPage) || perPage < 1 || perPage > 100) {
    throw new Error('Invalid per_page value. Must be between 1 and 100.');
  }
  
  return { page, perPage };
}

/**
 * Build WordPress API URL with validated parameters
 */
function buildApiUrl(page, perPage) {
  const url = new URL(`${WP_API_URL}/posts`);
  url.searchParams.set('page', page);
  url.searchParams.set('per_page', perPage);
  url.searchParams.set('_embed', '1'); // Include embedded data (featured image, author)
  
  return url.toString();
}

/**
 * Sanitize article data to only include needed fields
 */
function sanitizeArticle(article) {
  return {
    id: article.id,
    title: article.title?.rendered || '',
    excerpt: article.excerpt?.rendered || '',
    date: article.date || '',
    author: article._embedded?.author?.[0]?.name || 'Unknown',
    thumbnail: article._embedded?.['wp:featuredmedia']?.[0]?.source_url || null,
    link: article.link || ''
  };
}

exports.handler = async (event) => {
  // Only allow GET requests
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      },
      body: JSON.stringify({ 
        success: false, 
        message: 'Method not allowed' 
      })
    };
  }

  try {
    // Parse and validate query parameters
    const queryParams = event.queryStringParameters || {};
    const { page, perPage } = validateParams(queryParams);
    
    // Build API URL
    const apiUrl = buildApiUrl(page, perPage);
    
    if (process.env.ENABLE_EMAIL_DEBUG === '1' || process.env.NODE_ENV !== 'production') {
      console.log('[articles:function] Fetching from:', apiUrl);
    }
    
    // Fetch from WordPress API with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout
    
    const response = await fetch(apiUrl, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'DeanForantPortfolio/1.0'
      }
    });
    
    clearTimeout(timeoutId);
    
    // Check if request was successful
    if (!response.ok) {
      console.error('[articles:function] WordPress API error:', response.status);
      return {
        statusCode: response.status === 404 ? 404 : 502,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        },
        body: JSON.stringify({
          success: false,
          message: response.status === 404 
            ? 'No articles found for this page' 
            : 'Failed to fetch articles from CMS'
        })
      };
    }
    
    // Parse response
    const articles = await response.json();
    
    // Get total pages from headers
    const totalPages = parseInt(response.headers.get('X-WP-TotalPages') || '1', 10);
    const totalPosts = parseInt(response.headers.get('X-WP-Total') || '0', 10);
    
    // Sanitize article data
    const sanitizedArticles = Array.isArray(articles) 
      ? articles.map(sanitizeArticle)
      : [];
    
    // Return success response with caching
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300', // Cache for 5 minutes
        'X-Total-Pages': totalPages.toString(),
        'X-Total-Posts': totalPosts.toString()
      },
      body: JSON.stringify({
        success: true,
        data: {
          articles: sanitizedArticles,
          pagination: {
            currentPage: page,
            perPage: perPage,
            totalPages: totalPages,
            totalPosts: totalPosts
          }
        }
      })
    };
    
  } catch (error) {
    console.error('[articles:function] Error:', error.message);
    
    // Handle specific error types
    if (error.message.includes('Invalid')) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        },
        body: JSON.stringify({
          success: false,
          message: error.message
        })
      };
    }
    
    // Handle timeout
    if (error.name === 'AbortError') {
      return {
        statusCode: 504,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        },
        body: JSON.stringify({
          success: false,
          message: 'Request timeout - CMS is not responding'
        })
      };
    }
    
    // Generic error
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      },
      body: JSON.stringify({
        success: false,
        message: 'Internal server error'
      })
    };
  }
};
