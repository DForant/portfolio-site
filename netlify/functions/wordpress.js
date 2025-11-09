// Netlify Function: WordPress REST API proxy
// Path: /.netlify/functions/wordpress

/**
 * Fetches posts from WordPress REST API
 * Supports pagination and filtering
 */

const CACHE_DURATION = 300000; // 5 minutes in milliseconds
let cache = {
  posts: { data: null, timestamp: 0 },
  single: {}
};

/**
 * Fetch data from WordPress REST API
 */
async function fetchFromWordPress(endpoint) {
  const wpUrl = process.env.WORDPRESS_URL;
  
  if (!wpUrl) {
    throw new Error('WORDPRESS_URL environment variable is not configured');
  }

  const baseUrl = wpUrl.endsWith('/') ? wpUrl : `${wpUrl}/`;
  const apiUrl = `${baseUrl}wp-json/wp/v2/${endpoint}`;
  
  console.log(`[wordpress:function] Fetching from: ${apiUrl}`);
  
  const response = await fetch(apiUrl);
  
  if (!response.ok) {
    throw new Error(`WordPress API request failed: ${response.status} ${response.statusText}`);
  }
  
  return response.json();
}

/**
 * Check if cache is valid
 */
function isCacheValid(cacheEntry) {
  if (!cacheEntry.data) return false;
  const now = Date.now();
  return (now - cacheEntry.timestamp) < CACHE_DURATION;
}

/**
 * Get posts list with optional filters
 */
async function getPosts(params) {
  const { page = 1, perPage = 10, category = null } = params;
  
  // Build cache key
  const cacheKey = `posts_${page}_${perPage}_${category || 'all'}`;
  
  // Check cache
  if (!cache.posts[cacheKey]) {
    cache.posts[cacheKey] = { data: null, timestamp: 0 };
  }
  
  if (isCacheValid(cache.posts[cacheKey])) {
    console.log('[wordpress:function] Returning cached posts');
    return cache.posts[cacheKey].data;
  }
  
  // Build query params
  let endpoint = `posts?page=${page}&per_page=${perPage}&_embed`;
  if (category) {
    endpoint += `&categories=${category}`;
  }
  
  // Fetch from WordPress
  const posts = await fetchFromWordPress(endpoint);
  
  // Transform posts to include featured image and author
  const transformedPosts = posts.map(post => ({
    id: post.id,
    title: post.title.rendered,
    excerpt: post.excerpt.rendered,
    content: post.content.rendered,
    slug: post.slug,
    date: post.date,
    modified: post.modified,
    author: post._embedded?.author?.[0]?.name || 'Unknown',
    featuredImage: post._embedded?.['wp:featuredmedia']?.[0]?.source_url || null,
    categories: post._embedded?.['wp:term']?.[0]?.map(cat => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug
    })) || [],
    tags: post._embedded?.['wp:term']?.[1]?.map(tag => ({
      id: tag.id,
      name: tag.name,
      slug: tag.slug
    })) || []
  }));
  
  // Update cache
  cache.posts[cacheKey] = {
    data: transformedPosts,
    timestamp: Date.now()
  };
  
  return transformedPosts;
}

/**
 * Get single post by slug
 */
async function getPost(slug) {
  // Check cache
  if (!cache.single[slug]) {
    cache.single[slug] = { data: null, timestamp: 0 };
  }
  
  if (isCacheValid(cache.single[slug])) {
    console.log(`[wordpress:function] Returning cached post: ${slug}`);
    return cache.single[slug].data;
  }
  
  // Fetch from WordPress
  const posts = await fetchFromWordPress(`posts?slug=${slug}&_embed`);
  
  if (!posts || posts.length === 0) {
    return null;
  }
  
  const post = posts[0];
  
  // Transform post
  const transformedPost = {
    id: post.id,
    title: post.title.rendered,
    content: post.content.rendered,
    excerpt: post.excerpt.rendered,
    slug: post.slug,
    date: post.date,
    modified: post.modified,
    author: post._embedded?.author?.[0]?.name || 'Unknown',
    authorAvatar: post._embedded?.author?.[0]?.avatar_urls?.['96'] || null,
    featuredImage: post._embedded?.['wp:featuredmedia']?.[0]?.source_url || null,
    featuredImageAlt: post._embedded?.['wp:featuredmedia']?.[0]?.alt_text || '',
    categories: post._embedded?.['wp:term']?.[0]?.map(cat => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug
    })) || [],
    tags: post._embedded?.['wp:term']?.[1]?.map(tag => ({
      id: tag.id,
      name: tag.name,
      slug: tag.slug
    })) || []
  };
  
  // Update cache
  cache.single[slug] = {
    data: transformedPost,
    timestamp: Date.now()
  };
  
  return transformedPost;
}

/**
 * Get categories
 */
async function getCategories() {
  const categories = await fetchFromWordPress('categories?per_page=100');
  return categories.map(cat => ({
    id: cat.id,
    name: cat.name,
    slug: cat.slug,
    count: cat.count
  }));
}

/**
 * Main handler
 */
exports.handler = async (event) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  // Only allow GET
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ success: false, message: 'Method not allowed' })
    };
  }

  try {
    const params = event.queryStringParameters || {};
    const action = params.action || 'posts';

    let result;

    switch (action) {
      case 'posts':
        result = await getPosts({
          page: parseInt(params.page || '1', 10),
          perPage: parseInt(params.per_page || '10', 10),
          category: params.category || null
        });
        break;

      case 'post':
        if (!params.slug) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ success: false, message: 'Slug parameter is required' })
          };
        }
        result = await getPost(params.slug);
        if (!result) {
          return {
            statusCode: 404,
            headers,
            body: JSON.stringify({ success: false, message: 'Post not found' })
          };
        }
        break;

      case 'categories':
        result = await getCategories();
        break;

      default:
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ success: false, message: 'Invalid action' })
        };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true, data: result })
    };

  } catch (error) {
    console.error('[wordpress:function] Error:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        message: error.message || 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.stack : undefined
      })
    };
  }
};
