// ==========================================================================
// MAIN JAVASCRIPT - Dean Forant Designs
// ==========================================================================

document.addEventListener('DOMContentLoaded', function() {
    // ==========================================================================
    // NAVIGATION
    // ==========================================================================
    
    // Mobile menu toggle
    const mobileToggle = document.getElementById('mobileToggle');
    const mobileMenu = document.getElementById('mobileMenu');
    const header = document.getElementById('header');
    
    if (mobileToggle && mobileMenu) {
        mobileToggle.addEventListener('click', function() {
            mobileToggle.classList.toggle('navbar__toggle--active');
            mobileMenu.classList.toggle('mobile-menu--open');
            document.body.style.overflow = mobileMenu.classList.contains('mobile-menu--open') ? 'hidden' : '';
        });
        
        // Close mobile menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!mobileToggle.contains(e.target) && !mobileMenu.contains(e.target)) {
                mobileToggle.classList.remove('navbar__toggle--active');
                mobileMenu.classList.remove('mobile-menu--open');
                document.body.style.overflow = '';
            }
        });
        
        // Close mobile menu when clicking on links
        const mobileLinks = mobileMenu.querySelectorAll('.mobile-menu__link');
        mobileLinks.forEach(link => {
            link.addEventListener('click', function() {
                mobileToggle.classList.remove('navbar__toggle--active');
                mobileMenu.classList.remove('mobile-menu--open');
                document.body.style.overflow = '';
            });
        });
    }
    
    // Header scroll effect
    if (header) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 100) {
                header.classList.add('header--scrolled');
            } else {
                header.classList.remove('header--scrolled');
            }
        });
    }
    
    // ==========================================================================
    // SMOOTH SCROLLING
    // ==========================================================================
    
    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const headerHeight = header ? header.offsetHeight : 0;
                const targetPosition = target.offsetTop - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // ==========================================================================
    // BACK TO TOP BUTTON
    // ==========================================================================
    
    const backToTop = document.getElementById('backToTop');
    
    if (backToTop) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 300) {
                backToTop.classList.add('back-to-top--visible');
            } else {
                backToTop.classList.remove('back-to-top--visible');
            }
        });
        
        backToTop.addEventListener('click', function(e) {
            e.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
    
    // ==========================================================================
    // FORM HANDLING
    // ==========================================================================
    
    // Contact form submission
    const contactForm = document.getElementById('contactForm');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(contactForm);
            const data = Object.fromEntries(formData);
            
            // Basic validation
            if (!data.name || !data.email || !data.message) {
                showMessage('Please fill in all required fields.', 'error');
                return;
            }
            
            if (!isValidEmail(data.email)) {
                showMessage('Please enter a valid email address.', 'error');
                return;
            }
            
            // Show loading state
            const submitButton = contactForm.querySelector('button[type="submit"]');
            const originalText = submitButton.textContent;
            submitButton.textContent = 'Sending...';
            submitButton.disabled = true;
            contactForm.classList.add('form--loading');
            
            // Simulate form submission (replace with actual form handling)
            setTimeout(() => {
                showMessage('Thank you for your message! I\'ll get back to you soon.', 'success');
                contactForm.reset();
                
                // Reset button state
                submitButton.textContent = originalText;
                submitButton.disabled = false;
                contactForm.classList.remove('form--loading');
            }, 2000);
        });
    }
    
    // ==========================================================================
    // UTILITY FUNCTIONS
    // ==========================================================================
    
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    function showMessage(message, type) {
        // Remove existing messages
        const existingMessage = document.querySelector('.form__message');
        if (existingMessage) {
            existingMessage.remove();
        }
        
        // Create new message
        const messageDiv = document.createElement('div');
        messageDiv.className = `form__message form__message--${type}`;
        messageDiv.textContent = message;
        
        // Insert message
        const form = document.getElementById('contactForm');
        if (form) {
            form.insertBefore(messageDiv, form.firstChild);
            
            // Auto-remove success messages after 5 seconds
            if (type === 'success') {
                setTimeout(() => {
                    if (messageDiv.parentNode) {
                        messageDiv.remove();
                    }
                }, 5000);
            }
        }
    }
    
    // ==========================================================================
    // URL PARAMETER HANDLING
    // ==========================================================================
    
    // Handle service parameter on contact page
    const urlParams = new URLSearchParams(window.location.search);
    const service = urlParams.get('service');
    
    if (service && window.location.pathname.includes('contact.html')) {
        const subjectField = document.getElementById('subject');
        if (subjectField) {
            if (service === 'brand') {
                subjectField.value = 'Brand Design Inquiry';
            } else if (service === 'website') {
                subjectField.value = 'Website Design Inquiry';
            }
        }
    }
    
    // ==========================================================================
    // ANIMATION ON SCROLL
    // ==========================================================================
    
    // Simple animation on scroll for cards
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observe all cards and animate them on scroll
    document.querySelectorAll('.card, .services__card, .comparison__item').forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(card);
    });
    
    // ==========================================================================
    // LAZY LOADING IMAGES
    // ==========================================================================
    
    const imageObserver = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                const src = img.getAttribute('data-src');
                
                if (src) {
                    img.src = src;
                    img.removeAttribute('data-src');
                    img.classList.add('loaded');
                }
                
                imageObserver.unobserve(img);
            }
        });
    });
    
    // Observe all images with data-src attribute
    document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
    });
    
    console.log('Dean Forant Designs - Main JavaScript loaded successfully');
});
