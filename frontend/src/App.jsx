import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import ArticlesPage from './pages/ArticlesPage';
import '../assets/sass/main.scss';

function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/articles.html" element={<ArticlesPage />} />
        <Route path="/articles" element={<ArticlesPage />} />
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;
