// Articles page JavaScript
document.addEventListener('DOMContentLoaded', () => {
	// State
	let currentPage = 1;
	let totalPages = 1;
	const perPage = 10;
	
	// DOM elements
	const loadingEl = document.getElementById('articles-loading');
	const errorEl = document.getElementById('articles-error');
	const errorMessageEl = document.getElementById('articles-error-message');
	const containerEl = document.getElementById('articles-container');
	const paginationEl = document.getElementById('articles-pagination');
	const prevBtnEl = document.getElementById('pagination-prev');
	const nextBtnEl = document.getElementById('pagination-next');
	const currentPageEl = document.getElementById('current-page');
	const totalPagesEl = document.getElementById('total-pages');
	
	/**
	 * Get API base URL
	 */
	function getApiBaseUrl() {
		// In Netlify, use relative path which will be redirected
		// For local development with Netlify Dev, this works the same
		return '/api/articles';
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
		const div = document.createElement('div');
		div.innerHTML = html;
		return div.textContent || div.innerText || '';
	}
	
	/**
	 * Create article card HTML
	 */
	function createArticleCard(article) {
		const thumbnailUrl = article.thumbnail || 'assets/images/article-placeholder.svg';
		const excerpt = stripHtml(article.excerpt);
		const formattedDate = formatDate(article.date);
		
		return `
			<article class="article-card">
				<div class="article-card__thumbnail">
					<img 
						src="${thumbnailUrl}" 
						alt="${article.title}" 
						onerror="this.src='assets/images/article-placeholder.svg'"
					/>
				</div>
				<div class="article-card__content">
					<h2 class="article-card__title">${article.title}</h2>
					<div class="article-card__meta">
						<span class="article-card__date">
							<i class="far fa-calendar" aria-hidden="true"></i>
							${formattedDate}
						</span>
						<span class="article-card__author">
							<i class="far fa-user" aria-hidden="true"></i>
							${article.author}
						</span>
					</div>
					<p class="article-card__excerpt">${excerpt}</p>
					<a href="${article.link}" class="btn btn--primary article-card__btn" target="_blank" rel="noopener noreferrer">
						Read More
						<i class="fas fa-arrow-right" aria-hidden="true"></i>
					</a>
				</div>
			</article>
		`;
	}
	
	/**
	 * Show loading state
	 */
	function showLoading() {
		loadingEl.style.display = 'flex';
		errorEl.style.display = 'none';
		containerEl.style.display = 'none';
		paginationEl.style.display = 'none';
	}
	
	/**
	 * Show error state
	 */
	function showError(message) {
		loadingEl.style.display = 'none';
		errorEl.style.display = 'flex';
		containerEl.style.display = 'none';
		paginationEl.style.display = 'none';
		errorMessageEl.textContent = message;
	}
	
	/**
	 * Show articles
	 */
	function showArticles() {
		loadingEl.style.display = 'none';
		errorEl.style.display = 'none';
		containerEl.style.display = 'block';
		
		if (totalPages > 1) {
			paginationEl.style.display = 'flex';
		}
	}
	
	/**
	 * Update pagination controls
	 */
	function updatePagination() {
		currentPageEl.textContent = currentPage;
		totalPagesEl.textContent = totalPages;
		
		// Disable/enable buttons
		prevBtnEl.disabled = currentPage <= 1;
		nextBtnEl.disabled = currentPage >= totalPages;
		
		// Update button classes
		prevBtnEl.classList.toggle('articles-pagination__btn--disabled', currentPage <= 1);
		nextBtnEl.classList.toggle('articles-pagination__btn--disabled', currentPage >= totalPages);
	}
	
	/**
	 * Fetch articles from API
	 */
	async function fetchArticles(page = 1) {
		showLoading();
		
		try {
			const apiUrl = `${getApiBaseUrl()}?page=${page}&per_page=${perPage}`;
			
			const response = await fetch(apiUrl, {
				method: 'GET',
				headers: {
					'Accept': 'application/json'
				}
			});
			
			if (!response.ok) {
				const errorData = await response.json().catch(() => ({}));
				throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
			}
			
			const data = await response.json();
			
			if (!data.success || !data.data) {
				throw new Error('Invalid response format from API');
			}
			
			const { articles, pagination } = data.data;
			
			// Update state
			currentPage = pagination.currentPage;
			totalPages = pagination.totalPages;
			
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
			updatePagination();
			showArticles();
			
			// Scroll to top of articles section
			const articlesMain = document.getElementById('articles-main');
			if (articlesMain) {
				articlesMain.scrollIntoView({ behavior: 'smooth', block: 'start' });
			}
			
		} catch (error) {
			console.error('Error fetching articles:', error);
			showError(error.message || 'Failed to load articles. Please try again later.');
		}
	}
	
	/**
	 * Render articles to DOM
	 */
	function renderArticles(articles) {
		containerEl.innerHTML = articles.map(createArticleCard).join('');
	}
	
	/**
	 * Event listeners for pagination
	 */
	if (prevBtnEl) {
		prevBtnEl.addEventListener('click', () => {
			if (currentPage > 1) {
				fetchArticles(currentPage - 1);
			}
		});
	}
	
	if (nextBtnEl) {
		nextBtnEl.addEventListener('click', () => {
			if (currentPage < totalPages) {
				fetchArticles(currentPage + 1);
			}
		});
	}
	
	// Initial load
	fetchArticles(1);
});
