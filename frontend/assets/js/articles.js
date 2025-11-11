// Articles page JavaScript
// Handles fetching and displaying articles from WordPress CMS via Netlify Function

(function() {
    'use strict';

    // Configuration
    const API_ENDPOINT = '/api/articles'; // Will be rewritten by netlify.toml
    const ARTICLES_PER_PAGE = 10;
    const PLACEHOLDER_IMAGE = 'assets/images/article-placeholder.svg';

    // DOM Elements
    let articlesContainer;
    let loadingElement;
    let errorElement;
    let errorMessageElement;
    let emptyElement;
    let paginationElement;
    let prevButton;
    let nextButton;
    let currentPageSpan;
    let totalPagesSpan;

    // State
    let currentPage = 1;
    let totalPages = 1;
    let isLoading = false;

    // Initialize when DOM is ready
    document.addEventListener('DOMContentLoaded', init);

    function init() {
        // Get DOM elements
        articlesContainer = document.getElementById('articles-container');
        loadingElement = document.getElementById('articles-loading');
        errorElement = document.getElementById('articles-error');
        errorMessageElement = document.getElementById('articles-error-message');
        emptyElement = document.getElementById('articles-empty');
        paginationElement = document.getElementById('articles-pagination');
        prevButton = document.getElementById('prev-page');
        nextButton = document.getElementById('next-page');
        currentPageSpan = document.getElementById('current-page');
        totalPagesSpan = document.getElementById('total-pages');

        // Check if all elements exist
        if (!articlesContainer || !loadingElement || !errorElement || !paginationElement) {
            console.error('Required DOM elements not found');
            return;
        }

        // Set up event listeners
        prevButton.addEventListener('click', handlePrevPage);
        nextButton.addEventListener('click', handleNextPage);

        // Load initial articles
        loadArticles(1);
    }

    function showLoading() {
        hideAllStates();
        loadingElement.style.display = 'flex';
    }

    function showError(message) {
        hideAllStates();
        errorMessageElement.textContent = message || 'Failed to load articles. Please try again later.';
        errorElement.style.display = 'flex';
    }

    function showEmpty() {
        hideAllStates();
        emptyElement.style.display = 'flex';
    }

    function showArticles() {
        hideAllStates();
        articlesContainer.style.display = 'grid';
        paginationElement.style.display = 'flex';
    }

    function hideAllStates() {
        loadingElement.style.display = 'none';
        errorElement.style.display = 'none';
        emptyElement.style.display = 'none';
        articlesContainer.style.display = 'none';
        paginationElement.style.display = 'none';
    }

    async function loadArticles(page) {
        if (isLoading) return;
        
        isLoading = true;
        showLoading();

        try {
            const response = await fetch(`${API_ENDPOINT}?page=${page}&per_page=${ARTICLES_PER_PAGE}`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                if (response.status === 429) {
                    throw new Error('Too many requests. Please try again in a moment.');
                }
                throw new Error(`Server returned ${response.status}`);
            }

            const result = await response.json();

            if (!result.success || !result.data) {
                throw new Error('Invalid response from server');
            }

            const { articles, total, totalPages: pages, currentPage: current } = result.data;

            if (!articles || articles.length === 0) {
                showEmpty();
                return;
            }

            // Update state
            currentPage = current || page;
            totalPages = pages || 1;

            // Render articles
            renderArticles(articles);

            // Update pagination
            updatePagination();

            // Show content
            showArticles();

            // Scroll to top of articles section
            document.querySelector('.articles-list').scrollIntoView({ behavior: 'smooth' });

        } catch (error) {
            console.error('Error loading articles:', error);
            showError(error.message);
        } finally {
            isLoading = false;
        }
    }

    function renderArticles(articles) {
        // Clear existing content
        articlesContainer.innerHTML = '';

        articles.forEach(article => {
            const articleElement = createArticleElement(article);
            articlesContainer.appendChild(articleElement);
        });
    }

    function createArticleElement(article) {
        const articleDiv = document.createElement('article');
        articleDiv.className = 'article-card';

        // Format date
        const date = new Date(article.date);
        const formattedDate = date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        // Clean excerpt (remove HTML tags)
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = article.excerpt;
        const cleanExcerpt = tempDiv.textContent || tempDiv.innerText || '';

        // Image with fallback
        const imageUrl = article.featuredImage || PLACEHOLDER_IMAGE;

        articleDiv.innerHTML = `
            <div class="article-card__image">
                <img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(article.title)}" onerror="this.src='${PLACEHOLDER_IMAGE}'" />
            </div>
            <div class="article-card__content">
                <div class="article-card__meta">
                    <span class="article-card__date">
                        <i class="far fa-calendar" aria-hidden="true"></i>
                        ${escapeHtml(formattedDate)}
                    </span>
                    <span class="article-card__author">
                        <i class="far fa-user" aria-hidden="true"></i>
                        ${escapeHtml(article.author)}
                    </span>
                </div>
                <h2 class="article-card__title">${escapeHtml(article.title)}</h2>
                <div class="article-card__excerpt">${escapeHtml(cleanExcerpt)}</div>
                <a href="${escapeHtml(article.link)}" class="btn btn--primary article-card__btn" target="_blank" rel="noopener noreferrer">
                    Read More
                    <i class="fas fa-arrow-right" aria-hidden="true"></i>
                </a>
            </div>
        `;

        return articleDiv;
    }

    function updatePagination() {
        currentPageSpan.textContent = currentPage;
        totalPagesSpan.textContent = totalPages;

        // Update button states
        prevButton.disabled = currentPage <= 1;
        nextButton.disabled = currentPage >= totalPages;
    }

    function handlePrevPage() {
        if (currentPage > 1 && !isLoading) {
            loadArticles(currentPage - 1);
        }
    }

    function handleNextPage() {
        if (currentPage < totalPages && !isLoading) {
            loadArticles(currentPage + 1);
        }
    }

    // Utility: Escape HTML to prevent XSS
    function escapeHtml(unsafe) {
        if (typeof unsafe !== 'string') {
            return '';
        }
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

})();
