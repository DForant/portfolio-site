// Single Article page JavaScript
// Handles fetching and displaying a single article from the WordPress API

(function() {
    'use strict';

    // Configuration
    const API_ENDPOINT = '/api/article';

    // DOM Elements
    const elements = {
        loading: document.getElementById('article-loading'),
        error: document.getElementById('article-error'),
        errorMessage: document.getElementById('error-message'),
        content: document.getElementById('article-content'),
        title: document.getElementById('article-title'),
        date: document.getElementById('article-date'),
        author: document.getElementById('article-author'),
        readingTime: document.getElementById('article-reading-time'),
        readingTimeContainer: document.getElementById('reading-time-container'),
        difficulty: document.getElementById('article-difficulty'),
        difficultyContainer: document.getElementById('difficulty-container'),
        featuredImage: document.getElementById('article-featured-image'),
        featuredImageContainer: document.getElementById('featured-image-container'),
        bodyContent: document.getElementById('article-body-content'),
        breadcrumbTitle: document.getElementById('breadcrumb-title'),
        demoLink: document.getElementById('demo-link'),
        sourceLink: document.getElementById('source-link'),
        articleLinks: document.getElementById('article-links'),
        // Meta tags
        pageTitle: document.getElementById('page-title'),
        metaDescription: document.getElementById('meta-description'),
        ogTitle: document.getElementById('og-title'),
        ogDescription: document.getElementById('og-description'),
        ogImage: document.getElementById('og-image'),
        ogUrl: document.getElementById('og-url')
    };

    /**
     * Show a specific state and hide others
     */
    function showState(state) {
        elements.loading.style.display = state === 'loading' ? 'block' : 'none';
        elements.error.style.display = state === 'error' ? 'block' : 'none';
        elements.content.style.display = state === 'success' ? 'block' : 'none';
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
     * Update page meta tags for SEO and social sharing
     */
    function updateMetaTags(article) {
        const title = stripHtml(article.title);
        const description = article.seo_meta_description || stripHtml(article.excerpt);
        const ogImageUrl = article.og_image_url || article.featured_image_url || '';
        const url = window.location.href;

        // Update title
        if (elements.pageTitle) {
            elements.pageTitle.textContent = `${title} - Dean Forant Brand & Web Design`;
        }

        // Update meta description
        if (elements.metaDescription) {
            elements.metaDescription.setAttribute('content', description);
        }

        // Update OG tags
        if (elements.ogTitle) {
            elements.ogTitle.setAttribute('content', title);
        }
        if (elements.ogDescription) {
            elements.ogDescription.setAttribute('content', description);
        }
        if (elements.ogImage && ogImageUrl) {
            elements.ogImage.setAttribute('content', ogImageUrl);
        }
        if (elements.ogUrl) {
            elements.ogUrl.setAttribute('content', url);
        }
    }

    /**
     * Render article content
     */
    function renderArticle(article) {
        // Update title
        const title = stripHtml(article.title);
        elements.title.textContent = title;
        elements.breadcrumbTitle.textContent = title;

        // Update meta information
        elements.date.textContent = formatDate(article.date);
        elements.author.textContent = article.author_name;

        // Update reading time if available
        if (article.reading_time) {
            elements.readingTime.textContent = article.reading_time;
            elements.readingTimeContainer.style.display = 'flex';
        }

        // Update difficulty if available
        if (article.difficulty) {
            elements.difficulty.textContent = article.difficulty;
            elements.difficultyContainer.style.display = 'flex';
        }

        // Update featured image if available
        if (article.featured_image_url) {
            elements.featuredImage.src = article.featured_image_url;
            elements.featuredImage.alt = title;
            elements.featuredImageContainer.style.display = 'block';
        }

        // Update article body content
        elements.bodyContent.innerHTML = article.content;

        // Update demo and source code links
        let hasLinks = false;
        if (article.demo_url) {
            elements.demoLink.href = article.demo_url;
            elements.demoLink.style.display = 'inline-flex';
            hasLinks = true;
        }
        if (article.source_code_url) {
            elements.sourceLink.href = article.source_code_url;
            elements.sourceLink.style.display = 'inline-flex';
            hasLinks = true;
        }
        if (hasLinks) {
            elements.articleLinks.style.display = 'block';
        }

        // Update meta tags
        updateMetaTags(article);
    }

    /**
     * Get article slug or ID from URL
     */
    function getArticleIdentifier() {
        const urlParams = new URLSearchParams(window.location.search);
        const slug = urlParams.get('slug');
        const id = urlParams.get('id');
        
        return { slug, id };
    }

    /**
     * Fetch article from API
     */
    async function fetchArticle() {
        showState('loading');

        const { slug, id } = getArticleIdentifier();

        // Check if we have a slug or id
        if (!slug && !id) {
            elements.errorMessage.textContent = 'No article identifier provided in the URL.';
            showState('error');
            return;
        }

        try {
            // Build URL with appropriate parameter
            const params = new URLSearchParams();
            if (slug) {
                params.append('slug', slug);
            } else if (id) {
                params.append('id', id);
            }

            let url = `${API_ENDPOINT}?${params.toString()}`;
            let response = await fetch(url);

            // Fallback to direct functions path if redirect/route not present
            if (response.status === 404) {
                const fnUrl = `/.netlify/functions/article?${params.toString()}`;
                try {
                    response = await fetch(fnUrl);
                } catch (_) {
                    // ignore, will be handled below
                }
            }

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

            if (!result.data) {
                throw new Error('Article not found');
            }

            renderArticle(result.data);
            showState('success');
        } catch (error) {
            console.error('Error fetching article:', error);
            elements.errorMessage.textContent = error.message || 'Failed to load article. Please try again later.';
            showState('error');
        }
    }

    /**
     * Initialize the article page
     */
    function init() {
        // Check if we're on the article page
        if (!elements.content) return;

        // Fetch article
        fetchArticle();
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
