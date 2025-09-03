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
	
	// Contact Form Validation with Custom Messages
	const contactForm = document.querySelector('.contact__form');
	if (contactForm) {
		const nameField = document.getElementById('contact-name');
		const emailField = document.getElementById('contact-email');
		const messageField = document.getElementById('contact-message');
		
		// Custom validation messages
		const validationMessages = {
			name: {
				valueMissing: 'Please enter your full name so I know how to address you.',
				tooShort: 'Please enter your full name (at least 2 characters).'
			},
			email: {
				valueMissing: 'Please provide your email address so I can respond to your inquiry.',
				typeMismatch: 'Please enter a valid email address (e.g., name@example.com).',
				patternMismatch: 'Please enter a valid email address format.'
			},
			message: {
				valueMissing: 'Please tell me about your project or how I can help you.',
				tooShort: 'Please provide more details about your project (at least 10 characters).'
			}
		};
		
		// Function to set custom validation message
		function setCustomValidationMessage(field, fieldName) {
			const validity = field.validity;
			let message = '';
			
			if (validity.valueMissing) {
				message = validationMessages[fieldName].valueMissing;
			} else if (validity.typeMismatch || validity.patternMismatch) {
				message = validationMessages[fieldName].typeMismatch || validationMessages[fieldName].patternMismatch;
			} else if (validity.tooShort) {
				message = validationMessages[fieldName].tooShort;
			}
			
			field.setCustomValidity(message);
		}
		
		// Add validation to each field
		if (nameField) {
			nameField.setAttribute('minlength', '2');
			nameField.addEventListener('invalid', () => setCustomValidationMessage(nameField, 'name'));
			nameField.addEventListener('input', () => {
				setCustomValidationMessage(nameField, 'name');
			});
		}
		
		if (emailField) {
			emailField.addEventListener('invalid', () => setCustomValidationMessage(emailField, 'email'));
			emailField.addEventListener('input', () => {
				setCustomValidationMessage(emailField, 'email');
			});
		}
		
		if (messageField) {
			messageField.setAttribute('minlength', '10');
			messageField.addEventListener('invalid', () => setCustomValidationMessage(messageField, 'message'));
			messageField.addEventListener('input', () => {
				setCustomValidationMessage(messageField, 'message');
			});
		}
		
		// Form submission handling
		contactForm.addEventListener('submit', async (e) => {
			e.preventDefault(); // Always prevent default to handle with JavaScript
			
			// Reset custom validity messages
			[nameField, emailField, messageField].forEach(field => {
				if (field) {
					field.setCustomValidity('');
					setCustomValidationMessage(field, field.id.replace('contact-', ''));
				}
			});
			
			// If form is invalid, show first error
			if (!contactForm.checkValidity()) {
				const firstInvalidField = contactForm.querySelector(':invalid');
				if (firstInvalidField) {
					firstInvalidField.focus();
					firstInvalidField.reportValidity();
				}
				return;
			}

			// Get form data
			const formData = {
				name: nameField.value.trim(),
				email: emailField.value.trim(),
				message: messageField.value.trim()
			};

			// Get submit button and show loading state
			const submitButton = contactForm.querySelector('button[type="submit"]');
			const originalButtonText = submitButton.textContent;
			submitButton.textContent = 'Sending...';
			submitButton.disabled = true;

			// Add loading animation
			submitButton.innerHTML = '<span style="display: inline-block; width: 16px; height: 16px; border: 2px solid #ffffff; border-top: 2px solid transparent; border-radius: 50%; animation: spin 1s linear infinite; margin-right: 8px;"></span>Sending...';

			try {
				// Submit to API
				const response = await fetch('/api/contact/submit', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify(formData)
				});

				const result = await response.json();

				if (result.success) {
					// Show success message
					showFormMessage('✅ Thank you! Your message has been sent successfully. I\'ll get back to you within 24 hours.', 'success');
					
					// Reset form
					contactForm.reset();
					
					// Optional: Smooth scroll to success message
					const messageContainer = document.getElementById('form-message');
					if (messageContainer) {
						messageContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
					}
				} else {
					// Show error message
					showFormMessage(`❌ ${result.message || 'There was an error sending your message. Please try again.'}`, 'error');
				}

			} catch (error) {
				console.error('Form submission error:', error);
				showFormMessage('❌ Network error. Please check your connection and try again.', 'error');
			} finally {
				// Reset button state
				submitButton.textContent = originalButtonText;
				submitButton.disabled = false;
			}
		});

		// Function to show form messages
		function showFormMessage(message, type) {
			// Remove existing message
			const existingMessage = document.getElementById('form-message');
			if (existingMessage) {
				existingMessage.remove();
			}

			// Create message element
			const messageEl = document.createElement('div');
			messageEl.id = 'form-message';
			messageEl.style.cssText = `
				padding: 16px 20px;
				margin: 20px 0;
				border-radius: 8px;
				font-weight: 500;
				animation: slideIn 0.3s ease-out;
				${type === 'success' 
					? 'background: #d4edda; color: #155724; border: 1px solid #c3e6cb;' 
					: 'background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb;'
				}
			`;
			messageEl.textContent = message;

			// Add CSS animation if not already present
			if (!document.getElementById('form-message-styles')) {
				const styles = document.createElement('style');
				styles.id = 'form-message-styles';
				styles.textContent = `
					@keyframes slideIn {
						from { opacity: 0; transform: translateY(-10px); }
						to { opacity: 1; transform: translateY(0); }
					}
					@keyframes spin {
						from { transform: rotate(0deg); }
						to { transform: rotate(360deg); }
					}
				`;
				document.head.appendChild(styles);
			}

			// Insert message after form
			contactForm.parentNode.insertBefore(messageEl, contactForm.nextSibling);

			// Auto-remove success messages after 8 seconds
			if (type === 'success') {
				setTimeout(() => {
					if (messageEl.parentNode) {
						messageEl.style.animation = 'slideOut 0.3s ease-in';
						setTimeout(() => messageEl.remove(), 300);
					}
				}, 8000);
			}
		}
	}
});
