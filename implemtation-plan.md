# Implementation Plan — Dean Forant Brand & Web Design Portfolio

Source of requirements: .github/copilot-instructions.md

Goal: Implement a modern, clean, professional portfolio site reflecting the Facebook banner aesthetic, with a scalable Sass architecture, BEM naming, responsive layout, dynamic project page, and accessible UX.

---

## Milestones

1) Project setup and tooling
2) Sass architecture and design system
3) Global layout (header, footer)
4) Core sections (Hero, Clients, About, Services, Portfolio, Contact)
5) Dynamic project page and JS
6) Accessibility, responsiveness, performance
7) Documentation and delivery

---

## Deliverables

- Project structure per instructions
- Compiled CSS at assets/css/style.css
- Working homepage (index.html)
- Dynamic project page (portfolio/project.html) with assets/js/portfolio.js
- Sass partials with BEM-compliant CSS
- README with setup and build steps

---

## 1) Project Setup and Tooling

Tasks
- Initialize Node project and install Sass.
- Create folders/files defined under “Project & Sass Folder Structure.”

Acceptance criteria
- Running Sass watch compiles assets/sass/main.scss to assets/css/style.css without errors.
- Folder tree matches spec in .github/copilot-instructions.md.

Recommended scripts (to be added later in package.json)
- "sass:watch": sass assets/sass/main.scss assets/css/style.css --watch
- "sass:build": sass assets/sass/main.scss assets/css/style.css --style=compressed

Assets in workspace
- Use available banner and logo assets under assets/images/ (or stub if missing):
  - web-banner-80.jpg (hero background)
  - Client logos: Flash Global-80.jpg, SCC-80.jpg, BMI-80.jpg, Commonwealth Of Ma-80.jpg, Agfa Healthcare-80.jpg, Delta Mechanical Seals-80.jpg, ValQuest-80.jpg

---

## 2) Sass Architecture and Design System

Files to create (Sass)
- assets/sass/abstracts/_variables.scss
- assets/sass/abstracts/_mixins.scss
- assets/sass/base/_base.scss
- assets/sass/base/_typography.scss
- assets/sass/layout/_header.scss
- assets/sass/layout/_footer.scss
- assets/sass/layout/_sections.scss
- assets/sass/components/_buttons.scss
- assets/sass/components/_cards.scss
- assets/sass/components/_carousel.scss
- assets/sass/pages/_home.scss
- assets/sass/main.scss

Import order (must match spec)
- In assets/sass/main.scss:
  - Abstracts: variables, mixins
  - Base: base, typography
  - Layout: header, footer, sections
  - Components: buttons, cards, carousel
  - Pages: home

Design tokens (variables)
- Colors:
  - Primary: #4A6C9B
  - Accent: #FDB813
  - Text/dark: #212529
  - Background/light: #F8F9FA
  - White: #FFFFFF
- Typography:
  - Headings: 'Playfair Display'
  - Body: 'Montserrat'

Conventions
- BEM naming throughout (e.g., .card, .card__title, .card--service)

Acceptance criteria
- All partials compile via main.scss (no direct compilation of partials).
- No linting/compile errors; CSS classes adhere to BEM.

---

## 3) Global Layout

Header (sticky)
- Left: logo
- Right: nav (Home, About, Services, Portfolio, Contact) + CTA “Let’s Talk”
- Mobile: collapsed/accessible navigation

Footer
- Column 1: logo + tagline
- Column 2: quick links
- Column 3: social icons (Font Awesome)
- Sub-footer: centered copyright

Acceptance criteria
- Header remains visible on scroll.
- Footer stacks cleanly on mobile.

---

## 4) Core Sections on index.html

Hero
- Background: use assets/images/web-banner-80.jpg as a subtle blueprint-style background.
- Headline: “Crafting Your Vision Into A Brand And Web Design That Wins”
- Subheading: 20+ years experience statement
- Buttons: “View My Work”, “Get In Touch”

Client Logo Banner
- Headline: “Trusted By Premier Organizations”
- Desktop: single row of 7 logos, Commonwealth centered
- Each logo unit: image + bold company name
- Mobile: one-logo-at-a-time carousel (basic JS/CSS)
- Order:
  1. Flash Global (Flash Global-80.jpg)
  2. SCC (SCC-80.jpg)
  3. BMI (BMI-80.jpg)
  4. Commonwealth of Massachusetts (Commonwealth Of Ma-80.jpg) — centered
  5. Agfa Healthcare (Agfa Healthcare-80.jpg)
  6. Delta Mechanical Seals (Delta Mechanical Seals-80.jpg)
  7. ValQuest (ValQuest-80.jpg)

About
- Two-column layout: photo (left), content (right)
- H2: “20+ Years of Building Brands That Stand Out”
- Concise bio + brief six-phase methodology note

Services
- H2: “Services I Provide”
- Three cards: Brand Identity (fa-pen-ruler), Web Design (fa-object-group), Creative Direction (fa-list-check)

Portfolio
- H2: “Selected Works”
- Grid of cards linking to /portfolio/project.html?id={slug}
  - Example slugs: cedarhurst, coffeeguild, chucklecanvas

Contact
- H2: “Ready to Win? Let’s Build Your Brand.”
- Two-column: contact info (left), form (right)

Acceptance criteria
- Sections render in required order with correct headings.
- Client logo row centers Commonwealth on desktop, works as simple carousel on mobile.

---

## 5) Dynamic Project Page

File
- portfolio/project.html (single template for all projects)

Structure (required IDs)
- Back link to portfolio section
- h1#project-title
- div#behance-embed-container
- Shared header/footer

Script
- assets/js/portfolio.js:
  - On DOMContentLoaded:
    - Read id param: new URLSearchParams(location.search).get('id')
    - Lookup projectData[id] => { title, embed }
    - Populate:
      - #project-title textContent = title
      - #behance-embed-container innerHTML = embed
      - document.title = `Project: ${title} | Dean Forant`
    - If invalid/missing id, redirect to "/#portfolio" (or index.html#portfolio)

Minimum projectData entries
- cedarhurst, coffeeguild, chucklecanvas (title + placeholder Behance embed URL)

Acceptance criteria
- Valid id populates title and embed; document title updates.
- Invalid id redirects to homepage portfolio section.

---

## 6) Accessibility, Responsiveness, Performance

Accessibility
- Semantic HTML5 landmarks
- Alt text on all images (including client logos with company names)
- Focus styles and keyboard navigation for header/menu/buttons/links/form
- Sufficient color contrast

Responsiveness
- Mobile-first CSS
- Breakpoints to maintain readable typography and layout
- Client logos: single-row on desktop, carousel on mobile

Performance
- Optimize hero background and client logos (use 80px images where applicable)
- Defer non-critical JS; preload fonts responsibly

Acceptance criteria
- Basic keyboard-only navigation works across nav and form.
- Layouts remain legible and stable across small/large screens.

---

## 7) External Resources

Include in index.html and project.html
- Google Fonts:
  - Montserrat (400, 500)
  - Playfair Display (700)
- Font Awesome CDN for service icons and socials

Acceptance criteria
- Fonts load; fallbacks specified.
- Icons render where referenced.

---

## 8) Documentation

README.md
- Project overview
- Prerequisites and setup
- Scripts (watch/build)
- Folder structure
- How to add a new project (update projectData, add thumbnail, link from portfolio)

Acceptance criteria
- A new contributor can clone, install, run Sass watch, and view the site.

---

## 9) Step-by-Step Implementation Checklist

1) Initialize project and Sass tooling
2) Create folder structure and placeholder files
3) Add main.scss with required import order
4) Implement variables, mixins, base, typography
5) Build header and footer (HTML + SCSS)
6) Implement Hero (background from banner)
7) Implement Client Logo Banner (desktop row + mobile carousel)
8) Implement About, Services, Portfolio, Contact sections
9) Build portfolio/project.html template
10) Add assets/js/portfolio.js with projectData and routing logic
11) Accessibility pass (alts, focus, semantics)
12) Responsive pass (breakpoints)
13) Performance pass (image sizing, loading)
14) Final QA and README

---

Acceptance of this plan will trigger implementation according to the checklist above.
