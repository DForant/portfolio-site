// Articles page JavaScript
// Handles fetching and displaying articles from WordPress CMS

(function() {
    'use strict';

    // Configuration
    const API_ENDPOINT = '/api/articles';
    const ARTICLES_PER_PAGE = 10;
    const PLACEHOLDER_IMAGE = 'assets/images/article-placeholder.jpg';

    // State
    let currentPage = 1;
    let totalPages = 1;
    let isLoading = false;

    // DOM Elements
    const elements = {
        loading: document.getElementById('articles-loading'),
        error: document.getElementById('articles-error'),
        empty: document.getElementById('articles-empty'),
        container: document.getElementById('articles-container'),
        pagination: document.getElementById('articles-pagination'),
        prevBtn: document.getElementById('prev-page'),
        nextBtn: document.getElementById('next-page'),
        currentPageSpan: document.getElementById('current-page'),
        totalPagesSpan: document.getElementById('total-pages'),
        retryBtn: document.getElementById('retry-button')
    };

    /**
     * Initialize the articles page
     */
    function init() {
        // Add event listeners
        if (elements.prevBtn) {
            elements.prevBtn.addEventListener('click', () => loadPage(currentPage - 1));
        }
        if (elements.nextBtn) {
            elements.nextBtn.addEventListener('click', () => loadPage(currentPage + 1));
        }
        if (elements.retryBtn) {
            elements.retryBtn.addEventListener('click', () => loadPage(currentPage));
        }

        // Load first page
        loadPage(1);
    }

    /**
     * Show loading state
     */
    function showLoading() {
        hideAllStates();
        if (elements.loading) elements.loading.style.display = 'block';
        isLoading = true;
    }

    /**
     * Show error state
     */
    function showError(message) {
        hideAllStates();
        if (elements.error) {
            elements.error.style.display = 'block';
            const errorMessage = elements.error.querySelector('.articles-list__error-message');
            if (errorMessage) {
                errorMessage.textContent = message || 'Unable to load articles. Please try again later.';
            }
        }
        isLoading = false;
    }

    /**
     * Show empty state
     */
    function showEmpty() {
        hideAllStates();
        if (elements.empty) elements.empty.style.display = 'block';
        isLoading = false;
    }

    /**
     * Show articles
     */
    function showArticles() {
        hideAllStates();
        if (elements.container) elements.container.style.display = 'block';
        if (elements.pagination) elements.pagination.style.display = 'flex';
        isLoading = false;
    }

    /**
     * Hide all state elements
     */
    function hideAllStates() {
        if (elements.loading) elements.loading.style.display = 'none';
        if (elements.error) elements.error.style.display = 'none';
        if (elements.empty) elements.empty.style.display = 'none';
        if (elements.container) elements.container.style.display = 'none';
        if (elements.pagination) elements.pagination.style.display = 'none';
    }

    /**
     * Load articles for a specific page
     */
    async function loadPage(page) {
        if (isLoading) return;

        // Validate page number
        if (page < 1) page = 1;

        showLoading();
        
        // Scroll to top of articles section
        const articlesSection = document.querySelector('.articles-list');
        if (articlesSection) {
            articlesSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }

        try {
            const url = `${API_ENDPOINT}?page=${page}&per_page=${ARTICLES_PER_PAGE}`;
            
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            const result = await response.json();

            if (!result.success) {
                throw new Error(result.message || 'Failed to load articles');
            }

            // Update state
            currentPage = result.pagination.page;
            totalPages = result.pagination.totalPages;

            // Display articles
            if (result.data.length === 0) {
                showEmpty();
            } else {
                renderArticles(result.data);
                updatePagination(result.pagination);
                showArticles();
            }

        } catch (error) {
            console.error('Error loading articles:', error);
            showError(error.message);
        }
    }

    /**
     * Render articles in the container
     */
    function renderArticles(articles) {
        if (!elements.container) return;

        // Clear existing articles
        elements.container.innerHTML = '';

        // Create article elements
        articles.forEach(article => {
            const articleElement = createArticleElement(article);
            elements.container.appendChild(articleElement);
        });
    }

    /**
     * Create an article element
     */
    function createArticleElement(article) {
        const articleEl = document.createElement('article');
        articleEl.className = 'article-item';

        // Get image URL with fallback
        const imageUrl = article.featuredImage?.thumbnail || PLACEHOLDER_IMAGE;
        const imageAlt = article.featuredImage?.alt || article.title;

        // Format date
        const dateObj = new Date(article.date);
        const formattedDate = dateObj.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        // Strip HTML from excerpt
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = article.excerpt;
        const plainExcerpt = tempDiv.textContent || tempDiv.innerText || '';

        // Create article HTML
        articleEl.innerHTML = `
            <div class="article-item__image">
                <img src="${escapeHtml(imageUrl)}" 
                     alt="${escapeHtml(imageAlt)}" 
                     loading="lazy"
                     onerror="this.src='${PLACEHOLDER_IMAGE}'">
            </div>
            <div class="article-item__content">
                <h2 class="article-item__title">${escapeHtml(article.title)}</h2>
                <div class="article-item__meta">
                    <span class="article-item__date">
                        <i class="far fa-calendar" aria-hidden="true"></i>
                        ${escapeHtml(formattedDate)}
                    </span>
                    <span class="article-item__author">
                        <i class="far fa-user" aria-hidden="true"></i>
                        ${escapeHtml(article.author)}
                    </span>
                </div>
                <div class="article-item__excerpt">${plainExcerpt}</div>
                <a href="${escapeHtml(article.link)}" 
                   class="btn btn--primary article-item__read-more" 
                   target="_blank" 
                   rel="noopener noreferrer">
                    Read More <i class="fas fa-arrow-right" aria-hidden="true"></i>
                </a>
            </div>
        `;

        return articleEl;
    }

    /**
     * Update pagination UI
     */
    function updatePagination(pagination) {
        // Update page info
        if (elements.currentPageSpan) {
            elements.currentPageSpan.textContent = pagination.page;
        }
        if (elements.totalPagesSpan) {
            elements.totalPagesSpan.textContent = pagination.totalPages;
        }

        // Update button states
        if (elements.prevBtn) {
            elements.prevBtn.disabled = !pagination.hasPrev;
        }
        if (elements.nextBtn) {
            elements.nextBtn.disabled = !pagination.hasNext;
        }
    }

    /**
     * Escape HTML to prevent XSS
     */
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
