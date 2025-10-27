# Dean Forant Portfolio Website

Professional portfolio site built with **React + Vite** frontend and backend runtime options:
1. Netlify Functions (primary / recommended)
2. Stand‑alone Express server (optional / alternative hosting)

This README focuses on crystal‑clear, copy‑paste friendly steps for:
- Local development & testing
- Staging (draft) deployments on Netlify
- Production deployments on Netlify
- Optional Express (cPanel / VPS) deployment

If you previously read older guides, treat this as the source of truth.

## 🏗️ Project Architecture & Folders

Monorepo using npm workspaces.

```
portfolio-site/
├── frontend/                 # ⚛️ React + Vite SPA
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/           # Page components (Home, Articles)
│   │   ├── hooks/           # Custom React hooks
│   │   └── main.jsx         # App entry point
│   ├── assets/
│   │   ├── sass/            # Sass stylesheets
│   │   └── images/          # Source images
│   ├── public/              # Static assets (copied to dist)
│   │   └── assets/images/   # Images for production
│   ├── dist/                # Build output (gitignored)
│   ├── index.html           # HTML template
│   ├── vite.config.js       # Vite configuration
│   └── package.json
├── backend/                  # 🚀 Node.js API server (contact form, email)
│   ├── server.js
│   ├── validation.js
│   └── package.json
├── netlify/                  # ⚡ Netlify Functions
│   └── functions/
│       ├── contact.js
│       ├── articles.js
│       └── lib/
│           └── validation.js
├── .env.example              # 📝 Environment variables template
├── netlify.toml              # ⚙️ Netlify configuration
├── package.json              # 📦 Monorepo root
└── README.md
```

## 🚀 Features

- **React SPA**: Modern React application with client-side routing
- **Vite Build Tool**: Lightning-fast HMR and optimized production builds
- **React Router**: Client-side routing with smooth hash navigation
- **Responsive Design**: Mobile-first approach with modern CSS Grid and Flexbox
- **Interactive Contact Form**: React state management with client + server validation
- **Email Integration**: SMTP / Gmail fallback with development JSON transport
- **Articles Listing Page**: Paginated list of articles from WordPress CMS with secure API proxy
- **Separated Architecture**: Independent frontend (`/frontend`) & backend (`/backend`)
- **Client Carousel**: Interactive React component with touch gestures and autoplay
- **Process Tabs**: Interactive workflow demonstration with React state
- **Security**: Helmet, rate limiting, CORS, input sanitization (xss), spam heuristics

## ⚙️ Preconfigured Netlify & SEO behavior

This repo ships with production-grade Netlify config and SEO safeguards baked in:

- Build config: `publish = frontend/dist`, `functions = netlify/functions`, and build command `npm --workspace frontend run build` to run Vite build on deploy.
- API routes: `/api/contact` redirected to `/.netlify/functions/contact` and `/api/articles` redirected to `/.netlify/functions/articles` via `netlify.toml`.
- SPA routing: Client-side routing with fallback to `/index.html` for deep links.
- Staging no-indexing: For host `staging.deanforantdesigns.com`, all pages send `X-Robots-Tag: noindex, nofollow` and `/robots.txt` resolves to `robots-staging.txt` (Disallow all).
- Production indexing: Other hosts serve `robots-prod.txt` (Allow all) and include a `Sitemap: https://www.deanforantdesigns.com/sitemap.xml`. A basic `sitemap.xml` is included.
- Canonical host: Requests to apex `deanforantdesigns.com` 301-redirect to `https://www.deanforantdesigns.com/`.

## 🔀 Backend Runtime Options (Decision Matrix)

| Use Case | Recommended Mode | Why |
|----------|------------------|-----|
| Fast local development (frontend + function) | Netlify Functions | Same infra as production; zero CORS config |
| Need to debug server middleware deeply | Express Server | Direct control & live reload via nodemon |
| Deploy to Netlify (staging / production) | Netlify Functions | Native build + routing + env management |
| Deploy to cPanel / traditional host | Express Server | Functions unsupported there |

Frontend React app calls:
- Netlify mode: relative `/api/contact` (rewritten by `netlify.toml`)
- Express mode: `http://localhost:4000/api/contact` (or your production domain)

See sections below for explicit command sets.

---

## 📜 Available npm Scripts (Root + Workspaces)

Run these from the repository root unless a folder column is specified.

| Command | Run From | Purpose |
|---------|----------|---------|
| `npm run install:all` | root | Install dependencies in all workspaces (frontend + backend) |
| `npm run dev:frontend` | root | Start Vite dev server in `frontend/` (port 3000) |
| `npm run dev:backend` | root | Start Express backend (nodemon, port 4000 by default) |
| `npm run dev` | root | Run backend + Vite dev server in parallel |
| `npm run build:frontend` | root | Production Vite build (optimized bundle to `frontend/dist`) |
| `npm run preview:frontend` | root | Preview production build locally (port 4173) |
| `npm run dev` | frontend | (Workspace direct) Start Vite dev server |
| `npm run build` | frontend | (Workspace direct) Build for production |
| `npm run preview` | frontend | (Workspace direct) Preview production build |
| `npm run dev` | backend | Run nodemon server (port 4000) |
| `npm start` | backend | Run production Express server |

---

## 🧪 Local Development (Two Paths)

### Option A (Recommended): Netlify Functions Local
Use the Netlify CLI to emulate the production environment (React SPA + functions + redirects).

1. Install global tools (first time only):
   ```bash
   npm install -g netlify-cli
   netlify --version
   netlify login
   ```

2. Install monorepo dependencies (root):
   ```bash
   npm run install:all
   ```

3. Start Netlify dev (run from repository ROOT):
   ```bash
   netlify dev
   ```
   
   Netlify dev will automatically:
   - Start Vite dev server on port 3000 (with HMR for React)
   - Proxy it through port 8888
   - Enable Netlify Functions
   - Apply redirects and routing rules

4. Local URLs:
   - Site: http://localhost:8888 (proxies to Vite on 3000)
   - Vite HMR: Automatic - changes appear instantly
   - Function (direct): http://localhost:8888/.netlify/functions/contact
   - Function (frontend uses via redirect): http://localhost:8888/api/contact
   - React Router: All client-side routes work (/, /articles)

5. Environment variable loading precedence during `netlify dev` (highest → lowest):
   1. Values you export inline before the command (e.g. `SMTP_HOST=foo netlify dev`)
   2. Root `.env` file (if present; good for temporary local creds) – DO NOT commit real secrets
   3. `[build.environment]` in `netlify.toml` (avoid putting secrets here; repo visible)
   4. Netlify UI environment variables (used in actual deploy builds, not auto-fetched for local unless linked and cached)

   Recommended practice:
   - Put production/staging secrets ONLY in Netlify UI
   - Use a gitignored `.env` locally for throwaway or test SMTP creds (e.g., `ENABLE_EMAIL_DEBUG=1`)
   - Leave `netlify.toml` for non-sensitive settings

6. Quick verification after startup:
   1. Open the site (http://localhost:8888)
   2. React app should load with full navigation
   3. Open DevTools > Network
   4. Test navigation: Click "Articles" link → should route client-side
   5. Test hash navigation: Click "Services" → should smooth scroll
   6. Submit contact form with valid data → expect 200 JSON success
   7. Submit form with short description → expect 400 with validation errors
   8. Visit /articles page → should load article list from API

Troubleshooting:
   - Vite not starting? Check if port 3000 is available
   - No HMR? Refresh browser or restart netlify dev
   - React errors? Check browser console for component errors
   - 500 response? Inspect function log in terminal; verify SMTP creds
   - Validation 400: Inspect `errors` array to confirm expected rule triggers

### Option B: Express + Vite Dev Server
Use this if you want to run the standalone server or you're deploying to a non‑Netlify host later.

1. Install dependencies:
   ```bash
   npm run install:all
   ```

2. Start backend (root):
   ```bash
   npm run dev:backend
   ```
   Express listens on http://localhost:4000

3. In a second terminal, start Vite dev server:
   ```bash
   npm run dev:frontend
   ```
   Vite dev server runs on http://localhost:3000 with HMR

4. Access the site:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:4000/api/contact
   
   The React app is configured to detect localhost development and will automatically call the Express server at localhost:4000 for API requests.

5. Quick verification:
   - Visit http://localhost:3000
   - React app loads with full navigation
   - Form submission hits Express server
   - Changes to React components hot-reload instantly
     ```
5. Confirm API is reachable: `curl http://localhost:4000/api/contact/health` (if such health route added) or submit form.

Frontend script should point to `http://localhost:4000/api/contact` in this mode (update logic in `frontend/assets/js/main.js` if needed).

---

## 🌱 Environment Variables (All Modes)

Define in Netlify UI (recommended) or `.env` for Express local development.

| Variable | Required? | Used By | Notes |
|----------|-----------|---------|-------|
| `SMTP_HOST` | Optional (fallback to JSON transport) | Email | Real SMTP strongly recommended in prod |
| `SMTP_PORT` | If SMTP used | Email | 465 (SSL) or 587 (TLS) |
| `SMTP_USER` | If SMTP used | Email | Auth username |
| `SMTP_PASS` | If SMTP used | Email | Auth password |
| `EMAIL_USER` | Optional | Gmail fallback | Only if using Gmail transport |
| `EMAIL_PASS` | Optional | Gmail fallback | Gmail App Password |
| `WP_API_BASE_URL` | Optional | Articles Function | WordPress API endpoint (default: `http://dfd-cms.local/wp-json/wp/v2`) |
| `ENABLE_EMAIL_DEBUG` | Optional | Functions | `1` to print extra logs (use on staging only) |
| `ENABLE_API_DEBUG` | Optional | Functions | `1` to print API request logs (use on staging only) |
| `CONTACT_TO` | Optional | Functions | Override recipient address (useful on staging) |
| `NODE_VERSION` | Optional | Build/Functions | Pin Node engine on Netlify (e.g., `20`) |
| `NODE_ENV` | Yes (prod) | All | `production` enables optimizations |
| `PORT` | Express only | Express | Default 4000 locally (if not set) |
| `FRONTEND_URL` | Express CORS | Express | Comma separated origins |
| `APP_PATH` | Path-based hosting alt | Express prod (cPanel) | See advanced section |

`.env.example` in the repository root is the reference for Express mode.

---

## 🧪 Testing Matrix per Environment

| Test | Local (Netlify) | Local (Express) | Staging Draft | Production |
|------|-----------------|-----------------|---------------|------------|
| Form valid submission | ✅ | ✅ | ✅ | ✅ |
| Validation errors (short msg) | ✅ | ✅ | ✅ | ✅ |
| Spam phrase blocked | ✅ | ✅ | ✅ | ✅ |
| SMTP success (if configured) | ✅ | ✅ | ✅ | ✅ |
| Fallback JSON transport | ✅ | ✅ | ✅ | ✅ |
| CORS headers correct | N/A (same origin) | ✅ | ✅ | ✅ |
| Document title / UI loads | ✅ | ✅ | ✅ | ✅ |

---

## 🚀 Deploying to Netlify

### 0. One-Time Setup
From repo root:
```powershell
netlify login
netlify init
```
Prompts:
- Choose existing site OR create new
- Build command: (leave blank)
- Publish directory: `frontend`
- Functions directory (auto from `netlify.toml` if present) or enter: `netlify/functions`

### 1. Staging / Preview Deploy (Draft URL)
Used for QA before promoting to production.
```powershell
# From repo root
netlify deploy --build
```
Output will include:  
Draft URL: `https://<hash>--<yoursite>.netlify.app`

Smoke test on draft URL: navigate to site → submit test form.

Indexing on staging:
- If you deploy the staging site to `staging.deanforantdesigns.com` (recommended), Netlify config already sets:
   - `X-Robots-Tag: noindex, nofollow` for all pages on that host
   - `/robots.txt` → `robots-staging.txt` (Disallow all)
   No manual toggles are needed between environments.

### 2. Production Deploy
```powershell
netlify deploy --prod --build
```
Production URL: `https://<yoursite>.netlify.app` (or custom domain if attached).

Indexing on production:
- Production hosts serve `robots-prod.txt` (Allow) and `frontend/sitemap.xml`.
- Apex requests are redirected to `https://www.deanforantdesigns.com/` to enforce canonical URLs.

### 3. Updating Environment Variables
Netlify Dashboard → Site Settings → Build & Deploy → Environment.  
Edit variables → Trigger new production deploy:
```powershell
netlify deploy --prod --build
```

### 4. Local Emulation Notes
`netlify dev` respects `.env` at project root IF `NETLIFY_DEV` loads them. If you need local secrets, create a non‑committed `.env` (gitignored) with the same keys.

### 5. Logs & Debugging
Functions logs (UI): Deploys → Functions → `contact`  
CLI (while running dev): output appears inline when invoking the function.

---

## ✅ Post-Deploy Verification Checklist (Netlify)

Run this after each staging & production deploy:
1. Page loads without console errors
2. Fonts & images load (no 404s)
3. Form:
   - Valid submission returns success message
   - Intentionally short description triggers validation error
   - Spam phrase (e.g. "win bitcoin now") rejected
4. Email arrives (if SMTP configured) OR JSON transport log visible in function logs
5. Responsive layout OK (mobile width ≤ 420px)
6. Lighthouse performance > 90 (optional)
7. Indexing behavior:
   - Staging: https://staging.deanforantdesigns.com/robots.txt → `Disallow: /`; pages include `X-Robots-Tag: noindex, nofollow`
   - Production: https://www.deanforantdesigns.com/robots.txt → `Allow: /`; https://www.deanforantdesigns.com/sitemap.xml loads

---

## 🧵 Optional: Express Deployment (cPanel / VPS)

If not using Netlify for backend logic, deploy the Express server. Summary (full details previously in `DEPLOYMENT.md`):

1. Place frontend static files under hosting `public_html/` (or serve with Nginx/Apache).
2. Place backend code outside public root (e.g. `~/portfolio-api/`).
3. Install dependencies on server:
   ```bash
   cd ~/portfolio-api
   npm install --production
   ```
4. Create `.env` (see variable table). Include `FRONTEND_URL` with all allowed domains.
5. Path-based app? Set `APP_PATH=api` and prefix routes using logic:
   ```js
   const routePrefix = process.env.APP_PATH ? `/${process.env.APP_PATH}` : '';
   app.post(`${routePrefix}/api/contact/submit`, handler);
   ```
6. Subdomain setup (preferred): point `api.yourdomain.com` → app; leave `APP_PATH` unset.
7. Use a process manager (Passenger/cPanel, PM2, systemd) to keep app running.

Health check endpoints (add if needed):
```js
app.get(`${routePrefix}/api/health`, (_,res)=>res.json({ok:true,timestamp:Date.now()}));
```

Frontend JS base URL examples:
```js
// Path based
const apiBase = 'https://yourdomain.com/api'; // becomes /api/contact/submit
// Subdomain
const apiBase = 'https://api.yourdomain.com';
```

---

## 🧰 Previous Sections (Features, Security, Troubleshooting)
The remainder of this document retains original details with light edits for consistency.

## 🔍 Netlify Function Troubleshooting (Quick Reference)

| Symptom | Likely Cause | Fix |
|---------|--------------|-----|
| 500 + generic message | SMTP timeout / auth error | Check Functions logs; verify credentials |
| 400 validation | Bad field lengths / pattern | Read `errors` array in JSON response |
| No network request | JS error halted submit | Browser console → fix script |
| Works locally not in prod | Missing env var in Netlify | Add in dashboard → redeploy |
| CORS error (Express only) | FRONTEND_URL mismatch | Update `FRONTEND_URL` and restart |

Files relevant to serverless mode:
```
netlify.toml
netlify/functions/contact.js
netlify/functions/lib/validation.js
```

---

## 🛠️ Quick Start (Condensed)

```powershell
# Clone & install
git clone <repo>
cd portfolio-site
npm run install:all

# Local (Netlify mode)
netlify dev

# OR Local (Express mode)
npm run dev

# Build CSS only
npm run build:frontend

# Draft deploy (staging)
netlify deploy --build

# Production deploy
netlify deploy --prod --build
```

## 🌐 (Alternative) Production Deployment – Static Only Providers

If you move to a provider that can host only static files (no Node runtime):
1. Deploy `frontend/` only.
2. Replace form with third‑party solution:
   - Formspree
   - Netlify Forms
   - EmailJS (client key)
3. Remove or disable JS that calls `/api/contact`.

Example (Formspree):
```html
<form class="contact__form" action="https://formspree.io/f/YOUR_FORM_ID" method="POST">
```

## 🔧 (Supplement) Environment Variables Table (Express Recap)

| Variable | Description | Example |
|----------|-------------|---------|
| `SMTP_HOST` | Email server hostname | `mail.deanforantdesigns.com` |
| `SMTP_PORT` | Email server port | `465` |
| `SMTP_USER` | Email username | `dean@deanforantdesigns.com` |
| `SMTP_PASS` | Email password | `your_secure_password` |
| `PORT` | Express server port | `4000` |
| `NODE_ENV` | Env mode | `production` |
| `FRONTEND_URL` | Allowed origins (CORS) | `https://example.com,https://www.example.com` |
| `APP_PATH` | (Optional) Path base prefix | `api` |

Netlify Functions ignore `PORT`/`FRONTEND_URL` (handled internally) but still require email credentials if you want real delivery.

## 📧 Email Configuration Details

The contact form sends emails using SMTP (preferred) or Gmail fallback:

- **Primary email**: Sent to dean@deanforantdesigns.com
- **Auto-reply**: Currently disabled (can be added in `backend/server.js`)
- **Spam detection**: Keyword + heuristic scoring
- **Rate limiting**: 10 submissions / 15 min / IP (config in backend)
- **Validation**: Shared express-validator rules + client-side checks

### Email Template

The system sends HTML emails with:
- Professional styling
- Form data summary
- Timestamp and reference
- Responsive design

## 📰 Articles Listing Feature

The articles page (`/articles.html`) displays blog content from a WordPress CMS via a secure API proxy:

### How It Works

1. **Frontend Page**: Visit `/articles.html` to view the articles listing
2. **API Proxy**: JavaScript calls `/api/articles` which proxies to WordPress REST API
3. **WordPress CMS**: Content is managed in WordPress and served via the REST API
4. **Pagination**: Display up to 10 articles per page with navigation controls

### Security Features

- **Input Validation**: Page and per_page parameters are validated and sanitized
- **XSS Protection**: All article content is sanitized before display
- **Timeout Protection**: API requests timeout after 10 seconds
- **Rate Limiting**: Netlify Functions automatically rate limit requests
- **Error Handling**: Graceful fallback for API failures

### Configuration

Set the WordPress API endpoint via environment variable:

```bash
# Local development
WP_API_BASE_URL=http://dfd-cms.local/wp-json/wp/v2

# Production
WP_API_BASE_URL=https://your-production-cms.com/wp-json/wp/v2
```

Add this to:
- `.env` file for local development
- Netlify UI → Site Settings → Environment Variables for deployed sites

### Article Display

Each article card shows:
- **Thumbnail**: Featured image or placeholder if none exists
- **Title**: Article headline
- **Date**: Publication date in readable format
- **Author**: Article author name
- **Excerpt**: Brief preview (3 lines max)
- **Read More Button**: Links to the full article on WordPress

### Testing

1. Ensure WordPress REST API is accessible
2. Test with: `curl http://dfd-cms.local/wp-json/wp/v2/posts`
3. Visit `/articles.html` locally via `netlify dev`
4. Test pagination with multiple articles

## 🛡️ Security Features

- **Helmet.js**: Security headers
- **CORS**: Cross-origin request protection
- **Rate limiting**: Prevents spam submissions
- **Input validation**: Server-side validation with express-validator
- **Spam detection**: Keyword-based spam filtering
- **Content Security Policy**: XSS protection

## 🐛 Troubleshooting

### Contact Form Issues

1. **Form shows network error:**
   - Check if server is running
   - Verify API endpoint URL
   - Check browser console for errors

2. **Emails not sending:**
   - Verify SMTP credentials in `.env`
   - Check server logs for authentication errors
   - Confirm email server allows connections from hosting IP

3. **Form validation not working:**
   - Ensure JavaScript is enabled
   - Check for console errors
   - Verify form field IDs match JavaScript

### Server Issues

1. **Server won't start:**
   - Check Node.js version compatibility
   - Verify all dependencies are installed
   - Check for syntax errors in server.js

2. **Port conflicts:**
   - Use different port in `.env`
   - Check if port is available with `netstat`

## 📱 Browser Support

- Chrome (last 2 versions)
- Firefox (last 2 versions)
- Safari (last 2 versions)
- Edge (last 2 versions)
- Mobile browsers (iOS Safari, Chrome Mobile)

## 🚀 Performance

- **Lighthouse Score**: Optimized for 90+ scores
- **Vite Build**: Code splitting and tree-shaking for optimal bundle size
- **React**: Component-based architecture with efficient updates
- **Image Optimization**: WebP format where possible
- **CSS**: Sass compiled and minified via Vite
- **JavaScript**: Minified and compressed bundles
- **Fonts**: Optimized loading with font-display: swap

## 📞 Support

For deployment issues or questions:
- Check Netlify documentation for deployment issues
- Review browser console for React errors
- Check Vite documentation for build issues
- Review server logs for backend errors
- Test locally first to isolate issues

## 📝 Changelog

### v2.0.0 (Current - React + Vite Migration)
- **React Migration**: Converted entire frontend from vanilla JavaScript to React
- **Vite Build Tool**: Replaced Sass-only build with Vite for lightning-fast HMR
- **Component Architecture**: Created modular React components for all sections
- **React Router**: Implemented client-side routing (/, /articles, /articles.html)
- **Custom Hooks**: Added useScrollToHash for smooth navigation
- **State Management**: React state for forms, carousels, tabs, and articles
- **Touch Gestures**: Enhanced carousel with React-based touch event handling
- **Form Handling**: React-controlled forms with real-time validation
- **Build Output**: Changed from `frontend/` to `frontend/dist/` for production
- **Dev Experience**: Hot Module Replacement (HMR) for instant updates during development
- **Backward Compatibility**: Maintains all existing functionality and APIs

### v1.1.4
- **Articles Listing Page**: Added `/articles.html` page displaying blog posts from WordPress CMS
- **Articles API Function**: Secure Netlify Function (`/api/articles`) that proxies WordPress REST API
- **Pagination**: Supports up to 10 articles per page with prev/next navigation
- **Security**: Input validation, XSS sanitization, request timeout protection
- **Responsive Design**: Mobile-optimized article cards with thumbnails and excerpts
- **Environment Configuration**: `WP_API_BASE_URL` environment variable for easy endpoint switching
- Updated monorepo structure with npm workspaces
- Refined Netlify Functions configuration with esbuild bundler
- Improved environment variable handling
- Documentation updates and clarifications

### v1.1.0
- Rebuilt contact form (first/last name, company, phone, email, services, description)
- Added backend Express API (`/api/contact`) with validation + spam filtering
- Added XSS sanitization and JSON transport fallback for dev
- Updated README and architecture docs

### v1.0.0
- Initial release with basic contact form functionality
- Professional email templates
- Responsive design
- Security implementations
- Client carousel and process tabs

---

**Note**: Replace placeholder values (like email passwords and API keys) with actual production values when deploying.
