// Articles page JavaScript
// Handles fetching and displaying articles from the WordPress API

(function() {
    'use strict';

    // Configuration
    const API_ENDPOINT = '/api/articles';
    const PER_PAGE = 10;
    
    // State
    let currentPage = 1;
    let totalPages = 1;
    let isLoading = false;

    // DOM Elements
    const elements = {
        loading: document.getElementById('articles-loading'),
        error: document.getElementById('articles-error'),
        errorMessage: document.getElementById('error-message'),
        empty: document.getElementById('articles-empty'),
        grid: document.getElementById('articles-grid'),
        pagination: document.getElementById('articles-pagination'),
        prevBtn: document.getElementById('prev-page'),
        nextBtn: document.getElementById('next-page'),
        currentPageSpan: document.getElementById('current-page'),
        totalPagesSpan: document.getElementById('total-pages')
    };

    /**
     * Show a specific state and hide others
     */
    function showState(state) {
        elements.loading.style.display = state === 'loading' ? 'block' : 'none';
        elements.error.style.display = state === 'error' ? 'block' : 'none';
        elements.empty.style.display = state === 'empty' ? 'block' : 'none';
        elements.grid.style.display = state === 'success' ? 'block' : 'none';
        elements.pagination.style.display = state === 'success' ? 'flex' : 'none';
    }

    /**
     * Format date to readable format
     */
    function formatDate(dateString) {
        const date = new Date(dateString);
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    }

    /**
     * Strip HTML tags from string
     */
    function stripHtml(html) {
        const tmp = document.createElement('div');
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || '';
    }

    /**
     * Create article card HTML
     */
    function createArticleCard(article) {
        const card = document.createElement('article');
        card.className = 'article-card';
        
        const thumbnailUrl = article.featured_image_url || 'assets/images/placeholder-article.jpg';
        const title = stripHtml(article.title);
        const excerpt = stripHtml(article.excerpt);
        const date = formatDate(article.date);
        const author = article.author_name;

        card.innerHTML = `
            <div class="article-card__image">
                <img src="${thumbnailUrl}" alt="${title}" onerror="this.src='assets/images/placeholder-article.jpg'" />
            </div>
            <div class="article-card__content">
                <h2 class="article-card__title">${title}</h2>
                <div class="article-card__meta">
                    <span class="article-card__date">
                        <i class="far fa-calendar" aria-hidden="true"></i>
                        ${date}
                    </span>
                    <span class="article-card__author">
                        <i class="far fa-user" aria-hidden="true"></i>
                        ${author}
                    </span>
                </div>
                <div class="article-card__excerpt">${excerpt}</div>
                <a href="${article.link}" class="btn btn--secondary article-card__btn" target="_blank" rel="noopener noreferrer">
                    Read More
                    <i class="fas fa-arrow-right" aria-hidden="true"></i>
                </a>
            </div>
        `;

        return card;
    }

    /**
     * Render articles to the grid
     */
    function renderArticles(articles) {
        elements.grid.innerHTML = '';
        
        articles.forEach(article => {
            const card = createArticleCard(article);
            elements.grid.appendChild(card);
        });
    }

    /**
     * Update pagination controls
     */
    function updatePagination(pagination) {
        currentPage = pagination.page;
        totalPages = pagination.totalPages;

        elements.currentPageSpan.textContent = currentPage;
        elements.totalPagesSpan.textContent = totalPages;

        // Update button states
        elements.prevBtn.disabled = !pagination.hasPrevPage;
        elements.nextBtn.disabled = !pagination.hasNextPage;

        // Add/remove disabled class for styling
        elements.prevBtn.classList.toggle('articles-pagination__btn--disabled', !pagination.hasPrevPage);
        elements.nextBtn.classList.toggle('articles-pagination__btn--disabled', !pagination.hasNextPage);
    }

    /**
     * Fetch articles from API
     */
    async function fetchArticles(page = 1) {
        if (isLoading) return;

        isLoading = true;
        showState('loading');

        try {
            const url = `${API_ENDPOINT}?page=${page}&per_page=${PER_PAGE}`;
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();

            if (!result.success) {
                throw new Error(result.message || 'Failed to fetch articles');
            }

            if (!result.data || result.data.length === 0) {
                showState('empty');
            } else {
                renderArticles(result.data);
                updatePagination(result.pagination);
                showState('success');
                
                // Scroll to top of articles section
                document.querySelector('.articles-list').scrollIntoView({ 
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        } catch (error) {
            console.error('Error fetching articles:', error);
            elements.errorMessage.textContent = error.message || 'Failed to load articles. Please try again later.';
            showState('error');
        } finally {
            isLoading = false;
        }
    }

    /**
     * Handle pagination button clicks
     */
    function setupPagination() {
        elements.prevBtn.addEventListener('click', () => {
            if (currentPage > 1) {
                fetchArticles(currentPage - 1);
            }
        });

        elements.nextBtn.addEventListener('click', () => {
            if (currentPage < totalPages) {
                fetchArticles(currentPage + 1);
            }
        });
    }

    /**
     * Initialize the articles page
     */
    function init() {
        // Check if we're on the articles page
        if (!elements.grid) return;

        // Setup pagination controls
        setupPagination();

        // Get page number from URL if present
        const urlParams = new URLSearchParams(window.location.search);
        const pageParam = parseInt(urlParams.get('page'), 10);
        const initialPage = pageParam && pageParam > 0 ? pageParam : 1;

        // Fetch initial articles
        fetchArticles(initialPage);
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
