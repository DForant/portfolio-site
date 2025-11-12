// Articles page JavaScript
// Handles fetching and displaying articles from WordPress CMS

(function() {
    'use strict';

    // Configuration
    const ARTICLES_PER_PAGE = 9; // 3x3 grid
    const PLACEHOLDER_IMAGE = 'assets/images/placeholder-article.jpg';
    
    // Get CMS base URL from meta tag or fallback
    function getCmsBaseUrl() {
        const metaTag = document.querySelector('meta[name="cms-base"]');
        return metaTag ? metaTag.getAttribute('content') : 'http://dfd-cms.local';
    }

    // DOM Elements
    let articlesContainer;
    let loadingElement;
    let errorElement;
    let errorMessageElement;
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
        paginationElement = document.getElementById('articles-pagination');
    // Match IDs defined in articles.html
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
    if (prevButton) prevButton.addEventListener('click', handlePrevPage);
    if (nextButton) nextButton.addEventListener('click', handleNextPage);

        // Safety watchdog: if we're still loading after 12s, surface a friendly error
        setTimeout(() => {
            try {
                if (loadingElement && loadingElement.style.display !== 'none') {
                    showError('Request timed out. Please refresh the page.');
                }
            } catch (_) {}
        }, 12000);

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
        errorElement.style.display = 'block';
    }

    function showArticles() {
        hideAllStates();
        articlesContainer.style.display = 'grid';
        if (totalPages > 1) {
            paginationElement.style.display = 'flex';
        }
    }

    function hideAllStates() {
        loadingElement.style.display = 'none';
        errorElement.style.display = 'none';
        articlesContainer.style.display = 'none';
        paginationElement.style.display = 'none';
    }

    // Tiny helper: fetch with a timeout (so we never hang forever)
    async function fetchWithTimeout(url, options = {}, ms = 10000) {
        const controller = new AbortController();
        const t = setTimeout(() => controller.abort(), ms);
        try {
            const res = await fetch(url, { ...options, signal: controller.signal });
            return res;
        } finally {
            clearTimeout(t);
        }
    }

    async function loadArticles(page) {
        if (isLoading) return;
        
        isLoading = true;
        showLoading();

        try {
            // Try Netlify function first (works best under netlify dev / prod)
            let fnUrl = `/api/articles?page=${page}&per_page=${ARTICLES_PER_PAGE}`;
            console.log('[Articles] Fetching via Function:', fnUrl);
            let response, result;
            let usedFunction = false;

            try {
                response = await fetchWithTimeout(fnUrl, { headers: { 'Accept': 'application/json' } }, 10000);
                if (response.ok) {
                    result = await response.json().catch(() => null);
                    if (result && result.success && Array.isArray(result.data)) {
                        usedFunction = true;
                    }
                }
            } catch (e) {
                console.warn('[Articles] Function fetch failed, will try WordPress:', e && e.message);
            }

            let articles;
            let totalPagesValue = 1;

            if (usedFunction) {
                articles = result.data;
                totalPagesValue = result.pagination?.totalPages || 1;
                console.log(`[Articles] Loaded ${articles.length} articles from Function`);
            } else {
                // Fall back to direct WordPress endpoint (handles local dev without function)
                const cmsBase = getCmsBaseUrl();
                const wpUrl = `${cmsBase}/wp-json/wp/v2/article?page=${page}&per_page=${ARTICLES_PER_PAGE}&status=publish&_embed=1`;
                console.log('[Articles] Fetching from WordPress:', wpUrl);
                const wpRes = await fetchWithTimeout(wpUrl, { headers: { 'Accept': 'application/json' } }, 10000);
                if (!wpRes.ok) {
                    const errText = await wpRes.text();
                    console.error('[Articles] WordPress error:', wpRes.status, errText.slice(0, 300));
                    if (wpRes.status === 404) throw new Error('Articles endpoint not found on CMS.');
                    throw new Error(`Failed to load articles (HTTP ${wpRes.status})`);
                }
                const wpData = await wpRes.json();
                articles = Array.isArray(wpData) ? wpData : [];
                const tph = wpRes.headers.get('X-WP-TotalPages');
                totalPagesValue = tph ? parseInt(tph, 10) : 1;
                console.log(`[Articles] Loaded ${articles.length} articles from WordPress`);
            }

            totalPages = totalPagesValue;
            currentPage = page;

            // Handle empty results
            if (!articles || articles.length === 0) {
                if (currentPage === 1) {
                    showError('No articles available at this time.');
                } else {
                    showError('No articles found on this page.');
                }
                return;
            }

            // Render articles
            renderArticles(articles);

            // Update pagination
            updatePagination();

            // Show content
            showArticles();

            // Scroll to top of articles section on pagination
            if (page > 1) {
                const articlesSection = document.querySelector('.articles-list');
                if (articlesSection) {
                    articlesSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }

        } catch (error) {
            console.error('[Articles] Load error:', error);
            if (error && error.stack) console.error('[Articles] Error stack:', error.stack);
            showError(error && error.message ? error.message : 'Unable to load articles. Please check your internet connection and try again.');
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
        articleDiv.className = 'card card--article';

        // Extract title - handle both Netlify function (plain string) and WordPress API (object with .rendered)
        const title = stripHtml(typeof article.title === 'string' ? article.title : (article.title?.rendered || 'Untitled'));
        
        // Extract and clean excerpt - handle both formats
        const excerptRaw = typeof article.excerpt === 'string' ? article.excerpt : (article.excerpt?.rendered || '');
        const excerpt = stripHtml(excerptRaw).slice(0, 150) + '...';
        
        // Format date
        const date = new Date(article.date);
        const formattedDate = date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        // Get author name
        const author = article.author_name || 'Dean Forant';
        
        // Get featured image
        const imageUrl = article.featured_image_url || PLACEHOLDER_IMAGE;
        
        // Get article slug for URL
        const articleSlug = article.slug || article.id;

        articleDiv.innerHTML = `
            <a href="article.html?slug=${escapeHtml(articleSlug)}" class="card__link" aria-label="Read ${escapeHtml(title)}">
                <div class="card__image">
                    <img 
                        src="${escapeHtml(imageUrl)}" 
                        alt="${escapeHtml(title)}" 
                        loading="lazy"
                        onerror="this.src='${PLACEHOLDER_IMAGE}'"
                    />
                </div>
                <div class="card__content">
                    <h2 class="card__title">${escapeHtml(title)}</h2>
                    <div class="card__meta">
                        <span class="card__meta-item">
                            <i class="far fa-calendar" aria-hidden="true"></i>
                            ${escapeHtml(formattedDate)}
                        </span>
                        <span class="card__meta-item">
                            <i class="far fa-user" aria-hidden="true"></i>
                            ${escapeHtml(author)}
                        </span>
                    </div>
                    <p class="card__excerpt">${escapeHtml(excerpt)}</p>
                    <span class="card__cta">
                        Read More
                        <i class="fas fa-arrow-right" aria-hidden="true"></i>
                    </span>
                </div>
            </a>
        `;

        return articleDiv;
    }
    
    // Utility: Strip HTML tags
    function stripHtml(html) {
        const tmp = document.createElement('div');
        tmp.innerHTML = html || '';
        return tmp.textContent || tmp.innerText || '';
    }

    function updatePagination() {
        currentPageSpan.textContent = currentPage;
        totalPagesSpan.textContent = totalPages;

        // Update button states
        prevButton.disabled = currentPage <= 1;
        nextButton.disabled = currentPage >= totalPages;
        
        // Add/remove disabled class for styling
        if (currentPage <= 1) {
            prevButton.classList.add('articles-pagination__btn--disabled');
        } else {
            prevButton.classList.remove('articles-pagination__btn--disabled');
        }
        
        if (currentPage >= totalPages) {
            nextButton.classList.add('articles-pagination__btn--disabled');
        } else {
            nextButton.classList.remove('articles-pagination__btn--disabled');
        }
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
