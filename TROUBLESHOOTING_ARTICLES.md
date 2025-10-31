# Troubleshooting Articles and Author Display

This guide helps diagnose issues with article listing and author information display.

## Quick Diagnostic Checklist

### 1. Verify WordPress API Accessibility

Test that your WordPress API is accessible:

```bash
# Test article endpoint
curl http://dfd-cms.local/wp-json/wp/v2/article

# Test users endpoint
curl http://dfd-cms.local/wp-json/wp/v2/users
```

**Expected Results:**
- Article endpoint should return an array of articles
- Users endpoint should return an array of users with names

**Common Issues:**
- 404 Error: Custom post type 'article' may not be registered in WordPress
- Empty array: No articles published or wrong post type name
- Connection refused: WordPress not running or wrong URL

### 2. Check Environment Variables

Create a `.env` file in the repository root with:

```bash
# WordPress API Configuration
WP_API_BASE_URL=http://dfd-cms.local/wp-json/wp/v2
WP_ARTICLE_POST_TYPE=article

# Enable debugging to see detailed logs
ENABLE_API_DEBUG=1
```

**Note:** The `.env` file is gitignored and used for local development only.

### 3. Verify Custom Post Type Name

In your WordPress (dfd-cms), check what slug your custom post type uses:

1. Go to WordPress Admin → Posts → Articles (or whatever your CPT is called)
2. Look at the URL - it will be like: `/wp-admin/edit.php?post_type=article`
3. The `post_type=` value is your custom post type slug
4. Update `WP_ARTICLE_POST_TYPE` in `.env` to match

**Common post type slugs:**
- `article` (most likely for dfd-cms)
- `dfd-article`
- `articles`
- `posts` (standard WordPress posts)

### 4. Enable Debug Logging

1. Create/edit `.env` in repository root:
   ```bash
   ENABLE_API_DEBUG=1
   ```

2. Restart `netlify dev`

3. Open browser console and check the terminal running `netlify dev`

4. Look for log messages starting with `[Article Function]` or `[Articles Function]`

**What to look for:**
- "Fetching: http://..." - shows the URL being called
- "Found posts: X" - confirms articles are being fetched
- "Post author ID: X" - shows the author ID from the post
- "Fetching author details: ..." - shows author fetch attempt
- "Author data: ..." - confirms author was fetched successfully

### 5. Test the Netlify Function Directly

While `netlify dev` is running, test the function directly:

```bash
# Test articles list
curl http://localhost:8888/.netlify/functions/articles

# Test single article (replace 'your-article-slug' with actual slug)
curl http://localhost:8888/.netlify/functions/article?slug=your-article-slug
```

**Check the response for:**
```json
{
  "success": true,
  "data": {
    "author_name": "Dean Forant",  // Should NOT be "Unknown"
    "author_description": "...",    // Should have biographical info if set
    "author_avatar_url": "...",     // Should have avatar URL
    // ...other fields
  }
}
```

### 6. Common Issues and Solutions

#### Issue: Author shows as "Unknown"

**Possible causes:**
1. **WordPress API not returning author data in `_embed`**
   - Solution: Functions now fetch from `/users/{id}` directly
   - Check if `/users` endpoint is accessible

2. **WordPress REST API user endpoint blocked**
   - Test: `curl http://dfd-cms.local/wp-json/wp/v2/users`
   - If 401/403: Enable user endpoint in WordPress
   - Add to `functions.php`:
   ```php
   add_filter('rest_user_query', function($prepared_args) {
       $prepared_args['has_published_posts'] = true;
       return $prepared_args;
   });
   ```

3. **Author ID is missing or 0**
   - Check if articles in WordPress have an assigned author
   - Edit article in WordPress → check "Author" dropdown

#### Issue: About Author section not appearing

**Possible causes:**
1. **Author name is "Unknown"**
   - Section only shows when author name exists and is not "Unknown"
   - Fix the "Unknown" issue first (see above)

2. **Old cached build**
   - Stop `netlify dev`
   - Clear browser cache
   - Delete `frontend/dist/` directory
   - Run `npm run build:frontend`
   - Restart `netlify dev`

3. **React component not updated**
   - Check that you're on the correct branch
   - Run: `git status` and `git log -1`
   - Should be on branch with recent commits

#### Issue: Custom post type not found (404)

**Solutions:**
1. Verify post type slug in WordPress
2. Update `WP_ARTICLE_POST_TYPE` environment variable
3. Flush WordPress permalinks:
   - WordPress Admin → Settings → Permalinks → Save Changes

#### Issue: Changes not reflecting locally

**Solutions:**
1. **Restart `netlify dev`** - Functions are cached
2. **Clear browser cache** - React app may be cached
3. **Check you're on the right branch**: `git branch`
4. **Verify environment variables**: Create `.env` file with config

## Step-by-Step Debug Process

1. **Create `.env` file:**
   ```bash
   WP_API_BASE_URL=http://dfd-cms.local/wp-json/wp/v2
   WP_ARTICLE_POST_TYPE=article
   ENABLE_API_DEBUG=1
   ```

2. **Stop and restart `netlify dev`:**
   ```bash
   # Stop current process (Ctrl+C)
   netlify dev
   ```

3. **Open browser DevTools** (F12) and go to Network tab

4. **Navigate to an article page**

5. **Check Terminal Output** for `[Article Function]` logs:
   - Should show WordPress API URL being called
   - Should show post being found
   - Should show author being fetched
   - Should show author name (not "Unknown")

6. **Check Network Tab** in browser:
   - Look for request to `/api/article?slug=...`
   - Click on it and check "Response" tab
   - Verify `author_name` is not "Unknown"

7. **Check Console** for any JavaScript errors

## Getting Help

If issues persist, provide the following information:

1. Output of: `curl http://dfd-cms.local/wp-json/wp/v2/article` (first item)
2. Output of: `curl http://dfd-cms.local/wp-json/wp/v2/users` (first item)
3. Screenshot of terminal running `netlify dev` with debug logs
4. Screenshot of Network tab showing the API response
5. Your environment variable settings (without sensitive values)

## WordPress Configuration Checklist

Ensure in dfd-cms WordPress:

- [ ] Custom post type 'article' is registered and has published posts
- [ ] Posts have an assigned author (not empty/0)
- [ ] Author user has a name set
- [ ] REST API is accessible (not blocked by security plugins)
- [ ] Users endpoint is not disabled
- [ ] Biographical Info is filled in the user profile (optional, for bio display)
- [ ] ACF field `author_profile_image` exists on user (optional, for custom photo)
