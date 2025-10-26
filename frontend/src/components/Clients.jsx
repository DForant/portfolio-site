import React, { useState, useEffect, useRef } from 'react'

function Clients() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const carouselRef = useRef(null)
  const autoPlayIntervalRef = useRef(null)
  const totalSlides = 7

  const clients = [
    { name: 'Delta Mechanical Seals', image: '/images/delta-mechanical-seals-80.jpg' },
    { name: 'VelQuest', image: '/images/velquest-80.jpg' },
    { name: 'Agfa Healthcare', image: '/images/agfa-healthcare-80.jpg' },
    { name: 'Commonwealth of Massachusetts', image: '/images/commonwealth-of-ma-80.jpg' },
    { name: 'BMI', image: '/images/bmi-80.jpg' },
    { name: 'Flash Global Logistics', image: '/images/flash-global-80.jpg' },
    { name: 'Specialty Commerce Corp', image: '/images/scc-80.jpg' }
  ]

  const goToSlide = (index) => {
    setCurrentSlide(index)
  }

  const goToPrev = () => {
    setCurrentSlide((prev) => (prev > 0 ? prev - 1 : totalSlides - 1))
  }

  const goToNext = () => {
    setCurrentSlide((prev) => (prev < totalSlides - 1 ? prev + 1 : 0))
  }

  // Auto-play functionality
  useEffect(() => {
    const startAutoPlay = () => {
      if (autoPlayIntervalRef.current) {
        clearInterval(autoPlayIntervalRef.current)
      }
      
      autoPlayIntervalRef.current = setInterval(() => {
        if (!isPaused) {
          setCurrentSlide((prev) => (prev < totalSlides - 1 ? prev + 1 : 0))
        }
      }, 3500)
    }

    startAutoPlay()

    return () => {
      if (autoPlayIntervalRef.current) {
        clearInterval(autoPlayIntervalRef.current)
      }
    }
  }, [isPaused])

  // Touch/Swipe functionality
  useEffect(() => {
    const carousel = carouselRef.current
    if (!carousel) return

    let touchStartX = 0
    let touchEndX = 0
    let touchStartY = 0
    let touchEndY = 0

    const handleTouchStart = (e) => {
      touchStartX = e.changedTouches[0].screenX
      touchStartY = e.changedTouches[0].screenY
      setIsPaused(true)
    }

    const handleTouchEnd = (e) => {
      touchEndX = e.changedTouches[0].screenX
      touchEndY = e.changedTouches[0].screenY
      handleSwipe()
      setTimeout(() => setIsPaused(false), 5000)
    }

    const handleSwipe = () => {
      const deltaX = touchEndX - touchStartX
      const deltaY = touchEndY - touchStartY
      const minSwipeDistance = 50

      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > minSwipeDistance) {
        if (deltaX > 0) {
          goToPrev()
        } else {
          goToNext()
        }
      }
    }

    carousel.addEventListener('touchstart', handleTouchStart, { passive: true })
    carousel.addEventListener('touchend', handleTouchEnd, { passive: true })

    return () => {
      carousel.removeEventListener('touchstart', handleTouchStart)
      carousel.removeEventListener('touchend', handleTouchEnd)
    }
  }, [])

  const handleUserInteraction = () => {
    setIsPaused(true)
    setTimeout(() => setIsPaused(false), 8000)
  }

  return (
    <section id="clients" className="clients" aria-labelledby="clients-title">
      <div className="section__container">
        <h2 id="clients-title" className="section__title">Brands I've Had the Pleasure of Working With</h2>
        
        {/* Desktop Grid Layout */}
        <div className="clients__grid clients__grid--desktop">
          {/* Column 1: Two rows */}
          <div className="clients__column clients__column--double">
            <div className="clients__item">
              <img src="/images/delta-mechanical-seals-80.jpg" alt="Delta Mechanical Seals logo" />
              <div className="clients__name"><strong>Delta Mechanical Seals</strong></div>
            </div>
            <div className="clients__item">
              <img src="/images/velquest-80.jpg" alt="VelQuest logo" />
              <div className="clients__name"><strong>VelQuest</strong></div>
            </div>
          </div>
          
          {/* Column 2: Single row */}
          <div className="clients__column clients__column--single">
            <div className="clients__item">
              <img src="/images/agfa-healthcare-80.jpg" alt="Agfa Healthcare logo" />
              <div className="clients__name"><strong>Agfa Healthcare</strong></div>
            </div>
          </div>
          
          {/* Column 3: Single row (center) */}
          <div className="clients__column clients__column--single clients__column--center">
            <div className="clients__item">
              <img src="/images/commonwealth-of-ma-80.jpg" alt="Commonwealth of Massachusetts logo" />
              <div className="clients__name"><strong>Commonwealth of Massachusetts</strong></div>
            </div>
          </div>
          
          {/* Column 4: Single row */}
          <div className="clients__column clients__column--single">
            <div className="clients__item">
              <img src="/images/bmi-80.jpg" alt="BMI logo" />
              <div className="clients__name"><strong>BMI</strong></div>
            </div>
          </div>
          
          {/* Column 5: Two rows */}
          <div className="clients__column clients__column--double">
            <div className="clients__item">
              <img src="/images/flash-global-80.jpg" alt="Flash Global logo" />
              <div className="clients__name"><strong>Flash Global Logistics</strong></div>
            </div>
            <div className="clients__item">
              <img src="/images/scc-80.jpg" alt="Specialty Commerce Corp logo" />
              <div className="clients__name"><strong>Specialty Commerce Corp</strong></div>
            </div>
          </div>
        </div>
        
        {/* Mobile Carousel */}
        <div className="clients__carousel clients__carousel--mobile">
          <div 
            className="clients__track" 
            data-carousel 
            ref={carouselRef}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onFocus={() => setIsPaused(true)}
            onBlur={() => setIsPaused(false)}
          >
            {clients.map((client, index) => (
              <div 
                key={index}
                className={`clients__item ${index === currentSlide ? 'clients__item--active' : ''}`}
              >
                <img src={client.image} alt={`${client.name} logo`} />
                <div className="clients__name"><strong>{client.name}</strong></div>
              </div>
            ))}
          </div>
          
          {/* Carousel Navigation */}
          <div className="clients__nav">
            <button 
              className="clients__nav-btn clients__nav-btn--prev" 
              aria-label="Previous client"
              onClick={() => { goToPrev(); handleUserInteraction(); }}
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
                  onClick={() => { goToSlide(index); handleUserInteraction(); }}
                />
              ))}
            </div>
            <button 
              className="clients__nav-btn clients__nav-btn--next" 
              aria-label="Next client"
              onClick={() => { goToNext(); handleUserInteraction(); }}
            >
              &gt;
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Clients
