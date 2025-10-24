// Articles listing page JavaScript
document.addEventListener('DOMContentLoaded', () => {
	// Initialize variables
	let currentPage = 1;
	let totalPages = 1;
	const articlesPerPage = CONFIG.pagination.articlesPerPage;
	const apiBase = CONFIG.api.wordpress.baseUrl;
	
	// DOM elements
	const articlesContainer = document.getElementById('articles-container');
	const paginationContainer = document.getElementById('pagination-container');
	const loadingIndicator = document.getElementById('loading-indicator');
	const errorMessage = document.getElementById('error-message');
	
	// Fetch articles from the API
	async function fetchArticles(page = 1) {
		try {
			showLoading();
			hideError();
			
			const response = await fetch(
				`${apiBase}${CONFIG.api.wordpress.endpoints.articles}?per_page=${articlesPerPage}&page=${page}&_embed`
			);
			
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}
			
			// Get total pages from response headers
			totalPages = parseInt(response.headers.get('X-WP-TotalPages') || 1);
			currentPage = page;
			
			const articles = await response.json();
			
			hideLoading();
			renderArticles(articles);
			renderPagination();
			
			// Scroll to top of articles section
			window.scrollTo({ top: 0, behavior: 'smooth' });
			
		} catch (error) {
			console.error('Error fetching articles:', error);
			hideLoading();
			showError('Failed to load articles. Please try again later.');
		}
	}
	
	// Render articles to the page
	function renderArticles(articles) {
		if (!articles || articles.length === 0) {
			articlesContainer.innerHTML = '<p class="articles__empty">No articles found.</p>';
			return;
		}
		
		// Clear container
		articlesContainer.innerHTML = '';
		
		articles.forEach(article => {
			const thumbnail = getArticleThumbnail(article);
			const title = escapeHtml(article.title.rendered);
			const excerpt = escapeHtml(article.excerpt.rendered.replace(/<\/?[^>]+(>|$)/g, '')); // Strip HTML tags and escape
			const date = escapeHtml(formatDate(article.date));
			const author = escapeHtml(getAuthorName(article));
			const link = sanitizeUrl(article.link);
			
			// Create article card element
			const articleCard = document.createElement('article');
			articleCard.className = 'article-card';
			
			// Create image container
			const imageDiv = document.createElement('div');
			imageDiv.className = 'article-card__image';
			const img = document.createElement('img');
			img.src = sanitizeUrl(thumbnail);
			img.alt = title;
			img.loading = 'lazy';
			imageDiv.appendChild(img);
			
			// Create content container
			const contentDiv = document.createElement('div');
			contentDiv.className = 'article-card__content';
			
			// Create title
			const titleH2 = document.createElement('h2');
			titleH2.className = 'article-card__title';
			titleH2.textContent = title;
			
			// Create meta container
			const metaDiv = document.createElement('div');
			metaDiv.className = 'article-card__meta';
			
			const dateSpan = document.createElement('span');
			dateSpan.className = 'article-card__date';
			dateSpan.innerHTML = '<i class="far fa-calendar"></i> ';
			dateSpan.appendChild(document.createTextNode(date));
			
			const authorSpan = document.createElement('span');
			authorSpan.className = 'article-card__author';
			authorSpan.innerHTML = '<i class="far fa-user"></i> ';
			authorSpan.appendChild(document.createTextNode(author));
			
			metaDiv.appendChild(dateSpan);
			metaDiv.appendChild(authorSpan);
			
			// Create excerpt
			const excerptDiv = document.createElement('div');
			excerptDiv.className = 'article-card__excerpt';
			excerptDiv.textContent = excerpt;
			
			// Create button
			const btn = document.createElement('a');
			btn.href = link;
			btn.className = 'btn btn--primary article-card__btn';
			btn.textContent = 'Read More';
			
			// Assemble content
			contentDiv.appendChild(titleH2);
			contentDiv.appendChild(metaDiv);
			contentDiv.appendChild(excerptDiv);
			contentDiv.appendChild(btn);
			
			// Assemble article card
			articleCard.appendChild(imageDiv);
			articleCard.appendChild(contentDiv);
			
			// Add to container
			articlesContainer.appendChild(articleCard);
		});
	}
	
	// Escape HTML to prevent XSS
	function escapeHtml(text) {
		const div = document.createElement('div');
		div.textContent = text;
		return div.innerHTML;
	}
	
	// Sanitize URL to prevent XSS
	function sanitizeUrl(url) {
		// Only allow http and https protocols
		try {
			const urlObj = new URL(url);
			if (urlObj.protocol === 'http:' || urlObj.protocol === 'https:') {
				return url;
			}
		} catch (e) {
			// Invalid URL
		}
		return '#'; // Return safe fallback
	}
	
	// Get article thumbnail or placeholder
	function getArticleThumbnail(article) {
		if (article._embedded && article._embedded['wp:featuredmedia'] && article._embedded['wp:featuredmedia'][0]) {
			return article._embedded['wp:featuredmedia'][0].source_url;
		}
		return CONFIG.placeholderImage;
	}
	
	// Get author name from embedded data
	function getAuthorName(article) {
		if (article._embedded && article._embedded.author && article._embedded.author[0]) {
			return article._embedded.author[0].name;
		}
		return 'Unknown Author';
	}
	
	// Format date to readable format
	function formatDate(dateString) {
		const date = new Date(dateString);
		const options = { year: 'numeric', month: 'long', day: 'numeric' };
		return date.toLocaleDateString('en-US', options);
	}
	
	// Render pagination controls
	function renderPagination() {
		if (totalPages <= 1) {
			paginationContainer.innerHTML = '';
			return;
		}
		
		let paginationHTML = '<nav class="pagination" aria-label="Article pagination">';
		paginationHTML += '<ul class="pagination__list">';
		
		// Previous button
		if (currentPage > 1) {
			paginationHTML += `
				<li class="pagination__item">
					<button class="pagination__btn pagination__btn--prev" data-page="${currentPage - 1}" aria-label="Previous page">
						<i class="fas fa-chevron-left"></i> Previous
					</button>
				</li>
			`;
		}
		
		// Page numbers
		const pageNumbers = getPageNumbers();
		pageNumbers.forEach(pageNum => {
			if (pageNum === '...') {
				paginationHTML += `
					<li class="pagination__item">
						<span class="pagination__ellipsis">...</span>
					</li>
				`;
			} else {
				const isActive = pageNum === currentPage ? 'pagination__btn--active' : '';
				paginationHTML += `
					<li class="pagination__item">
						<button class="pagination__btn ${isActive}" data-page="${pageNum}" aria-label="Page ${pageNum}" ${pageNum === currentPage ? 'aria-current="page"' : ''}>
							${pageNum}
						</button>
					</li>
				`;
			}
		});
		
		// Next button
		if (currentPage < totalPages) {
			paginationHTML += `
				<li class="pagination__item">
					<button class="pagination__btn pagination__btn--next" data-page="${currentPage + 1}" aria-label="Next page">
						Next <i class="fas fa-chevron-right"></i>
					</button>
				</li>
			`;
		}
		
		paginationHTML += '</ul>';
		paginationHTML += '</nav>';
		
		paginationContainer.innerHTML = paginationHTML;
		
		// Add event listeners to pagination buttons
		const paginationButtons = paginationContainer.querySelectorAll('.pagination__btn');
		paginationButtons.forEach(btn => {
			btn.addEventListener('click', () => {
				const page = parseInt(btn.dataset.page);
				if (page && page !== currentPage) {
					fetchArticles(page);
				}
			});
		});
	}
	
	// Calculate which page numbers to display
	function getPageNumbers() {
		const pages = [];
		const maxVisible = 5; // Maximum number of page buttons to show
		
		if (totalPages <= maxVisible) {
			// Show all pages if total is less than max
			for (let i = 1; i <= totalPages; i++) {
				pages.push(i);
			}
		} else {
			// Always show first page
			pages.push(1);
			
			// Calculate range around current page
			let start = Math.max(2, currentPage - 1);
			let end = Math.min(totalPages - 1, currentPage + 1);
			
			// Add ellipsis after first page if needed
			if (start > 2) {
				pages.push('...');
			}
			
			// Add pages around current page
			for (let i = start; i <= end; i++) {
				pages.push(i);
			}
			
			// Add ellipsis before last page if needed
			if (end < totalPages - 1) {
				pages.push('...');
			}
			
			// Always show last page
			pages.push(totalPages);
		}
		
		return pages;
	}
	
	// Show loading indicator
	function showLoading() {
		if (loadingIndicator) {
			loadingIndicator.style.display = 'block';
		}
		if (articlesContainer) {
			articlesContainer.style.opacity = '0.5';
		}
	}
	
	// Hide loading indicator
	function hideLoading() {
		if (loadingIndicator) {
			loadingIndicator.style.display = 'none';
		}
		if (articlesContainer) {
			articlesContainer.style.opacity = '1';
		}
	}
	
	// Show error message
	function showError(message) {
		if (errorMessage) {
			errorMessage.textContent = message;
			errorMessage.style.display = 'block';
		}
	}
	
	// Hide error message
	function hideError() {
		if (errorMessage) {
			errorMessage.style.display = 'none';
		}
	}
	
	// Initialize - load first page of articles
	fetchArticles(1);
	
	// Mobile nav toggle (same as main site)
	const header = document.querySelector('.header');
	const toggle = document.querySelector('.header__toggle');
	const nav = document.getElementById('header-nav');
	
	if (toggle && header && nav) {
		toggle.addEventListener('click', () => {
			const isOpen = header.classList.toggle('header--menu-open');
			toggle.setAttribute('aria-expanded', String(isOpen));
		});
		
		// Close menu when clicking nav links
		nav.querySelectorAll('.header__nav-link').forEach(link => {
			link.addEventListener('click', () => {
				if (header.classList.contains('header--menu-open')) {
					header.classList.remove('header--menu-open');
					toggle.setAttribute('aria-expanded', 'false');
				}
			});
		});
		
		// Close menu when clicking outside
		document.addEventListener('click', (e) => {
			if (!header.contains(e.target) && header.classList.contains('header--menu-open')) {
				header.classList.remove('header--menu-open');
				toggle.setAttribute('aria-expanded', 'false');
			}
		});
	}
	
	// Set current year in footer
	const yearSpan = document.getElementById('year');
	if (yearSpan) {
		yearSpan.textContent = new Date().getFullYear();
	}
});
