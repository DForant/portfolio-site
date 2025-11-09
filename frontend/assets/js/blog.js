/**
 * Blog listing page functionality
 * Fetches and displays WordPress posts via Netlify function
 */

(function() {
    'use strict';

    // Configuration
    const API_BASE = '/api/wordpress';
    const POSTS_PER_PAGE = 9;

    // State
    let currentPage = 1;
    let currentCategory = 'all';
    let isLoading = false;

    // Elements
    const blogGrid = document.getElementById('blog-grid');
    const blogLoading = document.getElementById('blog-loading');
    const blogError = document.getElementById('blog-error');
    const blogErrorMessage = document.getElementById('blog-error-message');
    const blogFilters = document.getElementById('blog-filters');
    const blogPagination = document.getElementById('blog-pagination');
    const pageInfo = document.getElementById('page-info');
    const prevPageBtn = document.getElementById('prev-page');
    const nextPageBtn = document.getElementById('next-page');

    /**
     * Fetch posts from WordPress API
     */
    async function fetchPosts(page = 1, category = 'all') {
        const params = new URLSearchParams({
            action: 'posts',
            page: page,
            per_page: POSTS_PER_PAGE
        });

        if (category && category !== 'all') {
            params.append('category', category);
        }

        const response = await fetch(`${API_BASE}?${params.toString()}`);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();
        
        if (!result.success) {
            throw new Error(result.message || 'Failed to fetch posts');
        }

        return result.data;
    }

    /**
     * Fetch categories from WordPress API
     */
    async function fetchCategories() {
        const response = await fetch(`${API_BASE}?action=categories`);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();
        
        if (!result.success) {
            throw new Error(result.message || 'Failed to fetch categories');
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
     * Strip HTML tags from string
     */
    function stripHtml(html) {
        const tmp = document.createElement('div');
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || '';
    }

    /**
     * Truncate text to specified length
     */
    function truncate(text, length = 150) {
        if (text.length <= length) return text;
        return text.substr(0, length).trim() + '...';
    }

    /**
     * Create post card HTML
     */
    function createPostCard(post) {
        const excerpt = stripHtml(post.excerpt);
        const truncatedExcerpt = truncate(excerpt, 150);

        return `
            <article class="blog-card">
                ${post.featuredImage ? `
                    <a href="/blog/article.html?slug=${post.slug}" class="blog-card__image">
                        <img src="${post.featuredImage}" alt="${post.title}" loading="lazy" />
                    </a>
                ` : ''}
                <div class="blog-card__content">
                    <div class="blog-card__meta">
                        <time class="blog-card__date">${formatDate(post.date)}</time>
                        ${post.categories.length > 0 ? `
                            <span class="blog-card__category">${post.categories[0].name}</span>
                        ` : ''}
                    </div>
                    <h2 class="blog-card__title">
                        <a href="/blog/article.html?slug=${post.slug}">${post.title}</a>
                    </h2>
                    <p class="blog-card__excerpt">${truncatedExcerpt}</p>
                    <div class="blog-card__footer">
                        <span class="blog-card__author">By ${post.author}</span>
                        <a href="/blog/article.html?slug=${post.slug}" class="blog-card__link">
                            Read More <i class="fas fa-arrow-right"></i>
                        </a>
                    </div>
                </div>
            </article>
        `;
    }

    /**
     * Render posts to the grid
     */
    function renderPosts(posts) {
        if (!posts || posts.length === 0) {
            blogGrid.innerHTML = `
                <div class="blog__empty">
                    <i class="fas fa-inbox"></i>
                    <h3>No Articles Found</h3>
                    <p>There are no articles in this category yet. Check back soon!</p>
                </div>
            `;
            return;
        }

        blogGrid.innerHTML = posts.map(post => createPostCard(post)).join('');
    }

    /**
     * Render category filters
     */
    function renderCategories(categories) {
        // Keep the "All Posts" button
        const allButton = blogFilters.querySelector('[data-category="all"]');
        
        // Add category buttons
        categories.forEach(category => {
            if (category.count > 0) {
                const button = document.createElement('button');
                button.className = 'blog__filter-btn';
                button.setAttribute('data-category', category.id);
                button.textContent = category.name;
                blogFilters.appendChild(button);
            }
        });

        // Add click handlers
        blogFilters.addEventListener('click', handleCategoryClick);
    }

    /**
     * Handle category filter click
     */
    function handleCategoryClick(e) {
        const button = e.target.closest('.blog__filter-btn');
        if (!button) return;

        const category = button.getAttribute('data-category');
        
        // Update active state
        blogFilters.querySelectorAll('.blog__filter-btn').forEach(btn => {
            btn.classList.remove('blog__filter-btn--active');
        });
        button.classList.add('blog__filter-btn--active');

        // Update state and load posts
        currentCategory = category;
        currentPage = 1;
        loadPosts();
    }

    /**
     * Update pagination controls
     */
    function updatePagination(posts) {
        pageInfo.textContent = `Page ${currentPage}`;
        
        // Disable prev button on first page
        prevPageBtn.disabled = currentPage === 1;
        
        // Disable next button if we got fewer posts than requested
        nextPageBtn.disabled = posts.length < POSTS_PER_PAGE;
        
        blogPagination.style.display = 'flex';
    }

    /**
     * Handle pagination
     */
    function handlePagination(direction) {
        if (isLoading) return;

        if (direction === 'next' && !nextPageBtn.disabled) {
            currentPage++;
            loadPosts();
        } else if (direction === 'prev' && !prevPageBtn.disabled) {
            currentPage--;
            loadPosts();
        }
    }

    /**
     * Show error message
     */
    function showError(message) {
        blogLoading.style.display = 'none';
        blogGrid.style.display = 'none';
        blogPagination.style.display = 'none';
        blogError.style.display = 'block';
        blogErrorMessage.textContent = message;
    }

    /**
     * Show loading state
     */
    function showLoading() {
        isLoading = true;
        blogLoading.style.display = 'flex';
        blogError.style.display = 'none';
        blogGrid.style.display = 'none';
        blogPagination.style.display = 'none';
    }

    /**
     * Hide loading state
     */
    function hideLoading() {
        isLoading = false;
        blogLoading.style.display = 'none';
        blogGrid.style.display = 'grid';
    }

    /**
     * Load posts
     */
    async function loadPosts() {
        showLoading();

        try {
            const posts = await fetchPosts(currentPage, currentCategory);
            renderPosts(posts);
            updatePagination(posts);
            hideLoading();

            // Scroll to top of posts
            blogGrid.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } catch (error) {
            console.error('Error loading posts:', error);
            showError(error.message || 'Unable to load articles. Please try again later.');
        }
    }

    /**
     * Initialize categories
     */
    async function initCategories() {
        try {
            const categories = await fetchCategories();
            renderCategories(categories);
        } catch (error) {
            console.error('Error loading categories:', error);
            // Non-critical error, just log it
        }
    }

    /**
     * Initialize blog page
     */
    async function init() {
        // Set up pagination event listeners
        prevPageBtn.addEventListener('click', () => handlePagination('prev'));
        nextPageBtn.addEventListener('click', () => handlePagination('next'));

        // Load categories and posts
        await initCategories();
        await loadPosts();
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
