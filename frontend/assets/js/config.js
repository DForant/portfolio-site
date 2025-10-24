// Configuration file for API endpoints
// This allows easy switching between local development and production

const CONFIG = {
	// API endpoints based on environment
	api: {
		// For local development: use dfd-cms.local
		// For production: will be updated to actual production URL
		wordpress: {
			// Check if we're in production or local development
			baseUrl: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
				? 'http://dfd-cms.local/wp-json/wp/v2' 
				: 'https://deanforantdesigns.com/wp-json/wp/v2',
			endpoints: {
				articles: '/posts', // WordPress posts endpoint
				media: '/media'
			}
		}
	},
	
	// Pagination settings
	pagination: {
		articlesPerPage: 10
	},
	
	// Placeholder image for articles without thumbnails
	placeholderImage: 'assets/images/article-placeholder.svg'
};

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
	module.exports = CONFIG;
}
