// Dynamic project page logic
// Contract:
// - Reads ?id= from URL
// - Looks up project in projectData
// - Injects title and Behance embed HTML
// - Updates document.title
// - Redirects back if id missing/invalid

(function () {
	const projectData = {
		cedarhurst: {
			title: 'Cedarhurst Brewing Company',
			// TODO: Replace INSERT_ID_HERE with real Behance embed id
			embed:
				'<iframe src="https://www.behance.net/embed/project/INSERT_ID_HERE?ilo0=1" width="1200" height="900" allowfullscreen lazyload frameborder="0" scrolling="no"></iframe>',
		},
		coffeeguild: {
			title: 'The Coffee Guild',
			embed:
				'<iframe src="https://www.behance.net/embed/project/INSERT_ID_HERE?ilo0=1" width="1200" height="900" allowfullscreen lazyload frameborder="0" scrolling="no"></iframe>',
		},
		chucklecanvas: {
			title: 'The Chuckle Canvas',
			embed:
				'<iframe src="https://www.behance.net/embed/project/INSERT_ID_HERE?ilo0=1" width="1200" height="900" allowfullscreen lazyload frameborder="0" scrolling="no"></iframe>',
		},
	};

	function getId() {
		const params = new URLSearchParams(window.location.search);
		return params.get('id');
	}

	function redirectBack() {
		window.location.replace('/index.html#portfolio-section');
	}

	function hydrate(project) {
		const titleEl = document.getElementById('project-title');
		const embedEl = document.getElementById('behance-embed-container');
		if (!titleEl || !embedEl) return;
		titleEl.textContent = project.title;
		embedEl.innerHTML = project.embed;
		document.title = `Project: ${project.title} | Dean Forant`;
	}

	document.addEventListener('DOMContentLoaded', () => {
		const id = getId();
		if (!id || !projectData[id]) {
			redirectBack();
			return;
		}
		hydrate(projectData[id]);
	});
})();
