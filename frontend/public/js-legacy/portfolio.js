// portfolio.js - Dynamic project page functionality
document.addEventListener('DOMContentLoaded', () => {
    // Project data mapping
    const projectData = {
        'cedarhurst': {
            title: 'Cedarhurst Brewing Company',
            embed: '<iframe src="https://www.behance.net/embed/project/227216357?ilo0=1" height="316" width="404" allowfullscreen lazyload frameborder="0" allow="clipboard-write" refererPolicy="strict-origin-when-cross-origin"></iframe>'
        },
        'coffeeguild': {
            title: 'The Coffee Guild',
            embed: '<iframe src="https://www.behance.net/embed/project/231368347?ilo0=1" height="316" width="404" allowfullscreen lazyload frameborder="0" allow="clipboard-write" refererPolicy="strict-origin-when-cross-origin"></iframe>'
        },
        'chucklecanvas': {
            title: 'The Chuckle Canvas',
            embed: '<iframe src="https://www.behance.net/embed/project/227216357?ilo0=1" height="316" width="404" allowfullscreen lazyload frameborder="0" allow="clipboard-write" refererPolicy="strict-origin-when-cross-origin"></iframe>'
        }
    };
    
    // Get URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const projectId = urlParams.get('id');
    
    // Get DOM elements
    const titleElement = document.getElementById('project-title');
    const embedContainer = document.getElementById('behance-embed-container');
    const loadingElement = document.getElementById('project-loading');
    const errorElement = document.getElementById('project-error');
    
    // Function to show error state
    function showError() {
        if (loadingElement) loadingElement.style.display = 'none';
        if (errorElement) errorElement.style.display = 'block';
        if (embedContainer) embedContainer.style.display = 'none';
        
        // Update page title
        document.title = 'Project Not Found | Dean Forant Brand & Web Design';
    }
    
    // Function to load project
    function loadProject(project) {
        // Update page title
        document.title = `${project.title} | Dean Forant Brand & Web Design`;
        
        // Update project title
        if (titleElement) {
            titleElement.textContent = project.title;
        }
        
        // Update embed container
        if (embedContainer) {
            embedContainer.innerHTML = project.embed;
        }
        
        // Hide loading state
        if (loadingElement) {
            loadingElement.style.display = 'none';
        }
        
        // Show content
        if (embedContainer) {
            embedContainer.style.display = 'block';
        }
        
        // Add animation
        setTimeout(() => {
            if (embedContainer) {
                embedContainer.classList.add('project__embed--loaded');
            }
        }, 100);
    }
    
    // Main logic
    if (!projectId) {
        console.warn('No project ID found in URL');
        showError();
        return;
    }
    
    const project = projectData[projectId];
    
    if (!project) {
        console.warn(`Project with ID "${projectId}" not found`);
        showError();
        return;
    }
    
    // Simulate loading delay for better UX
    setTimeout(() => {
        loadProject(project);
    }, 500);
    
    // Handle embed load errors
    window.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'embed-error') {
            console.error('Embed failed to load');
            showError();
        }
    });
    
    // Fallback: Hide loading after 10 seconds if nothing happens
    setTimeout(() => {
        if (loadingElement && loadingElement.style.display !== 'none') {
            console.warn('Project loading timed out');
            showError();
        }
    }, 10000);
});

// Additional functionality for project navigation
document.addEventListener('DOMContentLoaded', () => {
    // Handle back link with proper focus management
    const backLink = document.querySelector('.project__back-link');
    
    if (backLink) {
        backLink.addEventListener('click', (e) => {
            // Let the browser handle the navigation
            // This ensures the portfolio section is properly focused
        });
    }
    
    // Add keyboard navigation support
    document.addEventListener('keydown', (e) => {
        // Escape key goes back to portfolio
        if (e.key === 'Escape') {
            window.location.href = '/#portfolio-section';
        }
    });
    
    // Add meta tags for better sharing (optional)
    const projectId = new URLSearchParams(window.location.search).get('id');
    if (projectId && window.projectData && window.projectData[projectId]) {
        const project = window.projectData[projectId];
        
        // Update meta description
        const metaDesc = document.querySelector('meta[name="description"]');
        if (!metaDesc) {
            const newMetaDesc = document.createElement('meta');
            newMetaDesc.name = 'description';
            newMetaDesc.content = `View ${project.title} - A brand and web design project by Dean Forant`;
            document.head.appendChild(newMetaDesc);
        }
    }
});
