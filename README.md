# Dean Forant Portfolio Website

Professional portfolio site with a static frontend (Sass → CSS) and two backend runtime options:
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
├── frontend/                 # 🌐 Static website (HTML, CSS, JS, images)
│   ├── assets/
│   ├── index.html
│   ├── robots-prod.txt
│   ├── robots-staging.txt
│   ├── sitemap.xml
│   └── package.json
├── backend/                  # 🚀 Node.js API server (contact form, email)
│   ├── server.js
│   ├── validation.js
│   └── package.json
├── netlify/                  # ⚡ Netlify Functions
│   └── functions/
│       ├── contact.js
│       └── lib/
│           └── validation.js
├── .env.example              # 📝 Environment variables template
├── netlify.toml              # ⚙️ Netlify configuration
├── package.json              # 📦 Monorepo root
└── README.md
```

## 🚀 Features

- **Responsive Design**: Mobile-first approach with modern CSS Grid and Flexbox
- **Interactive Contact Form**: Client + server validation, spam filtering, graceful error handling
- **Email Integration**: SMTP / Gmail fallback with development JSON transport
- **Separated Architecture**: Independent frontend (`/frontend`) & backend (`/backend`)
- **Client Carousel**: Interactive showcase of client logos
- **Process Tabs**: Interactive workflow demonstration
- **Articles/Blog Listing**: Dynamic content listing from WordPress headless CMS with pagination
- **Security**: Helmet, rate limiting, CORS, input sanitization (xss), spam heuristics

## ⚙️ Preconfigured Netlify & SEO behavior

This repo ships with production-grade Netlify config and SEO safeguards baked in:

- Build config: `publish = frontend`, `functions = netlify/functions`, and build command `npm --workspace frontend run build` to compile Sass on deploy.
- API route: `/api/contact` redirected to `/.netlify/functions/contact` via `netlify.toml`.
- Staging no-indexing: For host `staging.deanforantdesigns.com`, all pages send `X-Robots-Tag: noindex, nofollow` and `/robots.txt` resolves to `frontend/robots-staging.txt` (Disallow all).
- Production indexing: Other hosts serve `frontend/robots-prod.txt` (Allow all) and include a `Sitemap: https://www.deanforantdesigns.com/sitemap.xml`. A basic `frontend/sitemap.xml` is included.
- Canonical host: Requests to apex `deanforantdesigns.com` 301-redirect to `https://www.deanforantdesigns.com/`.

## 🔀 Backend Runtime Options (Decision Matrix)

| Use Case | Recommended Mode | Why |
|----------|------------------|-----|
| Fast local development (frontend + function) | Netlify Functions | Same infra as production; zero CORS config |
| Need to debug server middleware deeply | Express Server | Direct control & live reload via nodemon |
| Deploy to Netlify (staging / production) | Netlify Functions | Native build + routing + env management |
| Deploy to cPanel / traditional host | Express Server | Functions unsupported there |

Frontend JS points to one of two API bases (auto or manual override):
- Netlify mode: relative `/api/contact` (rewritten by `netlify.toml`)
- Express mode: `http://localhost:4000/api/contact` (or your production domain)

See sections below for explicit command sets.

---

## 📜 Available npm Scripts (Root + Workspaces)

Run these from the repository root unless a folder column is specified.

| Command | Run From | Purpose |
|---------|----------|---------|
| `npm run install:all` | root | Install dependencies in all workspaces (frontend + backend) |
| `npm run dev:frontend` | root | Start Sass watcher in `frontend/` |
| `npm run dev:backend` | root | Start Express backend (nodemon, port 4000 by default) |
| `npm run dev` | root | Run backend + frontend watchers in parallel (Express path) |
| `npm run build:frontend` | root | Production Sass build (compressed CSS) |
| `npm run sass:watch` | frontend | (Workspace direct) Watch Sass |
| `npm run sass:build` | frontend | (Workspace direct) Build Sass once compressed |
| `npm run dev` | frontend | Alias → watch Sass |
| `npm run dev` | backend | Run nodemon server (port 4000) |
| `npm start` | backend | Run production Express server |

---

## 🧪 Local Development (Two Paths)

### Option A (Recommended): Netlify Functions Local
Use the Netlify CLI to emulate the production environment (static + functions + redirects).

1. Install global tools (first time only):
   ```powershell
   npm install -g netlify-cli
   netlify --version
   netlify login
   ```
2. Install monorepo dependencies (root):
   ```powershell
   npm run install:all
   ```
3. (Optional) Build CSS once OR start a watcher:
   ```powershell
   # One-off build
   npm run build:frontend
   # OR in separate terminal: watcher only
   npm run dev:frontend
   ```
4. Start Netlify dev (run from repository ROOT):
   ```powershell
   netlify dev
   ```
   When prompted (because this repo has multiple workspaces), choose:
   - `dean-forant-portfolio-frontend`
   (That matches the `publish = "frontend"` setting in `netlify.toml`.)

   Skip future prompts (optional):
   ```powershell
   netlify dev --filter=dean-forant-portfolio-frontend
   ```

5. Local URLs:
   - Site: http://localhost:8888
   - Function (direct): http://localhost:8888/.netlify/functions/contact
   - Function (frontend uses via redirect): http://localhost:8888/api/contact

6. Environment variable loading precedence during `netlify dev` (highest → lowest):
   1. Values you export inline before the command (e.g. `SMTP_HOST=foo netlify dev`)
   2. Root `.env` file (if present; good for temporary local creds) – DO NOT commit real secrets
   3. `[build.environment]` in `netlify.toml` (avoid putting secrets here; repo visible)
   4. Netlify UI environment variables (used in actual deploy builds, not auto-fetched for local unless linked and cached)

   Recommended practice:
   - Put production/staging secrets ONLY in Netlify UI
   - Use a gitignored `.env` locally for throwaway or test SMTP creds (e.g., `ENABLE_EMAIL_DEBUG=1`)
   - Leave `netlify.toml` for non-sensitive settings

7. Quick verification after startup:
   1. Open the site (http://localhost:8888)
   2. Open DevTools > Network
   3. Submit form with valid data → expect 200 JSON success
   4. Submit again with a very short description → expect 400 with validation errors
   5. (If no SMTP vars) Check terminal logs for JSON transport output
   6. (If SMTP vars) Confirm email delivered

Troubleshooting:
   - No request logged? Check browser console for JS errors.
   - 500 response? Inspect function log in terminal; verify SMTP creds.
   - Validation 400: Inspect `errors` array to confirm expected rule triggers.

### Option B: Express + Static Frontend
Use this if you want to run the standalone server or you're deploying to a non‑Netlify host later.

1. Install dependencies:
   ```powershell
   npm run install:all
   ```
2. Start backend (root):
   ```powershell
   npm run dev:backend
   ```
   Express listens on http://localhost:4000
3. In a second terminal, watch Sass (root or inside frontend):
   ```powershell
   npm run dev:frontend
   # or (cd frontend; npm run dev)
   ```
4. Serve `frontend/index.html`:
   - Option 1: Use VS Code Live Server (opens on port 5500)
   - Option 2 (quick static):
     ```powershell
     # from frontend folder
     npx serve .
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
| `ENABLE_EMAIL_DEBUG` | Optional | Functions | `1` to print extra logs (use on staging only) |
| `CONTACT_TO` | Optional | Functions | Override recipient address (useful on staging) |
| `CMS_API_URL` | Optional | Articles Function | WordPress CMS API endpoint (default: `http://dfd-cms.local/wp-json/wp/v2`) |
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

## 📰 Articles / Blog Feature

The site includes a dynamic articles listing page that consumes content from a WordPress headless CMS.

### Features
- **WordPress Integration**: Fetches articles from WordPress REST API
- **Pagination**: Displays maximum 10 articles per page with navigation controls
- **Responsive Design**: Mobile-first layout matching portfolio style
- **Smart Fallbacks**: Placeholder images when thumbnails are missing
- **Security**: Rate limiting, input sanitization, and secure API proxy
- **Environment-Aware**: Different API endpoints for local, staging, and production

### Setup Instructions

#### 1. WordPress CMS Setup (Backend)
Set up a WordPress instance as a headless CMS:
1. Install WordPress on your server or use a managed WordPress hosting
2. Install and activate the **Custom Post Type UI** plugin (or similar)
3. Create a custom post type called `article`
4. Enable REST API access for the `article` post type
5. Ensure the REST API is accessible at: `http://your-cms.com/wp-json/wp/v2/article`

#### 2. Local Development
Create a `.env` file in the root directory:
```bash
# Copy from .env.example
cp .env.example .env

# Add your local CMS URL
CMS_API_URL=http://dfd-cms.local/wp-json/wp/v2
```

For local WordPress development:
- Use a tool like **Local by Flywheel**, **XAMPP**, or **Docker**
- Set up a local domain (e.g., `dfd-cms.local`)
- Update your hosts file if needed

#### 3. Staging Environment
In Netlify Dashboard for your staging site:
1. Go to **Site settings** → **Environment variables**
2. Add variable:
   - **Key**: `CMS_API_URL`
   - **Value**: `https://staging-cms.deanforantdesigns.com/wp-json/wp/v2`
3. Redeploy the staging site

#### 4. Production Environment
In Netlify Dashboard for your production site:
1. Go to **Site settings** → **Environment variables**
2. Add variable:
   - **Key**: `CMS_API_URL`
   - **Value**: `https://cms.deanforantdesigns.com/wp-json/wp/v2`
3. Deploy to production

### API Endpoint Configuration

The articles feature uses the Netlify Function proxy pattern:
- Frontend calls: `/api/articles`
- Netlify redirects to: `/.netlify/functions/articles`
- Function proxies to: WordPress CMS (configured via `CMS_API_URL`)

### Security Features
- **Rate Limiting**: 30 requests per minute per IP
- **Input Validation**: All query parameters are sanitized
- **Safe Parameters**: Only allows `page`, `per_page`, `search`, `orderby`, `order`
- **Timeout Protection**: 10-second request timeout
- **Error Handling**: Generic error messages in production (detailed in dev)

### Testing the Articles Page

1. **Local Testing**:
   ```bash
   # Start Netlify dev server
   netlify dev
   
   # Visit the articles page
   # http://localhost:8888/articles.html
   ```

2. **Create Sample Articles** in WordPress:
   - Title: Your article title
   - Content: Your article content
   - Excerpt: Short summary (optional, auto-generated if missing)
   - Featured Image: Upload a thumbnail image
   - Author: Set the author
   - Publish the article

3. **Verify Pagination**:
   - Create more than 10 articles
   - Verify pagination controls appear
   - Test next/previous navigation

### Troubleshooting

**Articles not loading:**
- Check the browser console for errors
- Verify `CMS_API_URL` is set correctly
- Ensure WordPress REST API is accessible
- Check Netlify Function logs for errors

**CORS issues:**
- The Netlify Function acts as a proxy, avoiding CORS
- Ensure you're accessing via `/api/articles` not the WordPress URL directly

**Rate limit errors:**
- Wait 60 seconds and try again
- Check if multiple requests are being made unnecessarily
- Consider increasing rate limits in production if needed

**Images not loading:**
- Ensure WordPress featured images are set
- Placeholder images will show if no image is available
- Check image URLs in WordPress media library

---

## 🧰 Previous Sections (Features, Security, Troubleshooting)
The remainder of this document retains original details with light edits for consistency.

## 🔍 Netlify Function Troubleshooting (Quick Reference)

| Symptom | Likely Cause | Fix |
|---------|--------------|-----|
| 500 + generic message | SMTP timeout / auth error OR CMS API unreachable | Check Functions logs; verify credentials / CMS URL |
| 400 validation | Bad field lengths / pattern | Read `errors` array in JSON response |
| 429 rate limit | Too many requests | Wait 60 seconds; check for request loops |
| No network request | JS error halted submit | Browser console → fix script |
| Works locally not in prod | Missing env var in Netlify | Add in dashboard → redeploy |
| CORS error (Express only) | FRONTEND_URL mismatch | Update `FRONTEND_URL` and restart |
| Articles not loading | CMS_API_URL not set or wrong | Verify env var in Netlify dashboard |

Files relevant to serverless mode:
```
netlify.toml
netlify/functions/contact.js
netlify/functions/articles.js
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
- **Image Optimization**: WebP format where possible
- **CSS**: Minified and compressed
- **JavaScript**: Minified and efficient
- **Fonts**: Optimized loading with font-display: swap

## 📞 Support

For deployment issues or questions:
- Check hosting.com documentation for Node.js hosting
- Review server logs for error messages
- Test locally first to isolate issues
- Contact hosting.com support for server-specific issues

## 📝 Changelog

### v1.2.0 (Current)
- Added Articles/Blog listing page with WordPress headless CMS integration
- Implemented secure API proxy via Netlify Functions for CMS data
- Added pagination support (10 articles per page)
- Implemented rate limiting and input validation for security
- Added responsive article cards with thumbnail support and placeholders
- Updated navigation and footer to include Articles link
- Environment-specific CMS API endpoint configuration
- Comprehensive documentation for setup across all environments

### v1.1.4
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
