// Smooth scroll for internal anchor links
document.addEventListener('DOMContentLoaded', () => {
	// Mobile nav toggle
	const header = document.querySelector('.header');
	const toggle = document.querySelector('.header__toggle');
	const nav = document.getElementById('primary-navigation');
	if (toggle && header && nav) {
		toggle.addEventListener('click', () => {
			const isOpen = header.classList.toggle('header--open');
			toggle.setAttribute('aria-expanded', String(isOpen));
		});
		// Close on link click (optional)
		nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
			if (header.classList.contains('header--open')) {
				header.classList.remove('header--open');
				toggle.setAttribute('aria-expanded', 'false');
			}
		}));
	}

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
});
