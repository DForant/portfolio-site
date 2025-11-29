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

    // Configuration constants
    const PLACEHOLDER_IMAGE = 'assets/images/article-placeholder.svg';
    const NETLIFY_DEV_PORTS = ['8888', '8889'];
    const MAX_EXCERPT_LENGTH = 200;

    // Escape HTML to prevent XSS
    const escapeHtml = (str) => {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    };

    // Validate and sanitize URL
    const sanitizeUrl = (url) => {
        if (!url) return '#';
        try {
            const parsed = new URL(url);
            // Only allow http and https protocols
            if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
                return '#';
            }
            return parsed.href;
        } catch (e) {
            // If URL parsing fails, return safe fallback
            return '#';
        }
    };

    // Get API endpoint - uses Netlify function or falls back for local dev
    const getApiEndpoint = () => {
        const host = window.location.hostname;
        const port = window.location.port;
        
        // If running on localhost with Express dev server (not Netlify dev ports)
        if ((host === 'localhost' || host === '127.0.0.1') && port && !NETLIFY_DEV_PORTS.includes(port)) {
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

    // Decode HTML entities safely (for fallback scenarios)
    // Note: This handles common HTML entities. For complete coverage, 
    // DOMParser (the primary path) should be used.
    // Important: &amp; must be decoded LAST to prevent double-unescaping
    const decodeHtmlEntities = (text) => {
        if (!text) return '';
        return text
            // Standard HTML entities (decode &amp; last to prevent double-unescaping)
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .replace(/&#039;/g, "'")
            .replace(/&apos;/g, "'")
            .replace(/&nbsp;/g, ' ')
            // Numeric character references (decimal)
            .replace(/&#(\d+);/g, (_, num) => String.fromCharCode(parseInt(num, 10)))
            // Numeric character references (hex)
            .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
            // Decode &amp; last to prevent double-unescaping (e.g., &amp;lt; -> &lt; -> <)
            .replace(/&amp;/g, '&');
    };

    // Strip HTML tags for fallback scenarios
    // Note: This is only used when DOMParser fails (extremely rare in modern browsers).
    // The output is always displayed via textContent, which provides an additional layer of safety.
    // Uses a loop to handle nested/malformed tags that could bypass single-pass regex.
    const stripHtmlTags = (html) => {
        if (!html) return '';
        let text = html;
        let prevText;
        // Maximum iterations to prevent infinite loops on malformed input
        let iterations = 0;
        const MAX_ITERATIONS = 10;
        
        // Loop until no more angle brackets are found or max iterations reached
        do {
            prevText = text;
            // Remove complete script/style/noscript/template elements with content
            text = text.replace(/<(script|style|noscript|template)\b[^>]*>[\s\S]*?<\/\1>/gi, '');
            // Remove self-closing and void elements
            text = text.replace(/<[^>]+\/>/gi, '');
            // Remove any remaining HTML tags
            text = text.replace(/<[^>]+>/g, '');
            // Remove orphaned angle brackets that could form tags
            text = text.replace(/<[a-zA-Z]/g, '');
            iterations++;
        } while (text !== prevText && text.includes('<') && iterations < MAX_ITERATIONS);
        
        // Final safety: remove all remaining angle brackets
        text = text.replace(/[<>]/g, '');
        
        return text;
    };

    // Strip HTML tags and decode entities from excerpt using DOMParser (safer than innerHTML)
    const sanitizeExcerpt = (html) => {
        if (!html) return '';
        
        try {
            // Use DOMParser for safer HTML parsing (doesn't execute scripts)
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            
            // Get text content and trim
            let text = doc.body.textContent || '';
            
            // Remove extra whitespace and limit length
            text = text.trim().replace(/\s+/g, ' ');
            
            // Truncate if too long
            if (text.length > MAX_EXCERPT_LENGTH) {
                text = text.substring(0, MAX_EXCERPT_LENGTH).trim() + '...';
            }
            
            return text;
        } catch (e) {
            // Fallback: strip tags and decode entities if DOMParser fails
            // This handles older browsers or edge cases
            let text = stripHtmlTags(html);
            text = decodeHtmlEntities(text);
            text = text.trim().replace(/\s+/g, ' ');
            if (text.length > MAX_EXCERPT_LENGTH) {
                text = text.substring(0, MAX_EXCERPT_LENGTH).trim() + '...';
            }
            return text;
        }
    };

    // Sanitize title from WordPress API using DOMParser (safer than innerHTML)
    const sanitizeTitle = (html) => {
        if (!html) return 'Untitled';
        
        try {
            // Use DOMParser for safer HTML parsing (doesn't execute scripts)
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            return doc.body.textContent || 'Untitled';
        } catch (e) {
            // Fallback: strip tags and decode entities if DOMParser fails
            let text = stripHtmlTags(html);
            text = decodeHtmlEntities(text);
            return text.trim() || 'Untitled';
        }
    };

    // Create article card using DOM manipulation (XSS safe)
    const createArticleCard = (article) => {
        const title = sanitizeTitle(article.title);
        const excerpt = sanitizeExcerpt(article.excerpt);
        const date = formatDate(article.date);
        const author = escapeHtml(article.author || 'Unknown');
        const thumbnail = sanitizeUrl(article.thumbnail) || PLACEHOLDER_IMAGE;
        const articleLink = sanitizeUrl(article.link);
        
        const card = document.createElement('article');
        card.className = 'article-card';
        
        // Create image container
        const imageDiv = document.createElement('div');
        imageDiv.className = 'article-card__image';
        
        const img = document.createElement('img');
        img.src = thumbnail;
        img.alt = title;
        img.loading = 'lazy';
        img.onerror = function() {
            this.onerror = null;
            this.src = PLACEHOLDER_IMAGE;
        };
        imageDiv.appendChild(img);
        
        // Create content container
        const contentDiv = document.createElement('div');
        contentDiv.className = 'article-card__content';
        
        // Create meta section
        const metaDiv = document.createElement('div');
        metaDiv.className = 'article-card__meta';
        
        const dateSpan = document.createElement('span');
        dateSpan.className = 'article-card__date';
        dateSpan.innerHTML = '<i class="fa-regular fa-calendar" aria-hidden="true"></i> ';
        dateSpan.appendChild(document.createTextNode(date));
        
        const authorSpan = document.createElement('span');
        authorSpan.className = 'article-card__author';
        authorSpan.innerHTML = '<i class="fa-regular fa-user" aria-hidden="true"></i> ';
        authorSpan.appendChild(document.createTextNode(author));
        
        metaDiv.appendChild(dateSpan);
        metaDiv.appendChild(authorSpan);
        
        // Create title
        const titleEl = document.createElement('h2');
        titleEl.className = 'article-card__title';
        titleEl.textContent = title;
        
        // Create excerpt
        const excerptEl = document.createElement('p');
        excerptEl.className = 'article-card__excerpt';
        excerptEl.textContent = excerpt;
        
        // Create CTA link
        const ctaLink = document.createElement('a');
        ctaLink.href = articleLink;
        ctaLink.className = 'btn btn--primary btn--small article-card__cta';
        ctaLink.target = '_blank';
        ctaLink.rel = 'noopener';
        ctaLink.innerHTML = 'Read More <i class="fa-solid fa-arrow-right" aria-hidden="true"></i>';
        
        // Assemble content - order: title, meta, excerpt, CTA
        contentDiv.appendChild(titleEl);
        contentDiv.appendChild(metaDiv);
        contentDiv.appendChild(excerptEl);
        contentDiv.appendChild(ctaLink);
        
        // Assemble card
        card.appendChild(imageDiv);
        card.appendChild(contentDiv);
        
        
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
