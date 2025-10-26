import React, { useState, useEffect } from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'

function ArticlesPage() {
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    hasPrevPage: false,
    hasNextPage: false
  })

  const API_ENDPOINT = '/api/articles'
  const PER_PAGE = 10

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const options = { year: 'numeric', month: 'long', day: 'numeric' }
    return date.toLocaleDateString('en-US', options)
  }

  const stripHtml = (html) => {
    const tmp = document.createElement('div')
    tmp.innerHTML = html
    return tmp.textContent || tmp.innerText || ''
  }

  const fetchArticles = async (page = 1) => {
    setLoading(true)
    setError(null)

    try {
      const url = `${API_ENDPOINT}?page=${page}&per_page=${PER_PAGE}`
      let response = await fetch(url)

      // Fallback to direct functions path if redirect/route not present
      if (response.status === 404) {
        const fnUrl = `/.netlify/functions/articles?page=${page}&per_page=${PER_PAGE}`
        try {
          response = await fetch(fnUrl)
        } catch (_) {
          // ignore, will be handled below
        }
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.message || 'Failed to fetch articles')
      }

      setArticles(result.data || [])
      setPagination(result.pagination)
      setCurrentPage(result.pagination.page)
    } catch (err) {
      console.error('Error fetching articles:', err)
      setError(err.message || 'Failed to load articles. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Get page number from URL if present
    const urlParams = new URLSearchParams(window.location.search)
    const pageParam = parseInt(urlParams.get('page'), 10)
    const initialPage = pageParam && pageParam > 0 ? pageParam : 1

    fetchArticles(initialPage)
  }, [])

  const handlePrevPage = () => {
    if (pagination.hasPrevPage) {
      fetchArticles(currentPage - 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleNextPage = () => {
    if (pagination.hasNextPage) {
      fetchArticles(currentPage + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  return (
    <>
      <Header />
      <main>
        {/* Articles Header */}
        <section className="articles-header" aria-labelledby="articles-title">
          <div className="section__container">
            <h1 id="articles-title" className="articles-header__title">Articles & Insights</h1>
            <p className="articles-header__subtitle">Explore my thoughts on design, branding, and web development</p>
          </div>
        </section>

        {/* Articles List */}
        <section className="articles-list" aria-labelledby="articles-title">
          <div className="section__container">
            {/* Loading State */}
            {loading && (
              <div className="articles-list__loading">
                <i className="fas fa-spinner fa-spin" aria-hidden="true"></i>
                <p>Loading articles...</p>
              </div>
            )}

            {/* Error State */}
            {error && !loading && (
              <div className="articles-list__error">
                <i className="fas fa-exclamation-triangle" aria-hidden="true"></i>
                <p>{error}</p>
              </div>
            )}

            {/* Empty State */}
            {!loading && !error && articles.length === 0 && (
              <div className="articles-list__empty">
                <i className="fas fa-inbox" aria-hidden="true"></i>
                <p>No articles found.</p>
              </div>
            )}

            {/* Articles Grid */}
            {!loading && !error && articles.length > 0 && (
              <>
                <div className="articles-list__grid">
                  {articles.map((article, index) => {
                    const thumbnailUrl = article.featured_image_url || '/images/placeholder-article.jpg'
                    const title = stripHtml(article.title)
                    const excerpt = stripHtml(article.excerpt)
                    const date = formatDate(article.date)
                    const author = article.author_name

                    return (
                      <article key={index} className="article-card">
                        <div className="article-card__image">
                          <img 
                            src={thumbnailUrl} 
                            alt={title} 
                            onError={(e) => { e.target.src = '/images/placeholder-article.jpg' }}
                          />
                        </div>
                        <div className="article-card__content">
                          <h2 className="article-card__title">{title}</h2>
                          <div className="article-card__meta">
                            <span className="article-card__date">
                              <i className="far fa-calendar" aria-hidden="true"></i>
                              {date}
                            </span>
                            <span className="article-card__author">
                              <i className="far fa-user" aria-hidden="true"></i>
                              {author}
                            </span>
                          </div>
                          <div className="article-card__excerpt">{excerpt}</div>
                          <a 
                            href={article.link} 
                            className="btn btn--secondary article-card__btn" 
                            target="_blank" 
                            rel="noopener noreferrer"
                          >
                            Read More
                            <i className="fas fa-arrow-right" aria-hidden="true"></i>
                          </a>
                        </div>
                      </article>
                    )
                  })}
                </div>

                {/* Pagination */}
                <nav className="articles-pagination" aria-label="Articles pagination">
                  <button 
                    className={`articles-pagination__btn articles-pagination__btn--prev ${!pagination.hasPrevPage ? 'articles-pagination__btn--disabled' : ''}`}
                    onClick={handlePrevPage}
                    disabled={!pagination.hasPrevPage}
                    aria-label="Previous page"
                  >
                    <i className="fas fa-chevron-left" aria-hidden="true"></i>
                    Previous
                  </button>
                  <div className="articles-pagination__info">
                    Page <span>{currentPage}</span> of <span>{pagination.totalPages}</span>
                  </div>
                  <button 
                    className={`articles-pagination__btn articles-pagination__btn--next ${!pagination.hasNextPage ? 'articles-pagination__btn--disabled' : ''}`}
                    onClick={handleNextPage}
                    disabled={!pagination.hasNextPage}
                    aria-label="Next page"
                  >
                    Next
                    <i className="fas fa-chevron-right" aria-hidden="true"></i>
                  </button>
                </nav>
              </>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}

export default ArticlesPage
