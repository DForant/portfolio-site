/**
 * Netlify Function: Article (Single)
 * Fetches a single article by slug from WordPress CMS with full author details
 */

const WP_API_BASE = process.env.WP_API_BASE_URL || 'http://dfd-cms.local/wp-json/wp/v2';
const WP_POST_TYPE = process.env.WP_ARTICLE_POST_TYPE || 'article';
const ENABLE_DEBUG = process.env.ENABLE_API_DEBUG === '1';

// ACF field names for author profile
const AUTHOR_PROFILE_IMAGE_FIELDS = ['author_profile_image', 'profile_image'];

exports.handler = async (event) => {
  // Only allow GET requests
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      body: JSON.stringify({ success: false, message: 'Method not allowed' })
    };
  }

  try {
    const { slug } = event.queryStringParameters || {};

    if (!slug) {
      return {
        statusCode: 400,
        body: JSON.stringify({ success: false, message: 'Article slug is required' })
      };
    }

    // Build WordPress API URL with custom post type and author embed
    const wpUrl = `${WP_API_BASE}/${WP_POST_TYPE}?slug=${encodeURIComponent(slug)}&_embed`;
    
    if (ENABLE_DEBUG) {
      console.log('[Article Function] Fetching:', wpUrl);
      console.log('[Article Function] Post type:', WP_POST_TYPE);
    }

    const response = await fetch(wpUrl);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Article Function] WordPress API error:', response.status, errorText);
      throw new Error(`WordPress API error: ${response.status} ${response.statusText}`);
    }

    const posts = await response.json();
    
    if (ENABLE_DEBUG) {
      console.log('[Article Function] Found posts:', posts.length);
      if (posts.length > 0) {
        console.log('[Article Function] Post author ID:', posts[0].author);
        console.log('[Article Function] Embedded author:', posts[0]._embedded?.author?.[0]?.name);
      }
    }

    if (!posts || posts.length === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({ success: false, message: 'Article not found' })
      };
    }

    const post = posts[0];
    
    // Try to get author from embedded data first
    const embeddedAuthor = post._embedded?.author?.[0];

    // Fetch additional author details if author ID is available
    let authorDetails = {
      id: post.author,
      name: embeddedAuthor?.name || 'Unknown',
      description: embeddedAuthor?.description || '',
      avatar_url: embeddedAuthor?.avatar_urls?.['96'] || null,
      profile_image_url: null
    };

    // Always try to get extended author info from WordPress user endpoint
    if (post.author) {
      try {
        const authorUrl = `${WP_API_BASE}/users/${post.author}`;
        if (ENABLE_DEBUG) {
          console.log('[Article Function] Fetching author details:', authorUrl);
        }
        
        const authorResponse = await fetch(authorUrl);
        
        if (ENABLE_DEBUG) {
          console.log('[Article Function] Author response status:', authorResponse.status);
        }
        
        if (authorResponse.ok) {
          const authorData = await authorResponse.json();
          
          if (ENABLE_DEBUG) {
            console.log('[Article Function] Author data:', {
              id: authorData.id,
              name: authorData.name,
              hasDescription: !!authorData.description,
              hasACF: !!authorData.acf
            });
          }
          
          // Look for profile image in ACF fields
          let profileImageUrl = null;
          for (const fieldName of AUTHOR_PROFILE_IMAGE_FIELDS) {
            if (authorData.acf?.[fieldName]) {
              profileImageUrl = authorData.acf[fieldName];
              break;
            }
          }
          
          authorDetails = {
            id: authorData.id,
            name: authorData.name,
            description: authorData.description || '',
            avatar_url: authorData.avatar_urls?.['96'] || null,
            profile_image_url: profileImageUrl,
            url: authorData.url || null,
            ...authorData.acf // Include any other ACF fields
          };
          
          if (ENABLE_DEBUG) {
            console.log('[Article Function] Final author details:', {
              name: authorDetails.name,
              hasDescription: !!authorDetails.description,
              hasProfileImage: !!authorDetails.profile_image_url,
              hasAvatar: !!authorDetails.avatar_url
            });
          }
        }
      } catch (err) {
        console.error('[Article Function] Error fetching author info:', err.message);
        // If fetching fails but we have embedded author, keep that data
        if (embeddedAuthor) {
          authorDetails = {
            id: post.author,
            name: embeddedAuthor.name,
            description: embeddedAuthor.description || '',
            avatar_url: embeddedAuthor.avatar_urls?.['96'] || null,
            profile_image_url: null,
            url: null
          };
        }
      }
    }

    // Transform WordPress data to our format
    const article = {
      id: post.id,
      title: post.title.rendered,
      excerpt: post.excerpt.rendered,
      content: post.content.rendered,
      date: post.date,
      modified: post.modified,
      slug: post.slug,
      link: `/articles/${post.slug}`,
      author_name: authorDetails.name,
      author_id: authorDetails.id,
      author_description: authorDetails.description,
      author_avatar_url: authorDetails.avatar_url,
      author_profile_image: authorDetails.profile_image_url,
      author_url: authorDetails.url,
      featured_image_url: post._embedded?.['wp:featuredmedia']?.[0]?.source_url || null,
      acf: post.acf || {}
    };

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300' // 5 minutes cache
      },
      body: JSON.stringify({
        success: true,
        data: article
      })
    };

  } catch (error) {
    console.error('[Article Function] Error:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: false,
        message: 'Failed to fetch article',
        error: ENABLE_DEBUG ? error.message : undefined
      })
    };
  }
};
