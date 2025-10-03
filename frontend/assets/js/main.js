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
			
			// Keep buttons always enabled for infinite loop
			prevBtn.disabled = false;
			nextBtn.disabled = false;
		}
		
		// Previous slide with infinite loop
		prevBtn.addEventListener('click', () => {
			if (currentSlide > 0) {
				currentSlide--;
			} else {
				currentSlide = totalSlides - 1; // Loop to last slide
			}
			updateCarousel();
		});
		
		// Next slide with infinite loop
		nextBtn.addEventListener('click', () => {
			if (currentSlide < totalSlides - 1) {
				currentSlide++;
			} else {
				currentSlide = 0; // Loop to first slide
			}
			updateCarousel();
		});
		
		// Indicator clicks
		indicators.forEach((indicator, index) => {
			indicator.addEventListener('click', () => {
				currentSlide = index;
				updateCarousel();
			});
		});
		
		// Touch/Swipe functionality for mobile devices
		let touchStartX = 0;
		let touchEndX = 0;
		let touchStartY = 0;
		let touchEndY = 0;
		const minSwipeDistance = 50; // Minimum distance for a swipe to register
		
		// Handle touch start
		carousel.addEventListener('touchstart', (e) => {
			touchStartX = e.changedTouches[0].screenX;
			touchStartY = e.changedTouches[0].screenY;
			stopAutoPlay(); // Pause auto-play during touch interaction
		}, { passive: true });
		
		// Handle touch end
		carousel.addEventListener('touchend', (e) => {
			touchEndX = e.changedTouches[0].screenX;
			touchEndY = e.changedTouches[0].screenY;
			handleSwipe();
			resumeAutoPlay(); // Resume auto-play after touch interaction
		}, { passive: true });
		
		// Determine swipe direction and trigger navigation
		function handleSwipe() {
			const deltaX = touchEndX - touchStartX;
			const deltaY = touchEndY - touchStartY;
			
			// Check if horizontal swipe is longer than vertical (prevents conflicts with scrolling)
			if (Math.abs(deltaX) > Math.abs(deltaY)) {
				// Check if swipe distance meets minimum threshold
				if (Math.abs(deltaX) > minSwipeDistance) {
					if (deltaX > 0) {
						// Swipe right - go to previous slide
						if (currentSlide > 0) {
							currentSlide--;
						} else {
							currentSlide = totalSlides - 1; // Loop to last slide
						}
						updateCarousel();
					} else {
						// Swipe left - go to next slide
						if (currentSlide < totalSlides - 1) {
							currentSlide++;
						} else {
							currentSlide = 0; // Loop to first slide
						}
						updateCarousel();
					}
				}
			}
		}
		
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
	
	// Contact Form - Removed since we're using mailto button
	// New contact form handling
	const contactForm = document.getElementById('contact-form');
	if (contactForm) {
		const statusEl = document.getElementById('contact-form-status');
		const submitBtn = document.getElementById('contact-submit');

		// Simple debounce helper for status messages
		let statusTimeout;
		function setStatus(message, type = 'info') {
			if (statusTimeout) clearTimeout(statusTimeout);
			statusEl.textContent = message;
			statusEl.className = 'contact__form__status contact__form__status--' + type;
			if (type === 'success') {
				statusTimeout = setTimeout(() => {
					statusEl.textContent = '';
					statusEl.className = 'contact__form__status';
				}, 8000);
			}
		}

		function sanitizeText(value) {
			return value.replace(/[<>]/g, '').trim();
		}

		function validateField(id, validator) {
			const input = document.getElementById(id);
			if (!input) return true;
			const errorEl = contactForm.querySelector(`[data-error-for="${id}"]`);
			let errorMsg = '';
			if (validator) {
				errorMsg = validator(input.value);
			}
			if (errorMsg) {
				input.classList.add('contact__form__input--error');
				if (errorEl) errorEl.textContent = errorMsg;
				return false;
			} else {
				input.classList.remove('contact__form__input--error');
				if (errorEl) errorEl.textContent = '';
				return true;
			}
		}

		const validators = {
			firstName: (v) => {
				v = v.trim();
				if (!v) return 'First name is required';
				if (!/^[A-Za-z]{2,}$/.test(v)) return 'Only letters, min 2 characters';
				return '';
			},
			lastName: (v) => {
				v = v.trim();
				if (!v) return 'Last name is required';
				if (!/^[A-Za-z]{2,}$/.test(v)) return 'Only letters, min 2 characters';
				return '';
			},
			phone: (v) => {
				v = v.trim();
				if (!v) return 'Phone number is required';
				// Basic international / US style lenient pattern
				if (!/^[+]?[(]?[0-9]{1,4}[)]?[-\s0-9]{5,}$/.test(v)) return 'Enter valid phone number';
				return '';
			},
			email: (v) => {
				v = v.trim();
				if (!v) return 'Email is required';
				if (!/^\S+@\S+\.\S+$/.test(v)) return 'Enter a valid email';
				return '';
			},
			description: (v) => {
				v = v.trim();
				if (!v) return 'Description is required';
				if (v.length < 10) return 'Minimum 10 characters';
				if (v.length > 5000) return 'Maximum 5000 characters';
				return '';
			}
		};

		// Attach blur listeners for real-time validation
		Object.keys(validators).forEach((id) => {
			const el = document.getElementById(id);
			if (el) {
				el.addEventListener('blur', () => validateField(id, validators[id]));
			}
		});

		contactForm.addEventListener('submit', async (e) => {
			e.preventDefault();
			setStatus('Validating...', 'info');

			// Validate all required fields
			let allValid = true;
			Object.keys(validators).forEach((id) => {
				if (!validateField(id, validators[id])) allValid = false;
			});
			if (!allValid) {
				setStatus('Please correct the errors above.', 'error');
				return;
			}

			submitBtn.disabled = true;
			submitBtn.textContent = 'Submitting...';

			// Collect services
			const services = Array.from(contactForm.querySelectorAll('input[name="services"]:checked'))
				.map(cb => cb.value).slice(0, 10);

			// Prepare payload
			const payload = {
				firstName: sanitizeText(contactForm.firstName.value),
				lastName: sanitizeText(contactForm.lastName.value),
				company: sanitizeText(contactForm.company.value || ''),
				phone: sanitizeText(contactForm.phone.value),
				email: sanitizeText(contactForm.email.value || ''),
				description: sanitizeText(contactForm.description.value),
				services
			};

			// Determine API endpoint. In dev when frontend not served by the Express server (different port or file://) use explicit localhost:4000
			let endpoint;
			try {
				if (window.location.protocol === 'file:' || (window.location.hostname === 'localhost' && window.location.port && window.location.port !== '4000')) {
					endpoint = 'http://localhost:4000/api/contact';
				} else if (window.location.hostname === '127.0.0.1' && window.location.port && window.location.port !== '4000') {
					endpoint = 'http://127.0.0.1:4000/api/contact';
				} else {
					endpoint = '/api/contact'; // same-origin (production or backend already serving the static assets)
				}
			} catch(_) {
				endpoint = '/api/contact';
			}

			try {
				setStatus('Sending...', 'info');
				const res = await fetch(endpoint, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(payload)
				});
				const data = await res.json().catch(() => ({ success: false, message: 'Unexpected server response' }));
				if (!res.ok || !data.success) {
					throw new Error(data.message || 'Submission failed');
				}
				setStatus(data.message || 'Message sent successfully!', 'success');
				contactForm.reset();
			} catch (err) {
				console.error('Contact form error:', err);
				setStatus(err.message || 'An error occurred. Please try again later.', 'error');
			} finally {
				submitBtn.disabled = false;
				submitBtn.textContent = 'Submit';
			}
		});
	}
});
