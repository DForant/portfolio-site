import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Client data configuration
 * @type {Array<{name: string, logo: string, alt: string}>}
 */
const CLIENTS = [
  { name: 'Delta Mechanical Seals', logo: '/assets/images/delta-mechanical-seals-80.jpg', alt: 'Delta Mechanical Seals logo' },
  { name: 'VelQuest', logo: '/assets/images/velquest-80.jpg', alt: 'VelQuest logo' },
  { name: 'Agfa Healthcare', logo: '/assets/images/agfa-healthcare-80.jpg', alt: 'Agfa Healthcare logo' },
  { name: 'Commonwealth of Massachusetts', logo: '/assets/images/commonwealth-of-ma-80.jpg', alt: 'Commonwealth of Massachusetts logo' },
  { name: 'BMI', logo: '/assets/images/bmi-80.jpg', alt: 'BMI logo' },
  { name: 'Flash Global Logistics', logo: '/assets/images/flash-global-80.jpg', alt: 'Flash Global logo' },
  { name: 'Specialty Commerce Corp', logo: '/assets/images/scc-80.jpg', alt: 'Specialty Commerce Corp logo' },
];

const AUTO_PLAY_SPEED = 3500;
const MIN_SWIPE_DISTANCE = 50;

/**
 * Clients component - Client logo banner with desktop grid and mobile carousel
 * @returns {JSX.Element}
 */
function Clients() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartRef = useRef({ x: 0, y: 0 });
  const carouselRef = useRef(null);
  const autoPlayRef = useRef(null);

  const totalSlides = CLIENTS.length;

  // Auto-play functionality
  useEffect(() => {
    if (isPaused) return;

    autoPlayRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev < totalSlides - 1 ? prev + 1 : 0));
    }, AUTO_PLAY_SPEED);

    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };
  }, [isPaused, totalSlides]);

  const stopAutoPlay = useCallback(() => {
    setIsPaused(true);
  }, []);

  const resumeAutoPlay = useCallback(() => {
    setIsPaused(false);
  }, []);

  const goToSlide = useCallback((index) => {
    setCurrentSlide(index);
    stopAutoPlay();
    setTimeout(resumeAutoPlay, 5000);
  }, [stopAutoPlay, resumeAutoPlay]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev > 0 ? prev - 1 : totalSlides - 1));
    stopAutoPlay();
    setTimeout(resumeAutoPlay, 5000);
  }, [totalSlides, stopAutoPlay, resumeAutoPlay]);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev < totalSlides - 1 ? prev + 1 : 0));
    stopAutoPlay();
    setTimeout(resumeAutoPlay, 5000);
  }, [totalSlides, stopAutoPlay, resumeAutoPlay]);

  // Touch handlers for swipe
  const handleTouchStart = useCallback((e) => {
    touchStartRef.current = {
      x: e.changedTouches[0].screenX,
      y: e.changedTouches[0].screenY,
    };
    stopAutoPlay();
  }, [stopAutoPlay]);

  const handleTouchEnd = useCallback((e) => {
    const touchEnd = {
      x: e.changedTouches[0].screenX,
      y: e.changedTouches[0].screenY,
    };
    const deltaX = touchEnd.x - touchStartRef.current.x;
    const deltaY = touchEnd.y - touchStartRef.current.y;

    // Check if horizontal swipe is longer than vertical
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > MIN_SWIPE_DISTANCE) {
      if (deltaX > 0) {
        prevSlide();
      } else {
        nextSlide();
      }
    }
    resumeAutoPlay();
  }, [prevSlide, nextSlide, resumeAutoPlay]);

  return (
    <section id="clients" className="clients" aria-labelledby="clients-title">
      <div className="section__container">
        <h2 id="clients-title" className="section__title">
          Brands I've Had the Pleasure of Working With
        </h2>

        {/* Desktop Grid Layout */}
        <div className="clients__grid clients__grid--desktop">
          {/* Column 1: Two rows */}
          <div className="clients__column clients__column--double">
            <div className="clients__item">
              <img src={CLIENTS[0].logo} alt={CLIENTS[0].alt} />
              <div className="clients__name"><strong>{CLIENTS[0].name}</strong></div>
            </div>
            <div className="clients__item">
              <img src={CLIENTS[1].logo} alt={CLIENTS[1].alt} />
              <div className="clients__name"><strong>{CLIENTS[1].name}</strong></div>
            </div>
          </div>

          {/* Column 2: Single row */}
          <div className="clients__column clients__column--single">
            <div className="clients__item">
              <img src={CLIENTS[2].logo} alt={CLIENTS[2].alt} />
              <div className="clients__name"><strong>{CLIENTS[2].name}</strong></div>
            </div>
          </div>

          {/* Column 3: Single row (center) */}
          <div className="clients__column clients__column--single clients__column--center">
            <div className="clients__item">
              <img src={CLIENTS[3].logo} alt={CLIENTS[3].alt} />
              <div className="clients__name"><strong>{CLIENTS[3].name}</strong></div>
            </div>
          </div>

          {/* Column 4: Single row */}
          <div className="clients__column clients__column--single">
            <div className="clients__item">
              <img src={CLIENTS[4].logo} alt={CLIENTS[4].alt} />
              <div className="clients__name"><strong>{CLIENTS[4].name}</strong></div>
            </div>
          </div>

          {/* Column 5: Two rows */}
          <div className="clients__column clients__column--double">
            <div className="clients__item">
              <img src={CLIENTS[5].logo} alt={CLIENTS[5].alt} />
              <div className="clients__name"><strong>{CLIENTS[5].name}</strong></div>
            </div>
            <div className="clients__item">
              <img src={CLIENTS[6].logo} alt={CLIENTS[6].alt} />
              <div className="clients__name"><strong>{CLIENTS[6].name}</strong></div>
            </div>
          </div>
        </div>

        {/* Mobile Carousel */}
        <div 
          className="clients__carousel clients__carousel--mobile"
          onMouseEnter={stopAutoPlay}
          onMouseLeave={resumeAutoPlay}
          onFocus={stopAutoPlay}
          onBlur={resumeAutoPlay}
        >
          <div 
            ref={carouselRef}
            className="clients__track" 
            data-carousel
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {CLIENTS.map((client, index) => (
              <div 
                key={client.name}
                className={`clients__item${index === currentSlide ? ' clients__item--active' : ''}`}
              >
                <img src={client.logo} alt={client.alt} />
                <div className="clients__name"><strong>{client.name}</strong></div>
              </div>
            ))}
          </div>

          {/* Carousel Navigation */}
          <div className="clients__nav">
            <button 
              className="clients__nav-btn clients__nav-btn--prev" 
              aria-label="Previous client"
              onClick={prevSlide}
            >
              &lt;
            </button>
            <div className="clients__indicators">
              {CLIENTS.map((client, index) => (
                <button
                  key={client.name}
                  className={`clients__indicator${index === currentSlide ? ' clients__indicator--active' : ''}`}
                  data-slide={index}
                  aria-label={`Client ${index + 1}`}
                  onClick={() => goToSlide(index)}
                />
              ))}
            </div>
            <button 
              className="clients__nav-btn clients__nav-btn--next" 
              aria-label="Next client"
              onClick={nextSlide}
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
