// Netlify Function: articles list handler
// Path: /.netlify/functions/articles
// This function acts as a secure proxy for WordPress API requests

const xss = require('xss');

// Get WordPress API base URL from environment variable
const WP_API_BASE_URL = process.env.WP_API_BASE_URL || 'http://dfd-cms.local/wp-json/wp/v2';
// REST base for the Articles custom post type (CPT). Must match register_post_type({ rest_base }) or CPT slug.
// Defaults to 'article' (singular). You can override via env: WP_ARTICLES_REST_BASE=article|articles
const ARTICLES_REST_BASE = process.env.WP_ARTICLES_REST_BASE || process.env.WP_ARTICLES_POST_TYPE || 'article';

/**
 * Validates and sanitizes query parameters
 * @param {Object} queryParams - Raw query parameters
 * @returns {Object} Validated parameters
 */
function validateParams(queryParams) {
  const page = parseInt(queryParams.page || '1', 10);
  const perPage = parseInt(queryParams.per_page || '10', 10);

  // Validate page number
  if (isNaN(page) || page < 1 || page > 1000) {
    throw new Error('Invalid page number. Must be between 1 and 1000.');
  }

  // Validate per_page (max 10 per requirements)
  if (isNaN(perPage) || perPage < 1 || perPage > 10) {
    throw new Error('Invalid per_page value. Must be between 1 and 10.');
  }

  return { page, perPage };
}

/**
 * Sanitizes article data to prevent XSS
 * @param {Object} article - Raw article data from WordPress
 * @returns {Object} Sanitized article data
 */
function sanitizeArticle(article) {
  return {
    id: article.id,
    title: xss(article.title?.rendered || ''),
    excerpt: xss(article.excerpt?.rendered || ''),
    date: article.date,
    modified: article.modified,
    author: article.author,
    featured_media: article.featured_media,
    link: xss(article.link || ''),
    // Include featured image URL if available
    featured_image_url: article._embedded?.['wp:featuredmedia']?.[0]?.source_url || null,
    // Include author name if available
    author_name: xss(article._embedded?.author?.[0]?.name || 'Unknown'),
  };
}

/**
 * Fetches articles from WordPress API (Articles CPT)
 * @param {number} page - Page number
 * @param {number} perPage - Items per page
 * @returns {Promise<Object>} Articles and pagination metadata
 */
async function fetchArticles(page, perPage) {
  // Helper to build endpoint URL
  const buildUrl = (restBase) => `${WP_API_BASE_URL}/${restBase}?page=${page}&per_page=${perPage}&_embed=true`;

  const primaryBase = ARTICLES_REST_BASE;
  const fallbackBase = primaryBase === 'article' ? 'articles' : 'article';

  // Try primary
  let url = buildUrl(primaryBase);
  if (process.env.ENABLE_API_DEBUG === '1' || process.env.NODE_ENV !== 'production') {
    console.log(`[articles:function] Fetching from: ${url}`);
  }

  // Create abort controller for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

  try {
    let response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'DeanForant-Portfolio/1.0'
      },
      signal: controller.signal,
    });

    // If the primary endpoint 404s, attempt the alternate rest base automatically
    if (response.status === 404) {
      const altUrl = buildUrl(fallbackBase);
      if (process.env.ENABLE_API_DEBUG === '1' || process.env.NODE_ENV !== 'production') {
        console.log(`[articles:function] Primary REST base '${primaryBase}' 404. Retrying with '${fallbackBase}': ${altUrl}`);
      }
      response = await fetch(altUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'DeanForant-Portfolio/1.0'
        },
        signal: controller.signal,
      });
      url = altUrl; // for logging/pagination consistency
    }

    clearTimeout(timeoutId);

    if (!response.ok) {
      if (response.status === 400) {
        throw new Error('Invalid request to WordPress API');
      } else if (response.status === 404) {
        throw new Error('Articles endpoint not found or returned no results');
      } else {
        throw new Error(`WordPress API error: ${response.status}`);
      }
    }

    const articles = await response.json();

    // Get pagination info from headers
    const totalPosts = parseInt(response.headers.get('X-WP-Total') || '0', 10);
    const totalPages = parseInt(response.headers.get('X-WP-TotalPages') || '1', 10);

    return {
      articles: articles.map(sanitizeArticle),
      pagination: {
        page,
        perPage,
        totalPosts,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      }
    };
  } catch (error) {
    clearTimeout(timeoutId);

    // Handle abort error specifically
    if (error.name === 'AbortError') {
      throw new Error('Request timeout');
    }
    throw error;
  }
}

/**
 * Main handler function
 */
exports.handler = async (event) => {
  // Only allow GET requests
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        success: false, 
        message: 'Method not allowed' 
      })
    };
  }

  try {
    // Validate and sanitize query parameters
    const { page, perPage } = validateParams(event.queryStringParameters || {});

    // Fetch articles from WordPress API
    const data = await fetchArticles(page, perPage);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300', // Cache for 5 minutes
      },
      body: JSON.stringify({
        success: true,
        data: data.articles,
        pagination: data.pagination,
      })
    };
  } catch (error) {
    console.error('[articles:function] Error:', error.message);

    // Determine appropriate status code based on error
    let statusCode = 500;
    if (error.message.includes('Invalid')) {
      statusCode = 400;
    } else if (error.message.includes('not found') || error.message.includes('endpoint not found')) {
      statusCode = 404;
    } else if (error.message.includes('timeout')) {
      statusCode = 504;
    }

    return {
      statusCode,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: false,
        message: error.message || 'Failed to fetch articles',
      })
    };
  }
};
