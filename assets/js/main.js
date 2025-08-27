// Main JavaScript for portfolio site
document.addEventListener('DOMContentLoaded', () => {
	// Mobile nav toggle
	const header = document.querySelector('.header');
	const toggle = document.querySelector('.header__toggle');
	const nav = document.getElementById('header-nav');
	
	if (toggle && header && nav) {
		toggle.addEventListener('click', () => {
			const isOpen = header.classList.toggle('header--menu-open');
			toggle.setAttribute('aria-expanded', String(isOpen));
		});
		
		// Close menu when clicking nav links
		nav.querySelectorAll('.header__nav-link').forEach(link => {
			link.addEventListener('click', () => {
				if (header.classList.contains('header--menu-open')) {
					header.classList.remove('header--menu-open');
					toggle.setAttribute('aria-expanded', 'false');
				}
			});
		});
		
		// Close menu when clicking outside
		document.addEventListener('click', (e) => {
			if (!header.contains(e.target) && header.classList.contains('header--menu-open')) {
				header.classList.remove('header--menu-open');
				toggle.setAttribute('aria-expanded', 'false');
			}
		});
	}

	// Client Carousel for Mobile
	const carousel = document.querySelector('[data-carousel]');
	const prevBtn = document.querySelector('.clients__nav-btn--prev');
	const nextBtn = document.querySelector('.clients__nav-btn--next');
	const indicators = document.querySelectorAll('.clients__indicator');
	
	if (carousel && prevBtn && nextBtn && indicators.length > 0) {
		let currentSlide = 0;
		const totalSlides = indicators.length;
		const items = carousel.querySelectorAll('.clients__item');
		
		// Function to update carousel
		function updateCarousel() {
			// Update active item
			items.forEach((item, index) => {
				item.classList.toggle('clients__item--active', index === currentSlide);
			});
			
			// Update indicators
			indicators.forEach((indicator, index) => {
				indicator.classList.toggle('clients__indicator--active', index === currentSlide);
			});
			
			// Update button states
			prevBtn.disabled = currentSlide === 0;
			nextBtn.disabled = currentSlide === totalSlides - 1;
		}
		
		// Previous slide
		prevBtn.addEventListener('click', () => {
			if (currentSlide > 0) {
				currentSlide--;
				updateCarousel();
			}
		});
		
		// Next slide
		nextBtn.addEventListener('click', () => {
			if (currentSlide < totalSlides - 1) {
				currentSlide++;
				updateCarousel();
			}
		});
		
		// Indicator clicks
		indicators.forEach((indicator, index) => {
			indicator.addEventListener('click', () => {
				currentSlide = index;
				updateCarousel();
			});
		});
		
		// Initialize carousel
		updateCarousel();
		
		// Auto-play carousel with consistent timing
		let autoPlayInterval;
		let isPaused = false;
		const autoPlaySpeed = 3500; // Consistent 3.5 second intervals
		
		function startAutoPlay() {
			if (autoPlayInterval) clearInterval(autoPlayInterval);
			
			autoPlayInterval = setInterval(() => {
				if (!isPaused) {
					if (currentSlide < totalSlides - 1) {
						currentSlide++;
					} else {
						currentSlide = 0; // Loop back to first slide
					}
					updateCarousel();
				}
			}, autoPlaySpeed);
		}
		
		function stopAutoPlay() {
			isPaused = true;
			if (autoPlayInterval) {
				clearInterval(autoPlayInterval);
			}
		}
		
		function resumeAutoPlay() {
			isPaused = false;
			startAutoPlay();
		}
		
		// Start auto-play
		startAutoPlay();
		
		// Pause auto-play on hover/focus
		carousel.addEventListener('mouseenter', stopAutoPlay);
		carousel.addEventListener('mouseleave', resumeAutoPlay);
		carousel.addEventListener('focusin', stopAutoPlay);
		carousel.addEventListener('focusout', resumeAutoPlay);
		
		// Pause auto-play when user interacts with controls
		[prevBtn, nextBtn, ...indicators].forEach(control => {
			control.addEventListener('click', () => {
				stopAutoPlay();
				// Resume after a delay to give user time to interact
				setTimeout(resumeAutoPlay, 5000);
			});
		});
		carousel.addEventListener('mouseleave', startAutoPlay);
		
		// Pause auto-play when user interacts
		[prevBtn, nextBtn, ...indicators].forEach(btn => {
			btn.addEventListener('click', () => {
				stopAutoPlay();
				setTimeout(startAutoPlay, 8000); // Restart after 8 seconds
			});
		});
	}

	// Smooth scroll for internal anchor links
	document.querySelectorAll('a[href^="#"]').forEach((a) => {
		a.addEventListener('click', (e) => {
			const targetId = a.getAttribute('href');
			if (!targetId || targetId === '#') return;
			const el = document.querySelector(targetId);
			if (el) {
				e.preventDefault();
				el.scrollIntoView({ behavior: 'smooth', block: 'start' });
			}
		});
	});
	
	// Add intersection observer for animations (optional enhancement)
	if ('IntersectionObserver' in window) {
		const observerOptions = {
			threshold: 0.1,
			rootMargin: '0px 0px -50px 0px'
		};
		
		const observer = new IntersectionObserver((entries) => {
			entries.forEach(entry => {
				if (entry.isIntersecting) {
					entry.target.classList.add('animate-in');
				}
			});
		}, observerOptions);
		
		// Observe cards and sections
		document.querySelectorAll('.card, .clients__item, .about__media, .about__content').forEach(el => {
			observer.observe(el);
		});
	}

	// Process Tabs Functionality
	const processTabs = document.querySelectorAll('.process-tabs__tab');
	const processPanels = document.querySelectorAll('.process-tabs__panel');
	
	if (processTabs.length > 0 && processPanels.length > 0) {
		function switchTab(targetTab) {
			const targetPanel = targetTab.getAttribute('data-tab');
			
			// Remove active class from all tabs and panels
			processTabs.forEach(tab => {
				tab.classList.remove('process-tabs__tab--active');
				tab.setAttribute('aria-selected', 'false');
			});
			
			processPanels.forEach(panel => {
				panel.classList.remove('process-tabs__panel--active');
			});
			
			// Add active class to clicked tab and corresponding panel
			targetTab.classList.add('process-tabs__tab--active');
			targetTab.setAttribute('aria-selected', 'true');
			
			const activePanel = document.querySelector(`[data-panel="${targetPanel}"]`);
			if (activePanel) {
				activePanel.classList.add('process-tabs__panel--active');
			}
		}
		
		// Add click event listeners to tabs
		processTabs.forEach(tab => {
			tab.addEventListener('click', (e) => {
				e.preventDefault();
				switchTab(tab);
			});
			
			// Add keyboard support
			tab.addEventListener('keydown', (e) => {
				if (e.key === 'Enter' || e.key === ' ') {
					e.preventDefault();
					switchTab(tab);
				}
			});
		});
	}
});
