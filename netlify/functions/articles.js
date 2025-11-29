// Netlify Function: Articles API proxy
// Securely proxies requests to WordPress headless CMS API
// Path: /.netlify/functions/articles

const https = require('https');
const http = require('http');
const { URL } = require('url');

// Configuration constants
const MAX_PAGE_NUMBER = 1000;
const MAX_PER_PAGE = 10;
const DEFAULT_TIMEOUT = 10000;

// Get the API base URL from environment variables
const getApiBaseUrl = () => {
  return process.env.WP_API_BASE_URL || 'http://dfd-cms.local';
};

// Allowed query parameters to prevent injection
const ALLOWED_PARAMS = ['page', 'per_page', '_embed'];

// Sanitize and validate query parameters
const sanitizeParams = (queryParams) => {
  const sanitized = {};
  
  for (const [key, value] of Object.entries(queryParams)) {
    if (!ALLOWED_PARAMS.includes(key)) continue;
    
    // Validate page and per_page are positive integers
    if (key === 'page' || key === 'per_page') {
      const num = parseInt(value, 10);
      if (isNaN(num) || num < 1) continue;
      // Limit per_page to max 10 as per requirements
      if (key === 'per_page' && num > MAX_PER_PAGE) {
        sanitized[key] = String(MAX_PER_PAGE);
      } else if (key === 'page' && num > MAX_PAGE_NUMBER) {
        sanitized[key] = '1';
      } else {
        sanitized[key] = String(num);
      }
    } else if (key === '_embed') {
      // _embed is a boolean flag, just include it
      sanitized[key] = '';
    }
  }
  
  return sanitized;
};

// Build the full API URL with sanitized parameters
const buildApiUrl = (params) => {
  const baseUrl = getApiBaseUrl();
  const apiPath = '/wp-json/wp/v2/article';
  const sanitizedParams = sanitizeParams(params);
  
  const url = new URL(apiPath, baseUrl);
  for (const [key, value] of Object.entries(sanitizedParams)) {
    url.searchParams.append(key, value);
  }
  
  return url;
};

// Make HTTP request to WordPress API
const fetchFromWordPress = (url) => {
  return new Promise((resolve, reject) => {
    const protocol = url.protocol === 'https:' ? https : http;
    const timeout = parseInt(process.env.WP_API_TIMEOUT, 10) || DEFAULT_TIMEOUT;
    
    const req = protocol.get(url.href, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    });
    
    req.setTimeout(timeout, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    
    req.on('error', (err) => {
      reject(err);
    });
  });
};

// Transform WordPress article data to a cleaner format
const transformArticles = (articles) => {
  if (!Array.isArray(articles)) return [];
  
  return articles.map((article) => {
    // Get featured image if embedded
    let thumbnailUrl = null;
    if (article._embedded && article._embedded['wp:featuredmedia']) {
      const media = article._embedded['wp:featuredmedia'][0];
      if (media && media.source_url) {
        thumbnailUrl = media.source_url;
      }
    }
    
    // Get author name if embedded
    let authorName = 'Unknown';
    if (article._embedded && article._embedded.author) {
      const author = article._embedded.author[0];
      if (author && author.name) {
        authorName = author.name;
      }
    }
    
    return {
      id: article.id,
      title: article.title?.rendered || 'Untitled',
      excerpt: article.excerpt?.rendered || '',
      date: article.date || null,
      author: authorName,
      thumbnail: thumbnailUrl,
      link: article.link || null,
      slug: article.slug || null
    };
  });
};

exports.handler = async (event) => {
  // Only allow GET requests
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: false, message: 'Method not allowed' })
    };
  }
  
  try {
    // Parse query parameters
    const queryParams = event.queryStringParameters || {};
    
    // Default to page 1 and 10 items per page
    if (!queryParams.page) queryParams.page = '1';
    if (!queryParams.per_page) queryParams.per_page = '10';
    // Always request embedded data for featured images and author
    queryParams._embed = '';
    
    // Build the API URL
    const apiUrl = buildApiUrl(queryParams);
    
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[articles:function] Fetching from: ${apiUrl.href}`);
    }
    
    // Fetch data from WordPress
    const response = await fetchFromWordPress(apiUrl);
    
    // Handle non-200 responses
    if (response.statusCode !== 200) {
      console.error(`[articles:function] WordPress API returned ${response.statusCode}`);
      return {
        statusCode: response.statusCode === 404 ? 404 : 502,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          success: false,
          message: response.statusCode === 404 
            ? 'No articles found' 
            : 'Error fetching articles from CMS'
        })
      };
    }
    
    // Parse and transform the response
    let articles;
    try {
      articles = JSON.parse(response.body);
    } catch (parseError) {
      console.error('[articles:function] Failed to parse WordPress response:', parseError);
      return {
        statusCode: 502,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ success: false, message: 'Invalid response from CMS' })
      };
    }
    
    // Get pagination headers
    const totalItems = parseInt(response.headers['x-wp-total'], 10) || 0;
    const totalPages = parseInt(response.headers['x-wp-totalpages'], 10) || 0;
    const currentPage = parseInt(queryParams.page, 10) || 1;
    
    // Transform articles data
    const transformedArticles = transformArticles(articles);
    
    return {
      statusCode: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300' // Cache for 5 minutes
      },
      body: JSON.stringify({
        success: true,
        articles: transformedArticles,
        pagination: {
          currentPage,
          totalPages,
          totalItems,
          perPage: 10
        }
      })
    };
    
  } catch (error) {
    console.error('[articles:function] Error:', error.message);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: false,
        message: 'Server error fetching articles. Please try again later.'
      })
    };
  }
};
