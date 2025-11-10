# WordPress Headless CMS Integration Guide

This guide explains how to set up and use WordPress as a headless CMS for publishing articles, tutorials, how-to guides, and case studies on the Dean Forant portfolio website.

## Table of Contents

1. [Overview](#overview)
2. [WordPress Setup](#wordpress-setup)
3. [Configuration](#configuration)
4. [Publishing Content](#publishing-content)
5. [Local Development](#local-development)
6. [Deployment](#deployment)
7. [Troubleshooting](#troubleshooting)

## Overview

The portfolio site now integrates with WordPress using the WordPress REST API v2 to fetch and display blog content. This headless CMS approach provides:

- **Easy Content Management**: Use the familiar WordPress editor to create content
- **Flexibility**: WordPress handles content while your portfolio handles presentation
- **Performance**: Built-in caching reduces API calls
- **SEO**: Full control over meta tags and structured data

### Architecture

```
WordPress (Content) → REST API → Netlify Function (Proxy + Cache) → Frontend (Display)
```

## WordPress Setup

### 1. WordPress Installation

You can use any WordPress installation:

- **Self-hosted**: Install WordPress on your own server
- **WordPress.com**: Use a WordPress.com site (Business plan required for API access)
- **Managed WordPress Hosting**: Providers like WP Engine, Kinsta, SiteGround

### 2. Enable REST API

The WordPress REST API is enabled by default in WordPress 4.7+. To verify:

1. Visit: `https://your-wordpress-site.com/wp-json/wp/v2/posts`
2. You should see a JSON response with posts

### 3. Configure Permalinks

For clean URLs in your blog posts:

1. Go to **Settings → Permalinks**
2. Select **Post name** or **Custom Structure**
3. Click **Save Changes**

### 4. Install Required Plugins (Optional but Recommended)

#### a. Featured Image Management
- **Plugin**: Default WordPress (no plugin needed)
- All posts should have a featured image for best display

#### b. REST API Caching (Optional)
- **Plugin**: WP REST Cache
- Improves performance on the WordPress side

#### c. CORS Configuration (If needed)
- **Plugin**: WP REST API CORS
- Only needed if you encounter CORS issues

### 5. Create Categories

Categories help organize your content:

1. Go to **Posts → Categories**
2. Create categories such as:
   - Brand Design
   - Web Development
   - Case Studies
   - Tutorials
   - Digital Strategy

### 6. Configure Author Profile

Ensure your author profile is complete:

1. Go to **Users → Your Profile**
2. Fill in:
   - Display name publicly as
   - Biographical Info
   - Profile Picture (via Gravatar)

## Configuration

### Environment Variables

Add the WordPress URL to your environment variables:

#### Local Development (.env)

Create a `.env` file in the project root:

```env
WORDPRESS_URL=https://your-wordpress-site.com
```

#### Netlify Deployment

1. Go to your Netlify site dashboard
2. Navigate to **Site settings → Environment variables**
3. Add a new variable:
   - **Key**: `WORDPRESS_URL`
   - **Value**: `https://your-wordpress-site.com` (without trailing slash)
4. Click **Save**
5. Trigger a new deploy

### WordPress REST API Endpoints Used

The integration uses these WordPress REST API endpoints:

- `GET /wp-json/wp/v2/posts` - List posts
- `GET /wp-json/wp/v2/posts?slug={slug}` - Get single post
- `GET /wp-json/wp/v2/categories` - List categories

## Publishing Content

### Creating a New Article

1. **Go to Posts → Add New** in WordPress

2. **Add Title and Content**
   - Use the WordPress block editor
   - Format your content with headings, images, lists, etc.

3. **Add Featured Image**
   - Click **Set featured image** in the right sidebar
   - Upload and select an image (recommended: 1200x630px)

4. **Select Categories**
   - Choose relevant categories from the **Categories** panel

5. **Add Tags (Optional)**
   - Add relevant tags in the **Tags** panel

6. **Set Excerpt (Optional)**
   - Add a custom excerpt in the **Excerpt** panel
   - If not set, WordPress will auto-generate from content

7. **Publish**
   - Click **Publish** when ready
   - The post will appear on your portfolio blog within 5 minutes (cache duration)

### Content Guidelines

For best results:

- **Title**: Keep under 60 characters for SEO
- **Featured Image**: Always include (1200x630px recommended)
- **Excerpt**: 150-160 characters works best
- **Headings**: Use H2, H3, H4 for structure
- **Images**: Optimize images before uploading (use WebP or compressed JPG)
- **Links**: Use descriptive anchor text

### Post Visibility

- **Published**: Appears on the portfolio blog
- **Draft**: Not visible on the portfolio blog
- **Private**: Not accessible via REST API
- **Scheduled**: Will appear when published

## Local Development

### Testing the Integration Locally

1. **Set WordPress URL**
   ```bash
   # Add to .env file
   WORDPRESS_URL=https://your-wordpress-site.com
   ```

2. **Install Dependencies**
   ```bash
   npm run install:all
   ```

3. **Build Frontend**
   ```bash
   npm run build:frontend
   ```

4. **Start Netlify Dev**
   ```bash
   netlify dev
   ```

5. **Access Blog**
   - Blog listing: http://localhost:8888/blog/
   - Article: http://localhost:8888/blog/article.html?slug=your-post-slug

### Testing API Function Directly

Test the WordPress API function:

```bash
# List posts
curl http://localhost:8888/api/wordpress?action=posts

# Get single post
curl http://localhost:8888/api/wordpress?action=post&slug=hello-world

# List categories
curl http://localhost:8888/api/wordpress?action=categories
```

## Deployment

### Netlify Deployment

1. **Set Environment Variable**
   - Add `WORDPRESS_URL` in Netlify dashboard
   - See [Configuration](#configuration) section above

2. **Deploy**
   ```bash
   # Draft deploy (testing)
   netlify deploy --build

   # Production deploy
   netlify deploy --prod --build
   ```

3. **Verify**
   - Visit: `https://your-site.netlify.app/blog/`
   - Check that posts load correctly
   - Test category filtering and pagination

### Cache Behavior

- **Cache Duration**: 5 minutes
- **What's Cached**: Posts list, single posts, categories
- **Cache Invalidation**: Automatic after 5 minutes
- **Force Refresh**: Wait 5 minutes after publishing new content

To change cache duration, edit `/netlify/functions/wordpress.js`:

```javascript
const CACHE_DURATION = 300000; // 5 minutes (change as needed)
```

## Troubleshooting

### Posts Not Appearing

**Issue**: Blog page shows "No Articles Found"

**Solutions**:
1. Check WordPress URL is set correctly in environment variables
2. Verify posts are published (not draft) in WordPress
3. Check WordPress REST API is accessible: `https://your-site.com/wp-json/wp/v2/posts`
4. Check browser console and Netlify function logs for errors
5. Wait 5 minutes for cache to clear if you just published

### CORS Errors

**Issue**: "CORS policy: No 'Access-Control-Allow-Origin' header"

**Solutions**:
1. Install "WP REST API CORS" plugin in WordPress
2. Or add to WordPress `functions.php`:
   ```php
   add_action('rest_api_init', function() {
       remove_filter('rest_pre_serve_request', 'rest_send_cors_headers');
       add_filter('rest_pre_serve_request', function($value) {
           header('Access-Control-Allow-Origin: *');
           header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
           header('Access-Control-Allow-Credentials: true');
           return $value;
       });
   }, 15);
   ```

### Images Not Loading

**Issue**: Featured images or article images don't display

**Solutions**:
1. Ensure featured image is set in WordPress post
2. Check image URLs in WordPress media library are accessible
3. Verify images aren't blocked by CORS
4. Check browser console for 404 or CORS errors

### Slow Loading

**Issue**: Blog page loads slowly

**Solutions**:
1. Cache is working (5-minute duration by default)
2. Optimize images in WordPress (use image compression plugin)
3. Reduce `per_page` parameter in API calls
4. Consider increasing cache duration for production

### "Undefined variable" Error

**Issue**: "WORDPRESS_URL environment variable is not configured"

**Solutions**:
1. Add `WORDPRESS_URL` to `.env` file locally
2. Add `WORDPRESS_URL` to Netlify environment variables
3. Restart `netlify dev` after adding environment variable
4. Trigger new deploy on Netlify after adding variable

### WordPress API Returns 404

**Issue**: WordPress API endpoint returns 404

**Solutions**:
1. Check WordPress permalinks are not set to "Plain"
2. Re-save permalinks in WordPress (Settings → Permalinks → Save)
3. Check `.htaccess` file has WordPress rewrite rules
4. Verify WordPress is updated to 4.7+

## API Reference

### Netlify Function Endpoints

Base URL: `/api/wordpress`

#### List Posts
```
GET /api/wordpress?action=posts&page=1&per_page=9&category=CATEGORY_ID
```

Parameters:
- `action` (required): `posts`
- `page` (optional): Page number (default: 1)
- `per_page` (optional): Posts per page (default: 10)
- `category` (optional): Category ID to filter

Response:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Article Title",
      "excerpt": "Article excerpt...",
      "content": "Full article content...",
      "slug": "article-slug",
      "date": "2024-01-01T00:00:00",
      "author": "Dean Forant",
      "featuredImage": "https://...",
      "categories": [...],
      "tags": [...]
    }
  ]
}
```

#### Get Single Post
```
GET /api/wordpress?action=post&slug=article-slug
```

Parameters:
- `action` (required): `post`
- `slug` (required): Post slug

Response:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Article Title",
    "content": "Full content...",
    "slug": "article-slug",
    "date": "2024-01-01T00:00:00",
    "author": "Dean Forant",
    "authorAvatar": "https://...",
    "featuredImage": "https://...",
    "categories": [...],
    "tags": [...]
  }
}
```

#### List Categories
```
GET /api/wordpress?action=categories
```

Response:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Brand Design",
      "slug": "brand-design",
      "count": 5
    }
  ]
}
```

## Support

For issues or questions:

1. Check this documentation
2. Review [WordPress REST API documentation](https://developer.wordpress.org/rest-api/)
3. Check Netlify function logs for errors
4. Review browser console for client-side errors

---

**Last Updated**: November 2024  
**Version**: 1.0.0
