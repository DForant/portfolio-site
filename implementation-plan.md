# Implementation Plan: Dean Forant Brand & Web Design Portfolio
**User Story Format**

Based on [.github/copilot-instructions.md](.github/copilot-instructions.md)

---

## Epic: Portfolio Website Development
**As Dean Forant, I want a modern, professional portfolio website that showcases my brand & web design expertise, so potential clients can see my work and contact me easily.**

---

### User Story 1: Project Setup & Structure
**As a developer, I want a properly organized project structure with Sass architecture, so the codebase is maintainable and scalable.**

**Acceptance Criteria:**
- Initialize npm/yarn project with Sass dependency
- Create folder structure matching [.github/copilot-instructions.md](.github/copilot-instructions.md) specification
- Set up Sass compilation from `assets/sass/main.scss` to `assets/css/style.css`
- Implement proper Sass import order (abstracts → base → layout → components → pages)
- Bootstrap CSS loaded before custom styles for proper override capability

**Tasks:**
- Create all required folders and placeholder files
- Initialize package.json with Sass scripts
- Set up main.scss with correct import order
- Configure Bootstrap CDN integration

---

### User Story 2: Design System Foundation
**As a designer, I want consistent colors, typography, and BEM naming conventions, so the site has a professional, cohesive visual identity.**

**Acceptance Criteria:**
- Color palette implemented in Sass variables (Primary Blue #4A6C9B, Accent Gold #FDB813, etc.)
- Google Fonts loaded ('Playfair Display' for headings, 'Montserrat' for body)
- Font Awesome CDN integrated for icons
- All CSS classes follow BEM naming convention
- Typography system established in base styles

**Tasks:**
- Create `_variables.scss` with design tokens
- Set up `_typography.scss` with font families and scales
- Create `_mixins.scss` for reusable patterns
- Establish base reset and typography styles

---

### User Story 3: Global Navigation & Header
**As a visitor, I want a sticky header with clear navigation and prominent CTA, so I can easily access all sections and contact Dean.**

**Acceptance Criteria:**
- Sticky header with Dean Forant logo on left
- Navigation links (Home, About, Services, Portfolio, Contact) on right
- "Let's Talk" CTA button prominently displayed
- Mobile-responsive navigation behavior
- Logo uses available assets from [assets/images](assets/images/)

**Tasks:**
- Create header HTML structure with BEM classes
- Implement `_header.scss` with sticky positioning
- Add mobile navigation toggle functionality
- Style navigation with hover states and accessibility features

---

### User Story 4: Hero Section
**As a visitor, I want an impactful hero section that clearly communicates Dean's value proposition, so I immediately understand what he offers.**

**Acceptance Criteria:**
- Background uses [assets/images/web-banner-80.jpg](assets/images/web-banner-80.jpg) as subtle blueprint pattern
- Headline: "Crafting Your Vision Into A Brand And Web Design That Wins"
- Subheading about 20+ years of experience
- Two CTAs: "View My Work" and "Get In Touch"
- Text content positioned on left side of hero
- Responsive layout for mobile devices

**Tasks:**
- Create hero HTML structure
- Implement background image styling
- Create button components in `_buttons.scss`
- Ensure responsive text positioning

---

### User Story 5: Client Logo Banner
**As a visitor, I want to see reputable client logos, so I trust Dean's experience and credibility.**

**Acceptance Criteria:**
- Headline: "Trusted By Premier Organizations"
- Desktop: Grid view of 5 columns
  - First column is split into 2 rows with the following logo and company name
     - Delta Mechanical Seals logo and name - assets/images/delta-mechanical-seals-80.jpg
     - VelQuest logo and name - assets/images/velquest-80.jpg
  - Second colum is one row with Adfa Healthcare logo and company name - assets/images/agfa-healthcare.jpg
  - third column is a single row with Commonwealth of Ma logo and name
  - fourth column is a single row with BMI logo and name
  - fifth column is a double row with the folowing logos
     - Flash Global - Assets/images/flash-global-80.jpg
     - Specialty Commerce Corp. - assets/images/scc-80.jpg
- Each logo has company name in bold text below
- Mobile: Converts to a carousel with a single logo and company name visible on the screen at a time. 
   - Display Order:
      - Delta Mechanical
      - Velquest
      - Agfa Healthcare
      - Commonwealth Of Ma
      - BMI
      - Flash Global
      - Specialty Commerce Corp 
- Uses existing logo images from [assets/images](assets/images/)

**Tasks:**
- Create client logo HTML structure with proper alt text
- Implement desktop grid layout with centered Commonwealth logo
- Create mobile carousel functionality in `_carousel.scss`
- Add JavaScript for mobile carousel behavior in `main.js`

---

### User Story 6: About Me Section
**As a visitor, I want to learn about Dean's background and process, so I feel confident in his expertise.**

**Acceptance Criteria:**
- Two-column layout: professional photo (left), content (right)
- Headline: "20+ Years of Building Brands That Stand Out"
- Concise biography text
- Brief mention of six-phase methodology
- Responsive layout that stacks on mobile

**Tasks:**
- Create about section HTML with Bootstrap grid integration
- Style two-column layout in `_sections.scss`
- Add placeholder for professional photo
- Implement responsive behavior

---

### User Story 7: Services Section
**As a visitor, I want to see Dean's service offerings clearly presented, so I understand what he can help me with.**

**Acceptance Criteria:**
- Headline: "Services I Provide"
- Grid of 3 service cards
- Font Awesome icons: fa-pen-ruler (Brand Identity), fa-object-group (Web Design), fa-list-check (Creative Direction)
- Each card has icon, title, and description
- Cards use consistent styling and hover effects

**Tasks:**
- Create service cards HTML with BEM classes
- Implement `_cards.scss` with service card variants
- Add Font Awesome icons with proper accessibility attributes
- Create responsive grid layout

---

### User Story 8: Portfolio Section
**As a visitor, I want to browse Dean's featured work, so I can evaluate his design capabilities.**

**Acceptance Criteria:**
- Headline: "Selected Works"
- Modern grid of project cards
- Each card links to dynamic project page with URL parameters
- Example links: `/portfolio/project.html?id=cedarhurst`, `/portfolio/project.html?id=coffeeguild`, `/portfolio/project.html?id=chucklecanvas`
- Hover effects and accessibility features

**Tasks:**
- Create portfolio grid HTML structure
- Style portfolio cards in `_cards.scss`
- Add placeholder images for projects
- Implement card hover effects and transitions

---

### User Story 9: Dynamic Project Page
**As a visitor, I want to view detailed project information, so I can see Dean's work process and results.**

**Acceptance Criteria:**
- Single template file (`portfolio/project.html`) for all projects
- Includes global header and footer
- Required elements: back link, `<h1 id="project-title">`, `<div id="behance-embed-container">`
- JavaScript loads project data based on URL parameter
- Handles invalid IDs with redirect to portfolio section
- Updates document title dynamically

**Tasks:**
- Create `portfolio/project.html` template
- Implement `assets/js/portfolio.js` with project data object
- Add URL parameter reading and project lookup logic
- Handle error cases with proper redirects
- Update page title and content dynamically

---

### User Story 10: Contact Section
**As a visitor, I want to easily contact Dean, so I can start a project discussion.**

**Acceptance Criteria:**
- Headline: "Ready to Win? Let's Build Your Brand."
- Two-column layout: contact info (left), contact form (right)
- Contact form with name, email, message fields
- Proper form validation and accessibility
- Bootstrap form components integrated with custom styling

**Tasks:**
- Create contact section HTML with Bootstrap form components
- Style contact form to match design system
- Add form validation and accessibility features
- Implement responsive layout

---

### User Story 11: Global Footer
**As a visitor, I want a comprehensive footer with links and social media, so I can navigate and connect with Dean.**

**Acceptance Criteria:**
- Three-column layout: logo/tagline, quick links, social media
- Quick links: Home, About, Services, Portfolio, Contact
- Social icons: Facebook, LinkedIn, Behance, Youtube, Github, Instagram
- Sub-footer with centered copyright text
- Uses available logo assets

**Tasks:**
- Create footer HTML structure with Bootstrap grid
- Implement `_footer.scss` with three-column layout
- Add social media icons with proper accessibility
- Style sub-footer with copyright information

---

### User Story 12: Responsive Design & Accessibility
**As a visitor using any device, I want the site to be fully accessible and responsive, so I have a great experience regardless of my device or abilities.**

**Acceptance Criteria:**
- All sections responsive across mobile, tablet, desktop
- Proper semantic HTML5 elements
- Alt text for all images including client logos
- Keyboard navigation support
- Proper color contrast ratios
- Focus indicators for interactive elements

**Tasks:**
- Implement responsive breakpoints across all components
- Add proper ARIA labels and semantic markup
- Test keyboard navigation flow
- Verify color contrast compliance
- Add focus styles for accessibility

---

### User Story 13: Performance & Documentation
**As a developer and site owner, I want optimized performance and clear documentation, so the site loads quickly and is maintainable.**

**Acceptance Criteria:**
- Optimized images and assets
- Efficient CSS compilation
- Clear README with setup instructions
- Documented folder structure and build process
- Browser compatibility testing

**Tasks:**
- Create comprehensive README.md
- Optimize existing images in [assets/images](assets/images/)
- Set up efficient Sass compilation
- Document project structure and development workflow
- Test cross-browser compatibility

---

**Definition of Done:**
- All user stories implemented and tested
- Site is fully responsive and accessible
- Bootstrap integration working with custom CSS overrides
- Dynamic project page functionality working
- All assets properly organized and optimized
- Documentation complete and accurate
