# Articles Listing Page

This document describes the articles listing page implementation for the Dean Forant Portfolio website.

## Overview

The articles listing page displays blog posts/articles from a WordPress CMS via the WordPress REST API. The page includes:

- Article cards with thumbnail, title, date, author, and excerpt
- Pagination (10 articles per page)
- Responsive design matching the portfolio style
- Placeholder images for articles without thumbnails
- Configurable API endpoint for development and production environments

## Files Created

- `frontend/articles.html` - Main articles listing page
- `frontend/assets/js/config.js` - Configuration file for API endpoints
- `frontend/assets/js/articles.js` - JavaScript for fetching and displaying articles
- `frontend/assets/sass/pages/_articles.scss` - Sass styles for the articles page
- `frontend/assets/images/article-placeholder.svg` - Placeholder image for articles without thumbnails

## Configuration

### API Endpoint Configuration

The API endpoint is configured in `frontend/assets/js/config.js`. By default, it uses:

- **Local Development**: `http://dfd-cms.local/wp-json/wp/v2`
- **Production**: `https://deanforantdesigns.com/wp-json/wp/v2`

To change the production endpoint, edit the `CONFIG.api.wordpress.baseUrl` value in `config.js`:

```javascript
baseUrl: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
    ? 'http://dfd-cms.local/wp-json/wp/v2'  // Local development URL
    : 'https://your-production-domain.com/wp-json/wp/v2'  // Production URL
```

### Pagination Settings

Articles per page can be configured in `config.js`:

```javascript
pagination: {
    articlesPerPage: 10  // Change this number to display more/fewer articles per page
}
```

## WordPress API Requirements

The articles page expects the WordPress REST API to return posts with the following data:

- `title.rendered` - Article title
- `excerpt.rendered` - Article excerpt (HTML)
- `date` - Publication date
- `link` - URL to the full article
- `_embedded['wp:featuredmedia']` - Featured image (optional)
- `_embedded.author` - Author information (optional)

The API endpoint should support:
- `per_page` parameter for pagination
- `page` parameter for page number
- `_embed` parameter to include featured media and author data

## Features

### Article Cards

Each article card displays:
- Thumbnail image (or placeholder if none exists)
- Article title
- Publication date with calendar icon
- Author name with user icon
- Excerpt (limited to 3 lines)
- "Read More" button linking to the full article

### Pagination

- Displays up to 5 page numbers at a time
- Shows "Previous" and "Next" buttons when applicable
- Current page is highlighted
- Uses ellipsis (...) for skipped page ranges
- Smooth scroll to top when changing pages

### Responsive Design

- **Desktop**: Article cards display with image on the left (300px wide) and content on the right
- **Tablet** (< 962px): Image width reduces to 250px
- **Mobile** (< 768px): Cards stack vertically with full-width images on top

### Error Handling

The page gracefully handles:
- API connection failures (shows error message)
- Empty results (shows "No articles found" message)
- Missing thumbnails (uses placeholder image)
- Missing author data (shows "Unknown Author")

## Styling

The articles page uses BEM (Block Element Modifier) naming convention and matches the existing portfolio design:

- Colors: Primary blue (#4A6C9B), Accent gold (#FDB813)
- Typography: Playfair Display for headings, Montserrat for body text
- Consistent spacing and border radius with other pages
- Hover effects on desktop (cards lift slightly)

## Navigation

The "Articles" link has been added to:
- Header navigation (between Portfolio and Contact)
- Footer Quick Links section

## Testing

### Local Development Testing

1. Set up a local WordPress instance at `dfd-cms.local` with the REST API enabled
2. Create some test posts with featured images
3. Start the development server:
   ```bash
   cd frontend
   npx serve .
   ```
4. Navigate to `http://localhost:3000/articles.html`

### Production Testing

1. Update the production URL in `config.js`
2. Deploy the site
3. Verify articles load correctly
4. Test pagination functionality
5. Check responsive behavior on different devices

## Browser Support

- Chrome (last 2 versions)
- Firefox (last 2 versions)
- Safari (last 2 versions)
- Edge (last 2 versions)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Accessibility

The articles page includes:
- Semantic HTML5 elements (`<article>`, `<nav>`, etc.)
- ARIA labels for navigation and pagination
- `aria-current="page"` for the active pagination button
- Alt text for all images
- Keyboard navigation support

## Future Enhancements

Potential improvements:
- Search/filter functionality
- Category/tag filtering
- Sort options (date, popularity, etc.)
- Article preview modal
- Social sharing buttons
- Related articles suggestions
- Loading skeleton/placeholder during fetch
