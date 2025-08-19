Brand & Web Design Assistant
Custom Gem

Show thinking
You are absolutely right, my apologies. It seems the formatting was cut off in the last response.

Here is the entire copilot-instructions.md file, correctly wrapped in a single markdown block for easy copying.

Markdown

# Dean Forant Brand & Web Design - Portfolio Website Copilot Instructions

This document provides instructions for building a modern, clean, and professional portfolio website for Dean Forant Brand & Web Design. The aesthetic should be derived from the official Facebook banner, emphasizing professionalism and a strong design foundation.

***

## I. Project & Sass Folder Structure

This structure organizes the project files logically and sets up a scalable Sass architecture.

|-- assets/
|   |-- css/
|   |   |-- style.css         // Compiled CSS output
|   |
|   |-- images/
|   |   |-- logo.png
|   |   |-- dean-photo.jpg
|   |   |-- client-logos/
|   |   |-- portfolio/
|   |   |-- icons/            // For local SVG icons
|   |
|   |-- js/
|   |   |-- main.js           // For homepage interactions
|   |   |-- portfolio.js      // Logic for the dynamic project page
|   |
|   |-- sass/
|       |-- abstracts/
|       |   |-- _variables.scss
|       |   |-- _mixins.scss
|       |
|       |-- base/
|       |   |-- _base.scss
|       |   |-- _typography.scss
|       |
|       |-- components/
|       |   |-- _buttons.scss
|       |   |-- _cards.scss
|       |   |-- _carousel.scss
|       |
|       |-- layout/
|       |   |-- _header.scss
|       |   |-- _footer.scss
|       |   |-- _sections.scss
|       |
|       |-- pages/
|       |   |-- _home.scss
|       |
|       |-- main.scss
|
|-- portfolio/
|   |-- project.html          // The single, dynamic template for all projects
|
|-- index.html
|
|-- copilot-instructions.md
|
`-- README.md

The project should be initialized with a package manager like npm or yarn, and the necessary dependencies should be installed. This includes sass


## Sass `main.scss` Import Order

Your `main.scss` file should import the partials in this order to ensure the correct cascade:
```scss
// 1. Abstracts (variables, mixins)
@import 'abstracts/variables';
@import 'abstracts/mixins';

// 2. Base styles
@import 'base/base';
@import 'base/typography';

// 3. Layout
@import 'layout/header';
@import 'layout/footer';
@import 'layout/sections';

// 4. Components
@import 'components/buttons';
@import 'components/cards';
@import 'components/carousel';

// 5. Page-specific styles
@import 'pages/home';
```

I. CSS Naming Convention (BEM)
We will use the BEM (Block, Element, Modifier) naming convention for all CSS classes to ensure our styles are modular and specific.

Block: A standalone component. (e.g., .card, .btn)

Element: A part of a block. Separated by two underscores. (e.g., .card__title, .card__icon)

Modifier: A variation of a block or element. Separated by two hyphens. (e.g., .btn--primary, .card--dark)

Example for a Service Card:

HTML

<div class="card card--service">
    <div class="card__icon">...</div>
    <h3 class="card__title">...</h3>
    <p class="card__description">...</p>
</div>
SCSS

// In _cards.scss
.card {
    // Base card styles

    &--service {
        // Modifier styles specific to service cards
    }

    &__icon {
        // Element styles
    }

    &__title {
        // Element styles
    }

    &__description {
        // Element styles
    }
}
II. Design System
A. Color Palette
Primary Blue: #4A6C9B

Accent Gold/Yellow: #FDB813

Dark Text/Charcoal: #212529

Light Background/Off-White: #F8F9FA

White: #FFFFFF

B. Typography
Headings (H1, H2, H3): Use 'Playfair Display'.

Body & Subheadings: Use 'Montserrat'.

Google Fonts Import: Add the following to the <head> of your HTML:

HTML

<link rel="preconnect" href="[https://fonts.googleapis.com](https://fonts.googleapis.com)">
<link rel="preconnect" href="[https://fonts.gstatic.com](https://fonts.gstatic.com)" crossorigin>
<link href="[https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500&family=Playfair+Display:wght@700&display=swap](https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500&family=Playfair+Display:wght@700&display=swap)" rel="stylesheet">
III. Website Structure & Content
A. Global Header / Navigation
Layout: Sticky header.

Left Side: Dean Forant logo.

Right Side (Nav Links): Home, About, Services, Portfolio, Contact.

CTA Button: "Let's Talk".

B. Section 1: Hero
Background: Subtle blue blueprint pattern from the banner.

Headline (H1): Crafting Your Vision Into A Brand And Web Design That Wins

Subheading: A brief statement on your 20+ years of experience.

Buttons: "View My Work" and "Get In Touch".

C. Section 2: Client Logo Banner
Headline: "Trusted By Premier Organizations".

Desktop Layout: A single row of the 7 client logos, with the Commonwealth of Massachusetts logo centered.

Logo & Name Unit: Each logo should have the company name displayed beneath it in bold text.

Mobile Layout: Converts to a one-image carousel.

Ideal Layout should be as follows
  - Flash Global
  - SCC
  - BMI
  - Commonwealth of Massachusetts
  - Agfa Healthcare
  - Delta Mechanical Seals
  - VelQuest

D. Section 3: About Me
Layout: Two-column layout.

Left Column: A professional photo of yourself.

Right Column:

Headline (H2): 20+ Years of Building Brands That Stand Out

Body Text: A concise biography.

My Process: Briefly mention your six-phase methodology.

E. Section 4: Services
Headline (H2): Services I Provide

Layout: A grid of 3 service cards.

Font Awesome CDN: Add the Font Awesome CDN link to the <head> of your HTML.

Icons: Use Font Awesome icons for each service (fa-pen-ruler, fa-object-group, fa-list-check). These can later be replaced with local SVGs.

F. Section 5: Portfolio
Headline (H2): Selected Works

Layout: A modern grid of featured project cards.

Functionality: Each card will link to the single project template (/portfolio/project.html) but will pass a unique identifier for the project using a URL parameter.

Link Examples:

Cedarhurst Link: <a href="/portfolio/project.html?id=cedarhurst">

Coffee Guild Link: <a href="/portfolio/project.html?id=coffeeguild">

Chuckle Canvas Link: <a href="/portfolio/project.html?id=chucklecanvas">

F.1. Dynamic Project Page (project.html)
This single HTML file will serve as the template for all portfolio projects. Its content will be populated by JavaScript based on the id parameter in the URL.

Header/Footer: The page must include the global header and footer.

HTML Structure: The body should contain placeholder elements with unique IDs for JavaScript to target.

HTML

<main class="project-container">
    <a href="/#portfolio-section">← Back to Portfolio</a>
    <h1 id="project-title">[Project Title Loading...]</h1>
    <div id="behance-embed-container">
        </div>
</main>
JavaScript Functionality (/assets/js/portfolio.js):

Project Data: Create a JavaScript object to store the information for each project, mapping the URL id to its title and Behance embed code.

JavaScript

const projectData = {
    'cedarhurst': {
        title: 'Cedarhurst Brewing Company',
        embed: '<iframe src="[https://www.behance.net/embed/project/INSERT_ID_HERE?ilo0=](https://www.behance.net/embed/project/INSERT_ID_HERE?ilo0=)" ...></iframe>'
    },
    'coffeeguild': {
        title: 'The Coffee Guild',
        embed: '<iframe src="[https://www.behance.net/embed/project/INSERT_ID_HERE?ilo0=](https://www.behance.net/embed/project/INSERT_ID_HERE?ilo0=)" ...></iframe>'
    },
    'chucklecanvas': {
        title: 'The Chuckle Canvas',
        embed: '<iframe src="[https://www.behance.net/embed/project/INSERT_ID_HERE?ilo0=](https://www.behance.net/embed/project/INSERT_ID_HERE?ilo0=)" ...></iframe>'
    }
};
On Page Load: The script should run when the project.html page loads.

Read URL Parameter: Get the id from the URL. (e.g., using new URLSearchParams(window.location.search).get('id');).

Find Project: Look up the corresponding project in the projectData object.

Populate Content: If the project is found, use JavaScript to:

Update the innerHTML of the <h1 id="project-title">.

Update the innerHTML of the <div id="behance-embed-container"> with the project's embed code.

Update the page's document title: document.title = 'Project: ' + project.title + ' | Dean Forant';.

Error Handling: If no id is found or the id is invalid, redirect the user back to the main portfolio page.

G. Section 6: Contact
Headline (H2): Ready to Win? Let's Build Your Brand.

Layout: Two-column layout with contact info on the left and a contact form on the right.

H. Global Footer
Layout: Three-column layout.

Column 1: Dean Forant Logo and a short tagline.

Column 2: Quick Links (Home, About, Services, Portfolio, Contact).

Column 3 (Social Media): Icons for Facebook, LinkedIn, Behance, Youtube, Github, and Instagram.

Sub-Footer: Centered copyright text.