// Articles page JavaScript
// Handles fetching and displaying articles from WordPress CMS

(function() {
    'use strict';

    // State management
    let currentPage = 1;
    let totalPages = 1;
    let isLoading = false;

    // DOM elements
    const loadingEl = document.getElementById('articles-loading');
    const errorEl = document.getElementById('articles-error');
    const errorMessageEl = document.getElementById('error-message');
    const retryButton = document.getElementById('retry-button');
    const articlesContainer = document.getElementById('articles-container');
    const paginationContainer = document.getElementById('pagination-container');
    const prevButton = document.getElementById('prev-page');
    const nextButton = document.getElementById('next-page');
    const currentPageEl = document.getElementById('current-page');
    const totalPagesEl = document.getElementById('total-pages');

    // API endpoint - automatically detects environment
    const API_BASE = '/api/articles';

    /**
     * Fetch articles from the API
     * @param {number} page - Page number to fetch
     * @returns {Promise<Object>} - API response
     */
    async function fetchArticles(page = 1) {
        const params = new URLSearchParams({
            page: page.toString(),
            per_page: '10',
            orderby: 'date',
            order: 'desc'
        });

        const response = await fetch(`${API_BASE}?${params.toString()}`);
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
        }

        return response.json();
    }

    /**
     * Format date to readable string
     * @param {string} dateString - ISO date string
     * @returns {string} - Formatted date
     */
    function formatDate(dateString) {
        const date = new Date(dateString);
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    }

    /**
     * Decode HTML entities
     * @param {string} html - HTML string with entities
     * @returns {string} - Decoded string
     */
    function decodeHtml(html) {
        const txt = document.createElement('textarea');
        txt.innerHTML = html;
        return txt.value;
    }

    /**
     * Get featured image URL or return placeholder
     * @param {Object} article - Article object
     * @returns {string} - Image URL
     */
    function getFeaturedImage(article) {
        // Check for featured media
        if (article.featured_media && article._embedded && article._embedded['wp:featuredmedia']) {
            const media = article._embedded['wp:featuredmedia'][0];
            if (media && media.source_url) {
                return media.source_url;
            }
        }
        
        // Return placeholder image
        return 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="250" viewBox="0 0 400 250"%3E%3Crect width="400" height="250" fill="%23f8f9fa"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="Arial, sans-serif" font-size="18" fill="%234A6C9B"%3ENo Image Available%3C/text%3E%3C/svg%3E';
    }

    /**
     * Get author name
     * @param {Object} article - Article object
     * @returns {string} - Author name
     */
    function getAuthorName(article) {
        if (article._embedded && article._embedded.author && article._embedded.author[0]) {
            return article._embedded.author[0].name || 'Unknown Author';
        }
        return 'Unknown Author';
    }

    /**
     * Get excerpt or create one from content
     * @param {Object} article - Article object
     * @returns {string} - Excerpt text
     */
    function getExcerpt(article) {
        if (article.excerpt && article.excerpt.rendered) {
            const excerpt = decodeHtml(article.excerpt.rendered);
            // Remove HTML tags
            const div = document.createElement('div');
            div.innerHTML = excerpt;
            return div.textContent || div.innerText || '';
        }
        
        // Fallback: create excerpt from content
        if (article.content && article.content.rendered) {
            const div = document.createElement('div');
            div.innerHTML = article.content.rendered;
            const text = div.textContent || div.innerText || '';
            return text.substring(0, 150) + (text.length > 150 ? '...' : '');
        }
        
        return 'No excerpt available.';
    }

    /**
     * Create article card HTML
     * @param {Object} article - Article object
     * @returns {string} - HTML string
     */
    function createArticleCard(article) {
        const title = decodeHtml(article.title.rendered || 'Untitled');
        const date = formatDate(article.date);
        const author = getAuthorName(article);
        const excerpt = getExcerpt(article);
        const imageUrl = getFeaturedImage(article);
        const articleUrl = article.link || '#';

        return `
            <article class="article-card">
                <div class="article-card__image">
                    <img src="${imageUrl}" alt="${title}" loading="lazy" />
                </div>
                <div class="article-card__content">
                    <h2 class="article-card__title">${title}</h2>
                    <div class="article-card__meta">
                        <span class="article-card__date">
                            <i class="fa-regular fa-calendar" aria-hidden="true"></i>
                            ${date}
                        </span>
                        <span class="article-card__author">
                            <i class="fa-regular fa-user" aria-hidden="true"></i>
                            ${author}
                        </span>
                    </div>
                    <p class="article-card__excerpt">${excerpt}</p>
                    <a href="${articleUrl}" class="btn btn--primary article-card__btn" target="_blank" rel="noopener noreferrer">
                        Read More <i class="fa-solid fa-arrow-right" aria-hidden="true"></i>
                    </a>
                </div>
            </article>
        `;
    }

    /**
     * Render articles to the DOM
     * @param {Array} articles - Array of article objects
     */
    function renderArticles(articles) {
        if (!articles || articles.length === 0) {
            articlesContainer.innerHTML = `
                <div class="articles__empty">
                    <i class="fa-solid fa-inbox"></i>
                    <p>No articles found.</p>
                </div>
            `;
            return;
        }

        const html = articles.map(article => createArticleCard(article)).join('');
        articlesContainer.innerHTML = html;
    }

    /**
     * Update pagination UI
     */
    function updatePagination() {
        currentPageEl.textContent = currentPage;
        totalPagesEl.textContent = totalPages;

        prevButton.disabled = currentPage <= 1;
        nextButton.disabled = currentPage >= totalPages;

        // Show/hide pagination based on total pages
        if (totalPages > 1) {
            paginationContainer.style.display = 'flex';
        } else {
            paginationContainer.style.display = 'none';
        }
    }

    /**
     * Show loading state
     */
    function showLoading() {
        loadingEl.style.display = 'block';
        errorEl.style.display = 'none';
        articlesContainer.style.display = 'none';
        paginationContainer.style.display = 'none';
    }

    /**
     * Show error state
     * @param {string} message - Error message
     */
    function showError(message) {
        loadingEl.style.display = 'none';
        errorEl.style.display = 'block';
        articlesContainer.style.display = 'none';
        paginationContainer.style.display = 'none';
        errorMessageEl.textContent = message;
    }

    /**
     * Show content state
     */
    function showContent() {
        loadingEl.style.display = 'none';
        errorEl.style.display = 'none';
        articlesContainer.style.display = 'block';
    }

    /**
     * Load articles for a specific page
     * @param {number} page - Page number
     */
    async function loadArticles(page = 1) {
        if (isLoading) return;

        isLoading = true;
        showLoading();

        // Scroll to top of articles section
        const articlesSection = document.querySelector('.articles-page__content');
        if (articlesSection && page !== 1) {
            articlesSection.scrollIntoView({ behavior: 'smooth' });
        }

        try {
            const response = await fetchArticles(page);

            if (!response.success) {
                throw new Error(response.message || 'Failed to load articles');
            }

            // Update state
            currentPage = page;
            totalPages = response.pagination.totalPages || 1;

            // Render
            renderArticles(response.data);
            updatePagination();
            showContent();

        } catch (error) {
            console.error('Error loading articles:', error);
            showError(error.message || 'Unable to load articles. Please try again later.');
        } finally {
            isLoading = false;
        }
    }

    /**
     * Initialize the articles page
     */
    function init() {
        // Event listeners
        if (prevButton) {
            prevButton.addEventListener('click', () => {
                if (currentPage > 1) {
                    loadArticles(currentPage - 1);
                }
            });
        }

        if (nextButton) {
            nextButton.addEventListener('click', () => {
                if (currentPage < totalPages) {
                    loadArticles(currentPage + 1);
                }
            });
        }

        if (retryButton) {
            retryButton.addEventListener('click', () => {
                loadArticles(currentPage);
            });
        }

        // Load initial articles
        loadArticles(1);
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
