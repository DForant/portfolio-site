import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';

const API_ENDPOINT = '/api/article';

function SingleArticlePage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [state, setState] = useState({
    loading: true,
    error: null,
    article: null
  });

  useEffect(() => {
    if (slug) {
      fetchArticle(slug);
    }
  }, [slug]);

  const fetchArticle = async (articleSlug) => {
    setState({ loading: true, error: null, article: null });

    try {
      const url = `${API_ENDPOINT}?slug=${articleSlug}`;
      let response = await fetch(url);

      // Fallback to direct functions path if redirect/route not present
      if (response.status === 404) {
        const fnUrl = `/.netlify/functions/article?slug=${articleSlug}`;
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

      setState({
        loading: false,
        error: null,
        article: result.data
      });

      // Update page title and meta tags
      if (result.data.title) {
        document.title = `${stripHtml(result.data.title)} - Dean Forant Brand & Web Design`;
      }

      // Update meta description if available
      if (result.data.acf?.seo_meta_description) {
        updateMetaTag('description', result.data.acf.seo_meta_description);
      }

      // Update OG image if available
      if (result.data.acf?.og_image_url) {
        updateMetaTag('og:image', result.data.acf.og_image_url, 'property');
      } else if (result.data.featured_image_url) {
        updateMetaTag('og:image', result.data.featured_image_url, 'property');
      }

      // Update OG title
      if (result.data.title) {
        updateMetaTag('og:title', stripHtml(result.data.title), 'property');
      }

      // Update OG type
      updateMetaTag('og:type', 'article', 'property');

    } catch (error) {
      console.error('Error fetching article:', error);
      setState({
        loading: false,
        error: error.message || 'Failed to load article. Please try again later.',
        article: null
      });
    }
  };

  const updateMetaTag = (name, content, attribute = 'name') => {
    let element = document.querySelector(`meta[${attribute}="${name}"]`);
    if (!element) {
      element = document.createElement('meta');
      element.setAttribute(attribute, name);
      document.head.appendChild(element);
    }
    element.setAttribute('content', content);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  const stripHtml = (html) => {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  const getDifficultyBadge = (difficulty) => {
    if (!difficulty) return null;
    
    const difficultyLower = difficulty.toLowerCase();
    let badgeClass = 'article-header__badge article-header__badge--difficulty';
    
    if (difficultyLower.includes('beginner')) {
      badgeClass += ' article-header__badge--difficulty-beginner';
    } else if (difficultyLower.includes('intermediate')) {
      badgeClass += ' article-header__badge--difficulty-intermediate';
    } else if (difficultyLower.includes('advanced')) {
      badgeClass += ' article-header__badge--difficulty-advanced';
    }

    return (
      <span className={badgeClass}>
        <i className="fas fa-signal" aria-hidden="true"></i>
        {difficulty}
      </span>
    );
  };

  if (state.loading) {
    return (
      <main>
        <section className="article-loading">
          <i className="fas fa-spinner fa-spin" aria-hidden="true"></i>
          <p>Loading article...</p>
        </section>
      </main>
    );
  }

  if (state.error) {
    return (
      <main>
        <section className="article-error">
          <i className="fas fa-exclamation-triangle" aria-hidden="true"></i>
          <p>{state.error}</p>
          <Link to="/articles" className="btn btn--primary">
            <i className="fas fa-arrow-left" aria-hidden="true"></i>
            Back to Articles
          </Link>
        </section>
      </main>
    );
  }

  const article = state.article;
  if (!article) return null;

  const title = stripHtml(article.title);
  const date = formatDate(article.date);
  const author = article.author_name;

  return (
    <main>
      {/* Article Header */}
      <section className="article-header">
        <div className="section__container">
          <h1 className="article-header__title">{title}</h1>
          
          <div className="article-header__meta">
            <span>
              <i className="far fa-calendar" aria-hidden="true"></i>
              {date}
            </span>
            <span>
              <i className="far fa-user" aria-hidden="true"></i>
              {author}
            </span>
            {article.acf?.reading_time && (
              <span>
                <i className="far fa-clock" aria-hidden="true"></i>
                {article.acf.reading_time} min read
              </span>
            )}
          </div>

          {(article.acf?.difficulty || article.acf?.demo_url || article.acf?.source_code_url) && (
            <div className="article-header__badges">
              {article.acf?.difficulty && getDifficultyBadge(article.acf.difficulty)}
              {article.acf?.demo_url && (
                <a 
                  href={article.acf.demo_url} 
                  className="article-header__badge"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <i className="fas fa-external-link-alt" aria-hidden="true"></i>
                  View Demo
                </a>
              )}
              {article.acf?.source_code_url && (
                <a 
                  href={article.acf.source_code_url} 
                  className="article-header__badge"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <i className="fab fa-github" aria-hidden="true"></i>
                  Source Code
                </a>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Article Content */}
      <section className="article-content">
        <div className="section__container">
          <Link to="/articles" className="article-content__back-link">
            <i className="fas fa-arrow-left" aria-hidden="true"></i>
            Back to Articles
          </Link>

          {article.featured_image_url && (
            <div className="article-content__featured-image">
              <img src={article.featured_image_url} alt={title} />
            </div>
          )}

          <div 
            className="article-content__body"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />

          {(article.acf?.demo_url || article.acf?.source_code_url) && (
            <div className="article-content__actions">
              {article.acf?.demo_url && (
                <a 
                  href={article.acf.demo_url} 
                  className="btn btn--primary"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <i className="fas fa-external-link-alt" aria-hidden="true"></i>
                  View Demo
                </a>
              )}
              {article.acf?.source_code_url && (
                <a 
                  href={article.acf.source_code_url} 
                  className="btn btn--secondary"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <i className="fab fa-github" aria-hidden="true"></i>
                  View Source Code
                </a>
              )}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

export default SingleArticlePage;
