/**
 * Netlify Function: Articles
 * Fetches paginated articles from WordPress CMS
 */

const WP_API_BASE = process.env.WP_API_BASE_URL || 'http://dfd-cms.local/wp-json/wp/v2';
const ENABLE_DEBUG = process.env.ENABLE_API_DEBUG === '1';

exports.handler = async (event) => {
  // Only allow GET requests
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      body: JSON.stringify({ success: false, message: 'Method not allowed' })
    };
  }

  try {
    const { page = '1', per_page = '10' } = event.queryStringParameters || {};
    const pageNum = parseInt(page, 10);
    const perPageNum = parseInt(per_page, 10);

    // Build WordPress API URL with author embed
    const wpUrl = `${WP_API_BASE}/posts?page=${pageNum}&per_page=${perPageNum}&_embed`;
    
    if (ENABLE_DEBUG) {
      console.log('[Articles Function] Fetching:', wpUrl);
    }

    const response = await fetch(wpUrl);
    
    if (!response.ok) {
      throw new Error(`WordPress API error: ${response.status} ${response.statusText}`);
    }

    const posts = await response.json();
    const totalPosts = parseInt(response.headers.get('X-WP-Total') || '0', 10);
    const totalPages = parseInt(response.headers.get('X-WP-TotalPages') || '1', 10);

    // Transform WordPress data to our format
    const articles = posts.map(post => {
      const author = post._embedded?.author?.[0];
      return {
        id: post.id,
        title: post.title.rendered,
        excerpt: post.excerpt.rendered,
        content: post.content.rendered,
        date: post.date,
        slug: post.slug,
        link: `/articles/${post.slug}`,
        author_name: author?.name || 'Unknown',
        author_id: post.author,
        featured_image_url: post._embedded?.['wp:featuredmedia']?.[0]?.source_url || null,
        acf: post.acf || {}
      };
    });

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300' // 5 minutes cache
      },
      body: JSON.stringify({
        success: true,
        data: articles,
        pagination: {
          page: pageNum,
          perPage: perPageNum,
          totalItems: totalPosts,
          totalPages: totalPages,
          hasNextPage: pageNum < totalPages,
          hasPrevPage: pageNum > 1
        }
      })
    };

  } catch (error) {
    console.error('[Articles Function] Error:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: false,
        message: 'Failed to fetch articles',
        error: ENABLE_DEBUG ? error.message : undefined
      })
    };
  }
};
