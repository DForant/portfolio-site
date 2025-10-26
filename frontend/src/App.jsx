import React, { useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import HomePage from './pages/HomePage'
import ArticlesPage from './pages/ArticlesPage'

function App() {
  const location = useLocation()

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [location.pathname])

  // Set current year in footer (mimicking the original script)
  useEffect(() => {
    const yearElement = document.getElementById('year')
    if (yearElement) {
      yearElement.textContent = new Date().getFullYear()
    }
  }, [location.pathname])

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/articles" element={<ArticlesPage />} />
      <Route path="/articles.html" element={<ArticlesPage />} />
    </Routes>
  )
}

export default App
