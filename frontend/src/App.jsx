import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from '@components/Header';
import Footer from '@components/Footer';
import HomePage from '@pages/Home';
import ArticlesPage from '@pages/Articles';

/**
 * App component - Main application wrapper with routing
 * @returns {JSX.Element}
 */
function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/articles" element={<ArticlesPage />} />
        {/* Fallback route - redirect to home */}
        <Route path="*" element={<HomePage />} />
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;
