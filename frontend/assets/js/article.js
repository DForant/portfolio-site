/**
 * Article page functionality
 * Fetches and displays a single WordPress post
 */

(function() {
    'use strict';

    // Configuration
    const API_BASE = '/api/wordpress';

    // Elements
    const articleLoading = document.getElementById('article-loading');
    const articleError = document.getElementById('article-error');
    const articleErrorMessage = document.getElementById('article-error-message');
    const articleContent = document.getElementById('article-content');
    const articleTitle = document.getElementById('article-title');
    const articleBreadcrumbTitle = document.getElementById('article-breadcrumb-title');
    const articleAuthor = document.getElementById('article-author');
    const articleAuthorAvatar = document.getElementById('article-author-avatar');
    const articleDate = document.getElementById('article-date');
    const articleCategories = document.getElementById('article-categories');
    const articleBody = document.getElementById('article-body');
    const articleTags = document.getElementById('article-tags');
    const articleFeaturedImageContainer = document.getElementById('article-featured-image-container');
    const articleFeaturedImage = document.getElementById('article-featured-image');
    const shareTwitter = document.getElementById('share-twitter');
    const shareLinkedin = document.getElementById('share-linkedin');
    const shareFacebook = document.getElementById('share-facebook');

    /**
     * Get slug from URL parameter
     */
    function getSlugFromUrl() {
        const params = new URLSearchParams(window.location.search);
        return params.get('slug');
    }

    /**
     * Fetch post from WordPress API
     */
    async function fetchPost(slug) {
        const params = new URLSearchParams({
            action: 'post',
            slug: slug
        });

        const response = await fetch(`${API_BASE}?${params.toString()}`);
        
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('Article not found');
            }
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();
        
        if (!result.success) {
            throw new Error(result.message || 'Failed to fetch article');
        }

        return result.data;
    }

    /**
     * Format date to readable string
     */
    function formatDate(dateString) {
        const date = new Date(dateString);
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    }

    /**
     * Render categories
     */
    function renderCategories(categories) {
        if (!categories || categories.length === 0) {
            articleCategories.style.display = 'none';
            return;
        }

        articleCategories.innerHTML = categories.map(cat => 
            `<span class="article__category">${cat.name}</span>`
        ).join('');
        articleCategories.style.display = 'flex';
    }

    /**
     * Render tags
     */
    function renderTags(tags) {
        if (!tags || tags.length === 0) {
            articleTags.style.display = 'none';
            return;
        }

        articleTags.innerHTML = `
            <h3>Tags</h3>
            <div class="article__tags-list">
                ${tags.map(tag => `<span class="article__tag">${tag.name}</span>`).join('')}
            </div>
        `;
        articleTags.style.display = 'block';
    }

    /**
     * Set up share buttons
     */
    function setupShareButtons(post) {
        const url = encodeURIComponent(window.location.href);
        const title = encodeURIComponent(post.title);

        shareTwitter.href = `https://twitter.com/intent/tweet?url=${url}&text=${title}`;
        shareLinkedin.href = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
        shareFacebook.href = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
    }

    /**
     * Render post
     */
    function renderPost(post) {
        // Update document title
        document.title = `${post.title} - Dean Forant Brand & Web Design`;

        // Set breadcrumb
        articleBreadcrumbTitle.textContent = post.title;

        // Set title
        articleTitle.textContent = post.title;

        // Set author
        articleAuthor.textContent = post.author;
        if (post.authorAvatar) {
            articleAuthorAvatar.src = post.authorAvatar;
            articleAuthorAvatar.alt = post.author;
            articleAuthorAvatar.style.display = 'block';
        } else {
            articleAuthorAvatar.style.display = 'none';
        }

        // Set date
        articleDate.textContent = formatDate(post.date);
        articleDate.setAttribute('datetime', post.date);

        // Set categories
        renderCategories(post.categories);

        // Set featured image
        if (post.featuredImage) {
            articleFeaturedImage.src = post.featuredImage;
            articleFeaturedImage.alt = post.featuredImageAlt || post.title;
            articleFeaturedImageContainer.style.display = 'block';
        } else {
            articleFeaturedImageContainer.style.display = 'none';
        }

        // Set content
        articleBody.innerHTML = post.content;

        // Set tags
        renderTags(post.tags);

        // Set up share buttons
        setupShareButtons(post);

        // Show article
        articleLoading.style.display = 'none';
        articleError.style.display = 'none';
        articleContent.style.display = 'block';
    }

    /**
     * Show error
     */
    function showError(message) {
        articleLoading.style.display = 'none';
        articleContent.style.display = 'none';
        articleError.style.display = 'block';
        articleErrorMessage.textContent = message;
    }

    /**
     * Load article
     */
    async function loadArticle() {
        const slug = getSlugFromUrl();

        if (!slug) {
            showError('No article specified. Please select an article from the blog.');
            return;
        }

        try {
            const post = await fetchPost(slug);
            renderPost(post);
        } catch (error) {
            console.error('Error loading article:', error);
            showError(error.message || 'Unable to load this article. It may have been removed or doesn\'t exist.');
        }
    }

    /**
     * Initialize article page
     */
    function init() {
        loadArticle();
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
