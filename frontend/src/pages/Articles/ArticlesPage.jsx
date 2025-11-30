import { useState, useEffect, useCallback } from 'react';

// Configuration constants
const PLACEHOLDER_IMAGE = '/assets/images/article-placeholder.svg';
const NETLIFY_DEV_PORTS = ['8888', '8889'];
const MAX_EXCERPT_LENGTH = 200;

/**
 * Escape HTML to prevent XSS
 * @param {string} str
 * @returns {string}
 */
const escapeHtml = (str) => {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
};

/**
 * Validate and sanitize URL
 * @param {string} url
 * @returns {string}
 */
const sanitizeUrl = (url) => {
  if (!url) return '#';
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return '#';
    }
    return parsed.href;
  } catch {
    return '#';
  }
};

/**
 * Get API endpoint based on environment
 * @returns {string}
 */
const getApiEndpoint = () => {
  const host = window.location.hostname;
  const port = window.location.port;

  if ((host === 'localhost' || host === '127.0.0.1') && port && !NETLIFY_DEV_PORTS.includes(port)) {
    return 'http://localhost:4000/api/articles';
  }

  return '/api/articles';
};

/**
 * Format date for display
 * @param {string} dateString
 * @returns {string}
 */
const formatDate = (dateString) => {
  if (!dateString) return '';

  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return '';
  }
};

/**
 * Strip HTML tags and decode entities from text
 * @param {string} html
 * @returns {string}
 */
const sanitizeExcerpt = (html) => {
  if (!html) return '';

  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    let text = doc.body.textContent || '';
    text = text.trim().replace(/\s+/g, ' ');

    if (text.length > MAX_EXCERPT_LENGTH) {
      text = text.substring(0, MAX_EXCERPT_LENGTH).trim() + '...';
    }

    return text;
  } catch {
    return '';
  }
};

/**
 * Sanitize title from WordPress API
 * @param {string} html
 * @returns {string}
 */
const sanitizeTitle = (html) => {
  if (!html) return 'Untitled';

  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    return doc.body.textContent || 'Untitled';
  } catch {
    return 'Untitled';
  }
};

/**
 * Article card component
 * @param {Object} props
 * @param {Object} props.article
 * @returns {JSX.Element}
 */
function ArticleCard({ article }) {
  const title = sanitizeTitle(article.title);
  const excerpt = sanitizeExcerpt(article.excerpt);
  const date = formatDate(article.date);
  const author = escapeHtml(article.author || 'Unknown');
  const thumbnail = sanitizeUrl(article.thumbnail) || PLACEHOLDER_IMAGE;
  const articleLink = sanitizeUrl(article.link);

  const handleImageError = (e) => {
    e.target.onerror = null;
    e.target.src = PLACEHOLDER_IMAGE;
  };

  return (
    <article className="article-card">
      <div className="article-card__image">
        <img
          src={thumbnail}
          alt={title}
          loading="lazy"
          onError={handleImageError}
        />
      </div>
      <div className="article-card__content">
        <div className="article-card__meta">
          <span className="article-card__date">
            <i className="fa-regular fa-calendar" aria-hidden="true"></i> {date}
          </span>
          <span className="article-card__author">
            <i className="fa-regular fa-user" aria-hidden="true"></i> {author}
          </span>
        </div>
        <h2 className="article-card__title">{title}</h2>
        <p className="article-card__excerpt">{excerpt}</p>
        <a
          href={articleLink}
          className="btn btn--primary btn--small article-card__cta"
          target="_blank"
          rel="noopener noreferrer"
        >
          Read More <i className="fa-solid fa-arrow-right" aria-hidden="true"></i>
        </a>
      </div>
    </article>
  );
}

/**
 * ArticlesPage component - Articles listing page
 * @returns {JSX.Element}
 */
function ArticlesPage() {
  const [articles, setArticles] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEmpty, setIsEmpty] = useState(false);

  const fetchArticles = useCallback(async (page = 1) => {
    setIsLoading(true);
    setError(null);
    setIsEmpty(false);

    try {
      const endpoint = getApiEndpoint();
      const url = `${endpoint}?page=${page}&per_page=10`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          setIsEmpty(true);
          return;
        }
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch articles');
      }

      const fetchedArticles = data.articles || [];
      const pagination = data.pagination || {};

      if (fetchedArticles.length === 0) {
        setIsEmpty(true);
        return;
      }

      setArticles(fetchedArticles);
      setCurrentPage(pagination.currentPage || page);
      setTotalPages(pagination.totalPages || 1);

      if (page > 1) {
        const articlesSection = document.querySelector('.articles');
        if (articlesSection) {
          articlesSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    } catch (err) {
      console.error('Error fetching articles:', err);
      setError("We couldn't fetch the articles at this time. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchArticles(1);
  }, [fetchArticles]);

  const handlePrev = useCallback(() => {
    if (currentPage > 1) {
      fetchArticles(currentPage - 1);
    }
  }, [currentPage, fetchArticles]);

  const handleNext = useCallback(() => {
    if (currentPage < totalPages) {
      fetchArticles(currentPage + 1);
    }
  }, [currentPage, totalPages, fetchArticles]);

  const handleRetry = useCallback(() => {
    fetchArticles(currentPage);
  }, [currentPage, fetchArticles]);

  return (
    <main id="articles-page">
      {/* Articles Hero */}
      <section className="articles-hero" aria-label="Articles Hero">
        <div className="section__container">
          <h1 className="articles-hero__title">Articles</h1>
          <p className="articles-hero__subtitle">
            Insights, tips, and stories from the world of brand and web design.
          </p>
        </div>
      </section>

      {/* Articles List */}
      <section className="articles" aria-labelledby="articles-title">
        <div className="section__container">
          {/* Loading State */}
          {isLoading && (
            <div id="articles-loading" className="articles__loading">
              <div className="articles__spinner"></div>
              <p>Loading articles...</p>
            </div>
          )}

          {/* Error State */}
          {error && !isLoading && (
            <div id="articles-error" className="articles__error">
              <i className="fa-solid fa-exclamation-circle" aria-hidden="true"></i>
              <h2>Unable to Load Articles</h2>
              <p id="articles-error-message">{error}</p>
              <button
                id="articles-retry"
                className="btn btn--primary"
                onClick={handleRetry}
              >
                Try Again
              </button>
            </div>
          )}

          {/* Empty State */}
          {isEmpty && !isLoading && !error && (
            <div id="articles-empty" className="articles__empty">
              <i className="fa-solid fa-newspaper" aria-hidden="true"></i>
              <h2>No Articles Yet</h2>
              <p>Check back soon for new content!</p>
            </div>
          )}

          {/* Articles List Container */}
          {!isLoading && !error && !isEmpty && articles.length > 0 && (
            <>
              <div id="articles-list" className="articles__list">
                {articles.map((article) => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <nav
                  id="articles-pagination"
                  className="articles__pagination"
                  aria-label="Articles pagination"
                >
                  <button
                    id="pagination-prev"
                    className="articles__pagination-btn articles__pagination-btn--prev"
                    disabled={currentPage <= 1}
                    onClick={handlePrev}
                  >
                    <i className="fa-solid fa-chevron-left" aria-hidden="true"></i>
                    <span>Previous</span>
                  </button>
                  <div id="pagination-info" className="articles__pagination-info">
                    Page <span id="pagination-current">{currentPage}</span> of{' '}
                    <span id="pagination-total">{totalPages}</span>
                  </div>
                  <button
                    id="pagination-next"
                    className="articles__pagination-btn articles__pagination-btn--next"
                    disabled={currentPage >= totalPages}
                    onClick={handleNext}
                  >
                    <span>Next</span>
                    <i className="fa-solid fa-chevron-right" aria-hidden="true"></i>
                  </button>
                </nav>
              )}
            </>
          )}
        </div>
      </section>
    </main>
  );
}

export default ArticlesPage;
