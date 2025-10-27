import React, { useState, useEffect, useRef } from 'react';

const clients = [
  { img: '/assets/images/delta-mechanical-seals-80.jpg', name: 'Delta Mechanical Seals' },
  { img: '/assets/images/velquest-80.jpg', name: 'VelQuest' },
  { img: '/assets/images/agfa-healthcare-80.jpg', name: 'Agfa Healthcare' },
  { img: '/assets/images/commonwealth-of-ma-80.jpg', name: 'Commonwealth of Massachusetts' },
  { img: '/assets/images/bmi-80.jpg', name: 'BMI' },
  { img: '/assets/images/flash-global-80.jpg', name: 'Flash Global Logistics' },
  { img: '/assets/images/scc-80.jpg', name: 'Specialty Commerce Corp' },
];

function Clients() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const autoPlaySpeed = 3500;
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const minSwipeDistance = 50;

  useEffect(() => {
    if (!isPaused) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev < clients.length - 1 ? prev + 1 : 0));
      }, autoPlaySpeed);
      return () => clearInterval(interval);
    }
  }, [isPaused]);

  const goToPrev = () => {
    setCurrentSlide((prev) => (prev > 0 ? prev - 1 : clients.length - 1));
  };

  const goToNext = () => {
    setCurrentSlide((prev) => (prev < clients.length - 1 ? prev + 1 : 0));
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

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

    // Check if horizontal swipe is longer than vertical
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > minSwipeDistance) {
      if (deltaX > 0) {
        goToPrev();
      } else {
        goToNext();
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
        <h2 id="clients-title" className="section__title">Brands I've Had the Pleasure of Working With</h2>
        
        {/* Desktop Grid Layout */}
        <div className="clients__grid clients__grid--desktop">
          {/* Column 1: Two rows */}
          <div className="clients__column clients__column--double">
            <div className="clients__item">
              <img src="/assets/images/delta-mechanical-seals-80.jpg" alt="Delta Mechanical Seals logo" />
              <div className="clients__name"><strong>Delta Mechanical Seals</strong></div>
            </div>
            <div className="clients__item">
              <img src="/assets/images/velquest-80.jpg" alt="VelQuest logo" />
              <div className="clients__name"><strong>VelQuest</strong></div>
            </div>
          </div>
          
          {/* Column 2: Single row */}
          <div className="clients__column clients__column--single">
            <div className="clients__item">
              <img src="/assets/images/agfa-healthcare-80.jpg" alt="Agfa Healthcare logo" />
              <div className="clients__name"><strong>Agfa Healthcare</strong></div>
            </div>
          </div>
          
          {/* Column 3: Single row (center) */}
          <div className="clients__column clients__column--single clients__column--center">
            <div className="clients__item">
              <img src="/assets/images/commonwealth-of-ma-80.jpg" alt="Commonwealth of Massachusetts logo" />
              <div className="clients__name"><strong>Commonwealth of Massachusetts</strong></div>
            </div>
          </div>
          
          {/* Column 4: Single row */}
          <div className="clients__column clients__column--single">
            <div className="clients__item">
              <img src="/assets/images/bmi-80.jpg" alt="BMI logo" />
              <div className="clients__name"><strong>BMI</strong></div>
            </div>
          </div>
          
          {/* Column 5: Two rows */}
          <div className="clients__column clients__column--double">
            <div className="clients__item">
              <img src="/assets/images/flash-global-80.jpg" alt="Flash Global logo" />
              <div className="clients__name"><strong>Flash Global Logistics</strong></div>
            </div>
            <div className="clients__item">
              <img src="/assets/images/scc-80.jpg" alt="Specialty Commerce Corp logo" />
              <div className="clients__name"><strong>Specialty Commerce Corp</strong></div>
            </div>
          </div>
        </div>
        
        {/* Mobile Carousel */}
        <div 
          className="clients__carousel clients__carousel--mobile"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div 
            className="clients__track" 
            data-carousel
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {clients.map((client, index) => (
              <div 
                key={index}
                className={`clients__item ${index === currentSlide ? 'clients__item--active' : ''}`}
              >
                <img src={client.img} alt={`${client.name} logo`} />
                <div className="clients__name"><strong>{client.name}</strong></div>
              </div>
            ))}
          </div>
          
          {/* Carousel Navigation */}
          <div className="clients__nav">
            <button 
              className="clients__nav-btn clients__nav-btn--prev" 
              aria-label="Previous client"
              onClick={() => handleControlClick(goToPrev)}
            >
              &lt;
            </button>
            <div className="clients__indicators">
              {clients.map((_, index) => (
                <button
                  key={index}
                  className={`clients__indicator ${index === currentSlide ? 'clients__indicator--active' : ''}`}
                  data-slide={index}
                  aria-label={`Client ${index + 1}`}
                  onClick={() => handleControlClick(() => goToSlide(index))}
                ></button>
              ))}
            </div>
            <button 
              className="clients__nav-btn clients__nav-btn--next" 
              aria-label="Next client"
              onClick={() => handleControlClick(goToNext)}
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
