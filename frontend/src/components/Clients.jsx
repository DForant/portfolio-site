import { useState, useEffect, useRef, useCallback } from 'react';

const defaultClients = [
  { name: 'Delta Mechanical Seals', image: '/assets/images/delta-mechanical-seals-80.jpg' },
  { name: 'VelQuest', image: '/assets/images/velquest-80.jpg' },
  { name: 'Agfa Healthcare', image: '/assets/images/agfa-healthcare-80.jpg' },
  { name: 'Commonwealth of Massachusetts', image: '/assets/images/commonwealth-of-ma-80.jpg' },
  { name: 'BMI', image: '/assets/images/bmi-80.jpg' },
  { name: 'Flash Global Logistics', image: '/assets/images/flash-global-80.jpg' },
  { name: 'Specialty Commerce Corp', image: '/assets/images/scc-80.jpg' },
];

/**
 * Clients component - Client logo banner with carousel for mobile
 * @param {Object} props
 * @param {string} props.title - Section title
 * @param {Array} props.clients - Array of clients [{name, image}]
 */
function Clients({
  title = "Brands I've Had the Pleasure of Working With",
  clients = defaultClients,
}) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const carouselRef = useRef(null);
  const autoPlaySpeed = 3500;

  const totalSlides = clients.length;

  const goToSlide = useCallback((index) => {
    setCurrentSlide(index);
  }, []);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev < totalSlides - 1 ? prev + 1 : 0));
  }, [totalSlides]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev > 0 ? prev - 1 : totalSlides - 1));
  }, [totalSlides]);

  // Auto-play functionality
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      nextSlide();
    }, autoPlaySpeed);

    return () => clearInterval(interval);
  }, [isPaused, nextSlide]);

  // Touch/swipe handling
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const minSwipeDistance = 50;

  const handleTouchStart = (e) => {
    touchStartX.current = e.changedTouches[0].screenX;
    touchStartY.current = e.changedTouches[0].screenY;
    setIsPaused(true);
  };

  const handleTouchEnd = (e) => {
    const touchEndX = e.changedTouches[0].screenX;
    const touchEndY = e.changedTouches[0].screenY;
    const deltaX = touchEndX - touchStartX.current;
    const deltaY = touchEndY - touchStartY.current;

    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > minSwipeDistance) {
      if (deltaX > 0) {
        prevSlide();
      } else {
        nextSlide();
      }
    }

    setIsPaused(false);
  };

  const handleControlClick = (callback) => {
    setIsPaused(true);
    callback();
    setTimeout(() => setIsPaused(false), 5000);
  };

  return (
    <section id="clients" className="clients" aria-labelledby="clients-title">
      <div className="section__container">
        <h2 id="clients-title" className="section__title">
          {title}
        </h2>

        {/* Desktop Grid Layout */}
        <div className="clients__grid clients__grid--desktop">
          {/* Column 1: Two rows */}
          <div className="clients__column clients__column--double">
            <div className="clients__item">
              <img src={clients[0].image} alt={`${clients[0].name} logo`} />
              <div className="clients__name">
                <strong>{clients[0].name}</strong>
              </div>
            </div>
            <div className="clients__item">
              <img src={clients[1].image} alt={`${clients[1].name} logo`} />
              <div className="clients__name">
                <strong>{clients[1].name}</strong>
              </div>
            </div>
          </div>

          {/* Column 2: Single row */}
          <div className="clients__column clients__column--single">
            <div className="clients__item">
              <img src={clients[2].image} alt={`${clients[2].name} logo`} />
              <div className="clients__name">
                <strong>{clients[2].name}</strong>
              </div>
            </div>
          </div>

          {/* Column 3: Single row (center) */}
          <div className="clients__column clients__column--single clients__column--center">
            <div className="clients__item">
              <img src={clients[3].image} alt={`${clients[3].name} logo`} />
              <div className="clients__name">
                <strong>{clients[3].name}</strong>
              </div>
            </div>
          </div>

          {/* Column 4: Single row */}
          <div className="clients__column clients__column--single">
            <div className="clients__item">
              <img src={clients[4].image} alt={`${clients[4].name} logo`} />
              <div className="clients__name">
                <strong>{clients[4].name}</strong>
              </div>
            </div>
          </div>

          {/* Column 5: Two rows */}
          <div className="clients__column clients__column--double">
            <div className="clients__item">
              <img src={clients[5].image} alt={`${clients[5].name} logo`} />
              <div className="clients__name">
                <strong>{clients[5].name}</strong>
              </div>
            </div>
            <div className="clients__item">
              <img src={clients[6].image} alt={`${clients[6].name} logo`} />
              <div className="clients__name">
                <strong>{clients[6].name}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Carousel */}
        <div className="clients__carousel clients__carousel--mobile">
          <div
            ref={carouselRef}
            className="clients__track"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            {clients.map((client, index) => (
              <div
                key={client.name}
                className={`clients__item${index === currentSlide ? ' clients__item--active' : ''}`}
              >
                <img src={client.image} alt={`${client.name} logo`} />
                <div className="clients__name">
                  <strong>{client.name}</strong>
                </div>
              </div>
            ))}
          </div>

          {/* Carousel Navigation */}
          <div className="clients__nav">
            <button
              className="clients__nav-btn clients__nav-btn--prev"
              aria-label="Previous client"
              onClick={() => handleControlClick(prevSlide)}
            >
              &lt;
            </button>
            <div className="clients__indicators">
              {clients.map((_, index) => (
                <button
                  key={index}
                  className={`clients__indicator${index === currentSlide ? ' clients__indicator--active' : ''}`}
                  data-slide={index}
                  aria-label={`Client ${index + 1}`}
                  onClick={() => handleControlClick(() => goToSlide(index))}
                />
              ))}
            </div>
            <button
              className="clients__nav-btn clients__nav-btn--next"
              aria-label="Next client"
              onClick={() => handleControlClick(nextSlide)}
            >
              &gt;
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Clients;
