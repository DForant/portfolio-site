## Overview
This is my Web and Brand design business called Dean Forant Designs. The goal is to create a modern, responsive, and accessible website that showcases my work, skills, and experiences. The website will include sections for an about page, contact information, blog posts, and project showcases, as well as a way to book a free consultation call.


## folder structure
- The folder structure should be as follows:
  - `.github/` - contains GitHub-specific files
  - `assets/` - contains static assets like images, fonts, etc.
      - `images/` - contains image files
      - `js/` - contains JavaScript files
      - `css/` - contains CSS files
  - `sass/` - contains Sass files for styling
  - `index.html` - the main entry point of the website
  - `about.html` - an about page
  - `contact.html` - a contact page
  - `blog/` - a directory for blog posts
    - `post1.html` - a sample blog post
    - `post2.html` - another sample blog post
  - `projects/` - a directory for project showcases
    - `project1.html` - a sample project showcase
    - `project2.html` - another sample project showcase
  - `package.json` - contains project dependencies and scripts
  - `README.md` - a readme file for the project
  - `.gitignore` - a file to specify files and directories to ignore in Git
  - `.github/copilot-instructions.md` - contains instructions for GitHub Copilot

## Dependencies
- The project should use the following dependencies:
    - `open-color` - for color manipulation
    - `sass` - for CSS pre-processing
    - `bootstrap` - for responsive design and UI components
    - `strapi` - for content management
    

## website structure
- The website should have the following structure:
  - `index.html` - the main entry point of the website
  - `about.html` - an about page
  - `contact.html` - a contact page
  - `blog/` - a directory for blog posts
    - `post1.html` - a sample blog post
    - `post2.html` - another sample blog post
  - `projects/` - a directory for project showcases
    - `project1.html` - a sample project showcase
    - `project2.html` - another sample project showcase
  - `booking/` - a directory for the booking system
    - `booking.html` - the booking system page 
  - `assets/` - a directory for static assets
    - `css/` - a directory for CSS files
    - `js/` - a directory for JavaScript files
    - `images/` - a directory for image files

## Website Requirements
- The website should be responsive and accessible
- Use semantic HTML5 elements
- Ensure cross-browser compatibility
- Implement a clean and modern design
- Optimize images for web performance
- Use a consistent color scheme and typography
  - Use Open Color for color manipulation
- Implement a navigation menu that is easy to use
   - Navigation menu should include links to Home, About, Contact, Blog, and Projects
- Ensure that the website is optimized for SEO
- Use appropriate meta tags for SEO
- Implement a footer with copyright information and links to social media profiles
- All styles should be written using BEM methodology
- Bootstrap should be used for responsive design and UI components but custom styles should be written in Sass
- Use Open Color for color manipulation and theming
- Use Sanity CMS for content management and blog posts
  Sanity should be used to manage the content of blog posts and project showcases.
  - The CMS should be used to manage the blog posts and project showcases.
  - There should be a seperate admin interface for managing the content of the website.
- Implement a booking system for free consultation calls
  - The booking system should allow users to select a date and time for the consultation call
  - The booking system should work with a calendar API to check availability (integrate with Google Calendar or similar)
  - The booking system should send a confirmation email to the user with the details of the consultation call


## Install dependencies
(TODO) - Get install instructions from the respective package documentation

- Install Sass

``` bash
npm install -g sass
```

- Install Open Color

``` bash
npm install open-color
```
- Make sure to import the Open Color package in your Sass files for color manipulation.
``` scss
@import 'node_modules/open-color/open-color';
```

- Install latest version of Bootstrap from cdn
``` html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.5.2/dist/css/bootstrap.min.css">
```

- Ensure to include the latest Bootstrap JavaScript file in your HTML files for responsive components.
``` html
<script src="https://cdn.jsdelivr.net/npm/bootstrap@4.5.2/dist/js/bootstrap
.bundle.min.js"></script>
```
- Install Strapi


## Webpage Style and layout guidelines
- The page should have a clean and modern layout 
- The top Navbar should have the following links and be responsive:
  - Left side:
    - Home
    - About
    - Contact
    - Blog
    - Projects
  - Right side:
    - a button that with the 904-323-1404 phone number that is clickable and opens the user's default phone app
    - a button that says "Book a Free Consultation Call" that is also clickable and opens a booking system
- The website should have a consistent color scheme and typography
    - Use Open Color for color manipulation and theming
- The website should be responsive and accessible
- The website should use semantic HTML5 elements
- The website should have a footer with the following information:
   - Copyright © 2025 Dean Forant Designs
   - Links to social media profiles (LinkedIn, Twitter, Facebook, Github)
     - get the icons via Font awesome free CDN
     ``` html
     <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css">
     ```    

## Home Page Requirements
- should have a top navigation bar that is responsive
- This navigation bar should be sticky at the top and remain visible when scrolling
- Should have a hero section with a catchy headline and call to action
  - There is the following images in the assets/images directory that can be used for the hero image background:
    - dfd-desktop-1920x720-8-3-aspect.png (for desktop)
    - dfd-mobile-375x667-8-3-aspect.png (for mobile)
  - There is a logo image in the assets/images directory called dfd-logo.png that can be used for the logo. This logo should be placed on top of the hero image so that it is visible and stands out.
    - For the desktop version it should be placed to the left side of the hero image but centered vertically.
    - For the mobile version it should be placed at the top center of the hero image with a margin-top of 20px - 40 px.
- The Hero section should have 2 call to action buttons:
  - One button that says "I don't have a brand and need one" that will go to the brand design services page
  - One button that says "I have a brand and need a website" that will go to the web design services page
  - Above the CTA buttons there should be a short sub headline that says "Let's work together to create something amazing!"
- After the hero section I would like to have a carousel that automatically rotates through a set of images
    - These images will be of the companies that I have worked with
    - There will be 3 images fully visible at a time with one on each side of the container partially visible
    - The carousel should advance automatically every 5 seconds
    - The carousel should have left and right arrows for manual navigation
- Below the carousel there should be a 2 column section that highlights why clients should choose my services. Make this like a comparison to having a custom design versus using a template or a DIY website builder.
- The left column should have a catchy headline like "Why Choose Custom Design?" and a list of benefits of custom design
- The right column should have a catchy headline like "Why Avoid Templates?" and a list of reasons to avoid templates
- Below the 2 column section there should be a section that showcases my latest blog posts
  - This section should have a catchy headline like "Latest Blog Posts"
  - Each blog post should have a title, a short excerpt, and a link to read more
  - The blog posts should be displayed in a grid layout with 3 posts per row
- Below the blog posts section there should be a section that showcases my latest projects
  - This section should have a catchy headline like "Latest Projects"
  - Each project should have a title, a short description, and a link to view more details
  - The projects should be displayed in a grid layout with 3 projects per row
- The footer should have the following information:
   - Copyright © 2025 Dean Forant Designs
   - Links to social media profiles (LinkedIn, Twitter, Facebook, Github)
     - get the icons via Font awesome free CDN
     ``` html
     <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css">

## About Page Requirements
  - The Page should have the same style navigation bar as the home page
  - The hero section should have a catchy headline like "About Dean Forant Designs"
  - The hero section should have a background image that is relevant to the brand
  - The hero section should have a call to action button that says "Get in Touch"
  - Below the hero section there should be a section that introduces me and my background
    - This section should have a catchy headline like "Meet Dean Forant"
    - This section should have a short bio about me and my experience in web and brand design
    - This section should have a professional headshot of me.
  - Below the introduction section there should be a section that showcases my latest projects
    - This section should have a catchy headline like "Latest Projects"
    - Each project should have a title, a short description, and a link to view more details
    - The projects should be displayed in a grid layout with 3 projects per row
    - Limit to only one row. after that there should be a "View All Projects" button that links to the projects page
  - Below the projects section there should be a section that showcases my latest blog posts
    - This section should have a catchy headline like "Latest Blog Posts"
    - Each blog post should have a title, a short excerpt, and a link to read more
    - The blog posts should be displayed in a grid layout with 3 posts per row
    - Limit to only one row. after that there should be a "View All Blog Posts" button that links to the blog page
  - The footer should have the following information:
    - Copyright © 2025 Dean Forant Designs
    - Links to social media profiles (LinkedIn, Twitter, Facebook, Github)
      - get the icons via Font awesome free CDN
      ``` html
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css">

## Contact Page Requirements
  - The Page should have the same style navigation bar as the home page
  - Create a hero section that will have two CTA's
    - One CTA that says "Book a Free Consultation Call" that will open the booking system
    - One CTA that says "Send an Email" that will open the user's default email client with my email address pre-filled
  - Below the hero section there should be a contact form that allows users to send me a message
    - The form should have the following fields:
      - Name (text input)
      - Email (email input)
      - Subject (text input)
      - Message (textarea)
    - The form should have a submit button that says "Send Message"
    - The form should validate the inputs and show an error message if any field is invalid
    - Below the contact form there should be a section that displays my contact information
      - This section should have a catchy headline like "Contact Information"
      - This section should have my email address, phone number, and a link to my social media profiles
  - The footer should have the following information:
    - Copyright © 2025 Dean Forant Designs
    - Links to social media profiles (LinkedIn, Twitter, Facebook, Github)
      - get the icons via Font awesome free CDN
      ``` html
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css">

## Blog Page Requirements
  - The Page should have the same style navigation bar as the home page
  - Create a hero section that will have a catchy headline like "Latest Blog Posts"
  - Below the Hero section we should have a list of the 5 newest blog posts
    - Each blog post should have a title, a short excerpt, and a link to read more
    - The blog posts should be displayed in a grid layout with 3 posts per row
    - A max of 3 rows should be displayed, after that there should be a "View All Blog Posts" button that links to the blog page
    - The blog page should show all the blog posts in a list format with pagination
    - Each blog post should have a title, a short excerpt, and a link to read more
  - The footer should have the following information:
    - Copyright © 2025 Dean Forant Designs
    - Links to social media profiles (LinkedIn, Twitter, Facebook, Github)
      - get the icons via Font awesome free CDN
      ``` html
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css">

## Projects Page Requirements
  - The Page should have the same style navigation bar as the home page
  - Create a hero section that will have a catchy headline like "Latest Projects"
  - Below the Hero section we should have a list of the 5 newest projects
    - Each project should have a title, a short description, and a link to view more details
    - The projects should be displayed in a grid layout with 3 projects per row
    - A max of 3 rows should be displayed, after that there should be a "View All Projects" button that links to the projects page
    - The projects page should show all the projects in a list format with pagination
    - Each project should have a title, a short description, and a link to view more details
  - The footer should have the following information:
    - Copyright © 2025 Dean Forant Designs
    - Links to social media profiles (LinkedIn, Twitter, Facebook, Github)
      - get the icons via Font awesome free CDN
      ``` html
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css">

## Booking System Requirements
- The booking system should allow users to select a date and time for the consultation call
- The booking system should work with a calendar API to check availability (integrate with Google Calendar or similar)
- The booking system should send a confirmation email to the user with the details of the consultation call
- The booking system should have a user-friendly interface that allows users to easily select a date and time
- The booking system should have a confirmation page that shows the details of the consultation call
- The booking system should have a cancellation option that allows users to cancel the consultation call

## Admin Interface Requirements
- The admin interface should be built using Strapi
- The admin interface should allow me to manage the content of the website
- The admin interface should allow me to create, edit, and delete blog posts and project showcases
- The admin interface should allow me to manage the booking system
- The admin interface should have a user-friendly interface that allows me to easily manage the content of the website
- The admin interface should have a dashboard that shows the number of blog posts, projects, and bookings

## Additional Notes
- Ensure that the website is optimized for performance and loading speed
- Use appropriate caching strategies for static assets
- All images are located in `assets/images`
- There is a figma design file that can be used as a reference for the design and layout of the website as well as the color scheme and typography