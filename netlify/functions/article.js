// Netlify Function: single article handler
// Path: /.netlify/functions/article
// This function acts as a secure proxy for WordPress API requests for a single article

const xss = require('xss');

// Get WordPress API base URL from environment variable
const WP_API_BASE_URL = process.env.WP_API_BASE_URL || 'http://dfd-cms.local/wp-json/wp/v2';
// REST base for the Articles custom post type (CPT). Must match register_post_type({ rest_base }) or CPT slug.
const ARTICLES_REST_BASE = process.env.WP_ARTICLES_REST_BASE || process.env.WP_ARTICLES_POST_TYPE || 'article';

/**
 * Sanitizes article data to prevent XSS
 * @param {Object} article - Raw article data from WordPress
 * @returns {Object} Sanitized article data
 */
function sanitizeArticle(article) {
  return {
    id: article.id,
    title: xss(article.title?.rendered || ''),
    content: xss(article.content?.rendered || ''),
    excerpt: xss(article.excerpt?.rendered || ''),
    date: article.date,
    modified: article.modified,
    author: article.author,
    featured_media: article.featured_media,
    slug: article.slug,
    link: xss(article.link || ''),
    // Include featured image URL if available
    featured_image_url: article._embedded?.['wp:featuredmedia']?.[0]?.source_url || null,
    // Include author name if available
    author_name: xss(article._embedded?.author?.[0]?.name || 'Unknown'),
    // Include custom fields if available
    acf: article.acf ? {
      reading_time: article.acf.reading_time || null,
      difficulty: xss(article.acf.difficulty || ''),
      seo_meta_description: xss(article.acf.seo_meta_description || ''),
      og_image_url: xss(article.acf.og_image_url || ''),
      demo_url: xss(article.acf.demo_url || ''),
      source_code_url: xss(article.acf.source_code_url || '')
    } : null
  };
}

/**
 * Fetches a single article from WordPress API by slug or ID
 * @param {string|number} identifier - Article slug or ID
 * @returns {Promise<Object>} Article data
 */
async function fetchArticle(identifier) {
  // Helper to build endpoint URL
  const buildUrl = (restBase, id) => {
    // Check if identifier is numeric (ID) or string (slug)
    const isId = /^\d+$/.test(identifier);
    if (isId) {
      return `${WP_API_BASE_URL}/${restBase}/${identifier}?_embed=true`;
    } else {
      return `${WP_API_BASE_URL}/${restBase}?slug=${identifier}&_embed=true`;
    }
  };

  const primaryBase = ARTICLES_REST_BASE;
  const fallbackBase = primaryBase === 'article' ? 'articles' : 'article';

  // Try primary
  let url = buildUrl(primaryBase, identifier);
  if (process.env.ENABLE_API_DEBUG === '1' || process.env.NODE_ENV !== 'production') {
    console.log(`[article:function] Fetching from: ${url}`);
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
      const altUrl = buildUrl(fallbackBase, identifier);
      if (process.env.ENABLE_API_DEBUG === '1' || process.env.NODE_ENV !== 'production') {
        console.log(`[article:function] Primary REST base '${primaryBase}' 404. Retrying with '${fallbackBase}': ${altUrl}`);
      }
      response = await fetch(altUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'DeanForant-Portfolio/1.0'
        },
        signal: controller.signal,
      });
      url = altUrl; // for logging consistency
    }

    clearTimeout(timeoutId);

    if (!response.ok) {
      if (response.status === 400) {
        throw new Error('Invalid request to WordPress API');
      } else if (response.status === 404) {
        throw new Error('Article not found');
      } else {
        throw new Error(`WordPress API error: ${response.status}`);
      }
    }

    const data = await response.json();
    
    // If we queried by slug, we get an array with one item
    const article = Array.isArray(data) ? data[0] : data;
    
    if (!article) {
      throw new Error('Article not found');
    }

    return sanitizeArticle(article);
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
    // Get identifier from query parameters
    const identifier = event.queryStringParameters?.id || event.queryStringParameters?.slug;
    
    if (!identifier) {
      throw new Error('Article ID or slug is required');
    }

    // Fetch article from WordPress API
    const article = await fetchArticle(identifier);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300', // Cache for 5 minutes
      },
      body: JSON.stringify({
        success: true,
        data: article
      })
    };
  } catch (error) {
    console.error('[article:function] Error:', error.message);

    // Determine appropriate status code based on error
    let statusCode = 500;
    if (error.message.includes('Invalid') || error.message.includes('required')) {
      statusCode = 400;
    } else if (error.message.includes('not found')) {
      statusCode = 404;
    } else if (error.message.includes('timeout')) {
      statusCode = 504;
    }

    return {
      statusCode,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: false,
        message: error.message || 'Failed to fetch article',
      })
    };
  }
};
