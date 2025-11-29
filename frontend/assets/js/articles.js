// articles.js - Articles listing page functionality
document.addEventListener('DOMContentLoaded', () => {
    // DOM elements
    const loadingEl = document.getElementById('articles-loading');
    const errorEl = document.getElementById('articles-error');
    const errorMessageEl = document.getElementById('articles-error-message');
    const emptyEl = document.getElementById('articles-empty');
    const listEl = document.getElementById('articles-list');
    const paginationEl = document.getElementById('articles-pagination');
    const prevBtn = document.getElementById('pagination-prev');
    const nextBtn = document.getElementById('pagination-next');
    const currentPageEl = document.getElementById('pagination-current');
    const totalPagesEl = document.getElementById('pagination-total');
    const retryBtn = document.getElementById('articles-retry');

    // State
    let currentPage = 1;
    let totalPages = 1;
    let isLoading = false;

    // Placeholder image for articles without thumbnails
    const PLACEHOLDER_IMAGE = 'assets/images/article-placeholder.svg';

    // Get API endpoint - uses Netlify function or falls back for local dev
    const getApiEndpoint = () => {
        const host = window.location.hostname;
        const port = window.location.port;
        
        // If running on localhost with Express dev server
        if ((host === 'localhost' || host === '127.0.0.1') && port && port !== '8888' && port !== '8889') {
            return 'http://localhost:4000/api/articles';
        }
        
        // Default to Netlify function
        return '/api/articles';
    };

    // Format date for display
    const formatDate = (dateString) => {
        if (!dateString) return '';
        
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch (e) {
            return '';
        }
    };

    // Strip HTML tags and decode entities from excerpt
    const sanitizeExcerpt = (html) => {
        if (!html) return '';
        
        // Create a temporary element to decode HTML entities
        const temp = document.createElement('div');
        temp.innerHTML = html;
        
        // Get text content and trim
        let text = temp.textContent || temp.innerText || '';
        
        // Remove extra whitespace and limit length
        text = text.trim().replace(/\s+/g, ' ');
        
        // Truncate if too long
        if (text.length > 200) {
            text = text.substring(0, 200).trim() + '...';
        }
        
        return text;
    };

    // Sanitize title from WordPress API
    const sanitizeTitle = (html) => {
        if (!html) return 'Untitled';
        
        const temp = document.createElement('div');
        temp.innerHTML = html;
        return temp.textContent || temp.innerText || 'Untitled';
    };

    // Create article card HTML
    const createArticleCard = (article) => {
        const title = sanitizeTitle(article.title);
        const excerpt = sanitizeExcerpt(article.excerpt);
        const date = formatDate(article.date);
        const author = article.author || 'Unknown';
        const thumbnail = article.thumbnail || PLACEHOLDER_IMAGE;
        const articleLink = article.link || '#';
        
        const card = document.createElement('article');
        card.className = 'article-card';
        
        card.innerHTML = `
            <div class="article-card__image">
                <img src="${thumbnail}" alt="${title}" loading="lazy" onerror="this.onerror=null; this.src='${PLACEHOLDER_IMAGE}';" />
            </div>
            <div class="article-card__content">
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
                <h2 class="article-card__title">${title}</h2>
                <p class="article-card__excerpt">${excerpt}</p>
                <a href="${articleLink}" class="btn btn--primary btn--small article-card__cta" target="_blank" rel="noopener">
                    Read More
                    <i class="fa-solid fa-arrow-right" aria-hidden="true"></i>
                </a>
            </div>
        `;
        
        return card;
    };

    // Show/hide states
    const showLoading = () => {
        loadingEl.style.display = 'flex';
        errorEl.style.display = 'none';
        emptyEl.style.display = 'none';
        listEl.style.display = 'none';
        paginationEl.style.display = 'none';
    };

    const showError = (message) => {
        loadingEl.style.display = 'none';
        errorEl.style.display = 'flex';
        emptyEl.style.display = 'none';
        listEl.style.display = 'none';
        paginationEl.style.display = 'none';
        errorMessageEl.textContent = message || 'We couldn\'t fetch the articles at this time. Please try again later.';
    };

    const showEmpty = () => {
        loadingEl.style.display = 'none';
        errorEl.style.display = 'none';
        emptyEl.style.display = 'flex';
        listEl.style.display = 'none';
        paginationEl.style.display = 'none';
    };

    const showArticles = () => {
        loadingEl.style.display = 'none';
        errorEl.style.display = 'none';
        emptyEl.style.display = 'none';
        listEl.style.display = 'block';
        paginationEl.style.display = 'flex';
    };

    // Update pagination controls
    const updatePagination = () => {
        currentPageEl.textContent = currentPage;
        totalPagesEl.textContent = totalPages;
        
        prevBtn.disabled = currentPage <= 1;
        nextBtn.disabled = currentPage >= totalPages;
        
        // Hide pagination if only one page
        if (totalPages <= 1) {
            paginationEl.style.display = 'none';
        } else {
            paginationEl.style.display = 'flex';
        }
    };

    // Fetch articles from API
    const fetchArticles = async (page = 1) => {
        if (isLoading) return;
        
        isLoading = true;
        showLoading();
        
        try {
            const endpoint = getApiEndpoint();
            const url = `${endpoint}?page=${page}&per_page=10`;
            
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            });
            
            if (!response.ok) {
                if (response.status === 404) {
                    showEmpty();
                    return;
                }
                throw new Error(`HTTP ${response.status}`);
            }
            
            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.message || 'Failed to fetch articles');
            }
            
            const articles = data.articles || [];
            const pagination = data.pagination || {};
            
            if (articles.length === 0) {
                showEmpty();
                return;
            }
            
            // Update state
            currentPage = pagination.currentPage || page;
            totalPages = pagination.totalPages || 1;
            
            // Clear and populate list
            listEl.innerHTML = '';
            articles.forEach(article => {
                const card = createArticleCard(article);
                listEl.appendChild(card);
            });
            
            // Update pagination and show articles
            updatePagination();
            showArticles();
            
            // Scroll to top of articles section on page change
            if (page > 1) {
                const articlesSection = document.querySelector('.articles');
                if (articlesSection) {
                    articlesSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }
            
        } catch (error) {
            console.error('Error fetching articles:', error);
            showError('We couldn\'t fetch the articles at this time. Please try again later.');
        } finally {
            isLoading = false;
        }
    };

    // Event listeners
    prevBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            fetchArticles(currentPage - 1);
        }
    });

    nextBtn.addEventListener('click', () => {
        if (currentPage < totalPages) {
            fetchArticles(currentPage + 1);
        }
    });

    retryBtn.addEventListener('click', () => {
        fetchArticles(currentPage);
    });

    // Mobile nav toggle (same as main.js)
    const header = document.querySelector('.header');
    const toggle = document.querySelector('.header__toggle');
    const nav = document.getElementById('header-nav');
    
    if (toggle && header && nav) {
        toggle.addEventListener('click', () => {
            const isOpen = header.classList.toggle('header--menu-open');
            toggle.setAttribute('aria-expanded', String(isOpen));
        });
        
        nav.querySelectorAll('.header__nav-link').forEach(link => {
            link.addEventListener('click', () => {
                if (header.classList.contains('header--menu-open')) {
                    header.classList.remove('header--menu-open');
                    toggle.setAttribute('aria-expanded', 'false');
                }
            });
        });
        
        document.addEventListener('click', (e) => {
            if (!header.contains(e.target) && header.classList.contains('header--menu-open')) {
                header.classList.remove('header--menu-open');
                toggle.setAttribute('aria-expanded', 'false');
            }
        });
    }

    // Initial fetch
    fetchArticles(1);
});
