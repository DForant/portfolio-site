// ==========================================================================
// CAROUSEL JAVASCRIPT - Dean Forant Designs
// ==========================================================================

document.addEventListener('DOMContentLoaded', function() {
    
    // ==========================================================================
    // COMPANY CAROUSEL
    // ==========================================================================
    
    const companyCarousel = {
        track: document.getElementById('companyTrack'),
        prevBtn: document.getElementById('prevBtn'),
        nextBtn: document.getElementById('nextBtn'),
        pauseBtn: document.getElementById('pauseBtn'),
        slides: null,
        currentIndex: 0,
        isPlaying: true,
        autoPlayInterval: null,
        slidesToShow: 3, // Default for mobile
        slideWidth: 0,
        
        init() {
            if (!this.track) return;
            
            this.slides = this.track.querySelectorAll('.company-carousel__slide');
            this.setupResponsive();
            this.setupEventListeners();
            this.startAutoPlay();
            this.updateCarousel();
            
            console.log('Company carousel initialized');
        },
        
        setupResponsive() {
            // Determine slides to show based on screen size
            const updateSlidesToShow = () => {
                if (window.innerWidth >= 1200) {
                    this.slidesToShow = 5;
                } else if (window.innerWidth >= 992) {
                    this.slidesToShow = 4;
                } else if (window.innerWidth >= 768) {
                    this.slidesToShow = 3;
                } else {
                    this.slidesToShow = 2;
                }
                
                this.slideWidth = 100 / this.slidesToShow;
                this.updateCarousel();
            };
            
            updateSlidesToShow();
            window.addEventListener('resize', updateSlidesToShow);
        },
        
        setupEventListeners() {
            if (this.prevBtn) {
                this.prevBtn.addEventListener('click', () => this.prevSlide());
            }
            
            if (this.nextBtn) {
                this.nextBtn.addEventListener('click', () => this.nextSlide());
            }
            
            if (this.pauseBtn) {
                this.pauseBtn.addEventListener('click', () => this.toggleAutoPlay());
            }
            
            // Pause on hover
            if (this.track) {
                this.track.addEventListener('mouseenter', () => this.stopAutoPlay());
                this.track.addEventListener('mouseleave', () => {
                    if (this.isPlaying) this.startAutoPlay();
                });
            }
        },
        
        nextSlide() {
            if (this.currentIndex < this.slides.length - this.slidesToShow) {
                this.currentIndex++;
            } else {
                this.currentIndex = 0; // Loop back to start
            }
            this.updateCarousel();
        },
        
        prevSlide() {
            if (this.currentIndex > 0) {
                this.currentIndex--;
            } else {
                this.currentIndex = this.slides.length - this.slidesToShow; // Loop to end
            }
            this.updateCarousel();
        },
        
        updateCarousel() {
            if (!this.track || !this.slides.length) return;
            
            const translateX = -this.currentIndex * this.slideWidth;
            this.track.style.transform = `translateX(${translateX}%)`;
            
            // Update button states
            if (this.prevBtn) {
                this.prevBtn.disabled = false; // Always enabled for infinite loop
            }
            
            if (this.nextBtn) {
                this.nextBtn.disabled = false; // Always enabled for infinite loop
            }
        },
        
        startAutoPlay() {
            if (this.autoPlayInterval) return;
            
            this.autoPlayInterval = setInterval(() => {
                this.nextSlide();
            }, 5000); // 5 seconds as specified
        },
        
        stopAutoPlay() {
            if (this.autoPlayInterval) {
                clearInterval(this.autoPlayInterval);
                this.autoPlayInterval = null;
            }
        },
        
        toggleAutoPlay() {
            if (this.isPlaying) {
                this.stopAutoPlay();
                this.isPlaying = false;
                if (this.pauseBtn) {
                    this.pauseBtn.classList.remove('company-carousel__pause--playing');
                    this.pauseBtn.classList.add('company-carousel__pause--paused');
                    this.pauseBtn.innerHTML = '<i class="fas fa-play"></i>';
                    this.pauseBtn.setAttribute('aria-label', 'Play carousel');
                }
            } else {
                this.startAutoPlay();
                this.isPlaying = true;
                if (this.pauseBtn) {
                    this.pauseBtn.classList.remove('company-carousel__pause--paused');
                    this.pauseBtn.classList.add('company-carousel__pause--playing');
                    this.pauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
                    this.pauseBtn.setAttribute('aria-label', 'Pause carousel');
                }
            }
        }
    };
    
    // ==========================================================================
    // GENERAL CAROUSEL CLASS (for future use)
    // ==========================================================================
    
    class Carousel {
        constructor(container, options = {}) {
            this.container = container;
            this.track = container.querySelector('.carousel__track');
            this.slides = container.querySelectorAll('.carousel__slide');
            this.prevBtn = container.querySelector('.carousel__nav--prev');
            this.nextBtn = container.querySelector('.carousel__nav--next');
            this.indicators = container.querySelectorAll('.carousel__indicator');
            
            // Options
            this.options = {
                autoPlay: options.autoPlay || true,
                interval: options.interval || 5000,
                pauseOnHover: options.pauseOnHover || true,
                showIndicators: options.showIndicators || true,
                ...options
            };
            
            this.currentIndex = 0;
            this.isPlaying = this.options.autoPlay;
            this.autoPlayInterval = null;
            
            this.init();
        }
        
        init() {
            if (!this.track || !this.slides.length) return;
            
            this.setupEventListeners();
            
            if (this.options.autoPlay) {
                this.startAutoPlay();
            }
            
            this.updateCarousel();
        }
        
        setupEventListeners() {
            // Navigation buttons
            if (this.prevBtn) {
                this.prevBtn.addEventListener('click', () => this.prevSlide());
            }
            
            if (this.nextBtn) {
                this.nextBtn.addEventListener('click', () => this.nextSlide());
            }
            
            // Indicators
            this.indicators.forEach((indicator, index) => {
                indicator.addEventListener('click', () => this.goToSlide(index));
            });
            
            // Pause on hover
            if (this.options.pauseOnHover) {
                this.container.addEventListener('mouseenter', () => this.stopAutoPlay());
                this.container.addEventListener('mouseleave', () => {
                    if (this.isPlaying) this.startAutoPlay();
                });
            }
            
            // Touch/swipe support for mobile
            this.setupTouchEvents();
        }
        
        setupTouchEvents() {
            let startX = 0;
            let startY = 0;
            let endX = 0;
            let endY = 0;
            
            this.track.addEventListener('touchstart', (e) => {
                startX = e.touches[0].clientX;
                startY = e.touches[0].clientY;
            });
            
            this.track.addEventListener('touchend', (e) => {
                endX = e.changedTouches[0].clientX;
                endY = e.changedTouches[0].clientY;
                
                const diffX = startX - endX;
                const diffY = startY - endY;
                
                // Only handle horizontal swipes
                if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
                    if (diffX > 0) {
                        this.nextSlide();
                    } else {
                        this.prevSlide();
                    }
                }
            });
        }
        
        nextSlide() {
            this.currentIndex = (this.currentIndex + 1) % this.slides.length;
            this.updateCarousel();
        }
        
        prevSlide() {
            this.currentIndex = this.currentIndex === 0 ? this.slides.length - 1 : this.currentIndex - 1;
            this.updateCarousel();
        }
        
        goToSlide(index) {
            this.currentIndex = index;
            this.updateCarousel();
        }
        
        updateCarousel() {
            // Update slide positions
            const translateX = -this.currentIndex * 100;
            this.track.style.transform = `translateX(${translateX}%)`;
            
            // Update slide states
            this.slides.forEach((slide, index) => {
                slide.classList.toggle('carousel__slide--active', index === this.currentIndex);
            });
            
            // Update indicators
            this.indicators.forEach((indicator, index) => {
                indicator.classList.toggle('carousel__indicator--active', index === this.currentIndex);
            });
            
            // Update navigation buttons
            if (this.prevBtn) {
                this.prevBtn.disabled = false; // Always enabled for infinite loop
            }
            
            if (this.nextBtn) {
                this.nextBtn.disabled = false; // Always enabled for infinite loop
            }
        }
        
        startAutoPlay() {
            if (this.autoPlayInterval) return;
            
            this.autoPlayInterval = setInterval(() => {
                this.nextSlide();
            }, this.options.interval);
        }
        
        stopAutoPlay() {
            if (this.autoPlayInterval) {
                clearInterval(this.autoPlayInterval);
                this.autoPlayInterval = null;
            }
        }
        
        destroy() {
            this.stopAutoPlay();
            // Remove event listeners would go here
        }
    }
    
    // Initialize company carousel
    companyCarousel.init();
    
    // Make Carousel class globally available
    window.Carousel = Carousel;
    
    console.log('Carousel JavaScript loaded successfully');
});
