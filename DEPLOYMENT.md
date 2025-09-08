# 🚀 Separated Frontend/Backend Deployment Guide

## 📁 New Project Structure

```
portfolio-site/
├── frontend/                 # Static website files
│   ├── assets/
│   │   ├── css/
│   │   ├── images/
│   │   ├── js/
│   │   └── sass/
│   ├── index.html
│   └── package.json         # SASS compilation only
├── backend/                 # Node.js API server
│   ├── server.js
│   ├── package.json         # Node.js dependencies
│   ├── .env
│   └── .env.example
├── README.md
└── DEPLOYMENT.md
```

## 🎯 Deployment Strategy

### **Option 1: Both on hosting.com (Recommended)**

#### **Frontend Deployment (Static Files)**
1. **Upload Location**: Main domain document root (`public_html/`)
2. **Files to Upload**:
   ```
   public_html/
   ├── assets/
   ├── index.html
   └── (other static files)
   ```

#### **Backend Deployment (Node.js App)**
1. **Setup Location**: Use Node.js App in cPanel
2. **Configuration**:
   ```
   Application root: portfolio-api
   Application URL: api (for path-based) OR https://api.deanforantdesigns.com (for subdomain)
   Startup file: server.js
   ```

**Important**: According to hosting.com documentation:
- **Application root path**: `/home/username/portfolio-api` (NOT inside `public_html/`)
- **Typical locations**: `/home/username/appname` or `/home/username/apps/appname`
- **DO NOT** put the application root inside the domain document root (`public_html/`)

### **Application URL Options:**

#### **Option A: Path-based (Simpler setup)**
- **Application URL field**: `api`
- **Your API accessible at**: `https://deanforantdesigns.com/api`
- **No subdomain creation needed**
- **Your contact form will call**: `https://deanforantdesigns.com/api/contact/submit`

#### **Option B: Subdomain (Better separation)**
- **Application URL field**: `https://api.deanforantdesigns.com`
- **Your API accessible at**: `https://api.deanforantdesigns.com`
- **Requires creating subdomain in cPanel first**
- **Your contact form will call**: `https://api.deanforantdesigns.com/api/contact/submit`

**⚠️ Critical**: Whatever you choose, you must update your routes in `server.js` to include the path!

**File Manager Structure**:
```
/home/username/
├── public_html/           # Frontend files go here
│   ├── assets/
│   ├── index.html
│   └── ...
├── portfolio-api/         # Backend files go here (separate directory)
│   ├── server.js
│   ├── package.json
│   ├── .env
│   └── node_modules/
└── ...
```

### **Option 2: Separate Hosting**

#### **Frontend**: hosting.com (Static hosting)
- Upload `frontend/` contents to `public_html/`
- No Node.js required

#### **Backend**: hosting.com Node.js App or separate service
- Deploy `backend/` as Node.js application
- Configure subdomain: `api.deanforantdesigns.com`

## � File Manager Setup Instructions

### **Where to Place Your Backend Code**

Based on hosting.com documentation, here's exactly where to place your files:

#### **Step 1: Access File Manager**
1. Log into cPanel
2. Go to **Files** → **File Manager**

#### **Step 2: Navigate to Correct Directory**
- **DO NOT** upload backend files to `public_html/` 
- Navigate to your **home directory**: `/home/yourusername/`
- This is typically the root directory when you first open File Manager

#### **Step 3: Create Backend Application Directory**
1. In your home directory (`/home/yourusername/`), create a new folder:
   ```
   portfolio-api
   ```
2. This folder should be at the same level as `public_html/`, NOT inside it

#### **Step 4: Upload Backend Files**
Upload all files from your local `backend/` directory to `/home/yourusername/portfolio-api/`:
- `server.js`
- `package.json`
- Any other backend files

#### **Step 5: Upload Frontend Files**
Upload all files from your local `frontend/` directory to `/home/yourusername/public_html/`:
- `index.html`
- `assets/` folder
- All other frontend files

#### **Final File Structure in File Manager**
```
/home/yourusername/
├── public_html/           # ← Frontend files (your website)
│   ├── assets/
│   │   ├── css/
│   │   ├── images/
│   │   └── js/
│   ├── index.html
│   └── ...
├── portfolio-api/         # ← Backend files (Node.js app)
│   ├── server.js
│   ├── package.json
│   ├── .env
│   └── node_modules/      (created after npm install)
├── logs/
├── mail/
└── tmp/
```

## �🛠️ Step-by-Step Deployment

### **Step 1: Prepare Frontend**


**Upload to hosting.com:**
- Copy contents of `frontend/` to `public_html/`
- Ensure `index.html` is in root

### **Step 2: Prepare Backend**

```bash
# In backend directory
cd backend/
npm install --production
```

**Upload to hosting.com:**
1. **Create Node.js App in cPanel**:
   ```
   Node.js version: 18.x (or latest available)
   Application mode: Production
   Application root: portfolio-api
   Application URL: https://api.deanforantdesigns.com (or subdirectory)
   Application startup file: server.js
   ```

2. **File Placement in File Manager**:
   - Navigate to `/home/username/` (your home directory)
   - **Create folder**: `portfolio-api` (this will be your Node.js app directory)
   - **Upload your backend files to**: `/home/username/portfolio-api/`
   
   **Directory structure in File Manager**:
   ```
   /home/username/
   ├── public_html/           # Your frontend files
   │   ├── assets/
   │   ├── index.html
   │   └── ...
   ├── portfolio-api/         # Your backend files (Node.js app)
   │   ├── server.js          # Main application file
   │   ├── package.json       # Dependencies
   │   ├── .env              # Environment variables
   │   └── (other backend files)
   └── ...
   ```

3. **Environment Variables**:
   ```
   NODE_ENV=production
   PORT=3000
   SMTP_HOST=mail.deanforantdesigns.com
   SMTP_PORT=465
   SMTP_USER=dean@deanforantdesigns.com
   SMTP_PASS=your_password
   FRONTEND_URL=https://deanforantdesigns.com,https://www.deanforantdesigns.com
   ```

   **Note**: `FRONTEND_URL` now supports multiple comma-separated URLs for CORS origins.
   This allows your backend to accept requests from multiple frontend domains if needed.

4. **Upload Files to File Manager**:
   - Use cPanel File Manager
   - Navigate to your home directory (not `public_html/`)
   - Create the `portfolio-api` folder
   - Upload all files from your local `backend/` directory:
     ```
     ~/portfolio-api/
     ├── server.js
     ├── package.json
     ├── .env
     └── (any other backend files)
     ```

## ⚠️ **CRITICAL: Update Your Server Routes for hosting.com**

hosting.com uses **Phusion Passenger** which requires your routes to include the Application URL path. You MUST update your `server.js` file:

### **For Path-based Setup (Application URL: `api`)**

**Current routes in your server.js:**
```javascript
// ❌ This won't work on hosting.com
app.get('/api/health', (req, res) => {...});
app.post('/api/contact/submit', (req, res) => {...});
```

**Must be changed to:**
```javascript
// ✅ This will work on hosting.com
app.get('/api/api/health', (req, res) => {...});
app.post('/api/api/contact/submit', (req, res) => {...});
```

**Why?** Because your app runs at `/api`, so routes become `/api` + `/api/health` = `/api/api/health`

### **For Subdomain Setup (Application URL: `https://api.deanforantdesigns.com`)**

**Your current routes will work as-is:**
```javascript
// ✅ This will work with subdomain
app.get('/api/health', (req, res) => {...});
app.post('/api/contact/submit', (req, res) => {...});
```

### **Recommended Approach: Environment-Based Routes**

Add this to your `server.js` to handle both local development and production:

```javascript
// Environment-based route prefix
const routePrefix = process.env.NODE_ENV === 'production' && process.env.APP_PATH 
  ? `/${process.env.APP_PATH}` 
  : '';

// Routes with dynamic prefix
app.get(`${routePrefix}/api/health`, (req, res) => {
    res.json({ status: 'OK', message: 'Server is running' });
});

app.post(`${routePrefix}/api/contact/submit`, [/* your middleware */], async (req, res) => {
    // Your contact form logic
});
```

**Add to your `.env` file:**
```bash
# For path-based setup
APP_PATH=api

# For subdomain setup (leave empty)
# APP_PATH=
```

### **Step 3: DNS Configuration (if using subdomain)**

**For `api.deanforantdesigns.com`:**
1. **In hosting.com DNS settings**:
   ```
   Type: CNAME
   Name: api
   Value: deanforantdesigns.com
   ```

2. **Or create subdomain in cPanel**

### **Step 4: Test Deployment**

1. **Frontend**: `https://deanforantdesigns.com`
2. **Backend Health Check**: `https://api.deanforantdesigns.com/api/health`
3. **Contact Form**: Submit test form

## 🔧 Local Development Setup

### **Environment Configuration**
For local development, create/update `backend/.env`:
```bash
# Backend environment variables for local development
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://127.0.0.1:5500,http://localhost:5500,http://localhost:3000

# Email configuration (use your actual SMTP settings)
SMTP_HOST=mail.deanforantdesigns.com
SMTP_PORT=465
SMTP_USER=dean@deanforantdesigns.com
SMTP_PASS=your_password
```

### **Backend Development**
```bash
cd backend/
npm install
npm run dev
# Server runs on http://localhost:3000
```

### **Frontend Development**
```bash
cd frontend/
npm install
npm run sass:watch
# Serve with live server or similar
```

## 🌐 API Endpoint Configuration

The frontend automatically detects environment and must match your hosting.com setup:

### **Local Development:**
- **Backend URL**: `http://localhost:3000/api/contact/submit`

### **Production (Path-based - Application URL: `api`):**
- **Backend URL**: `https://deanforantdesigns.com/api/api/contact/submit`
- **Note**: Double `/api` is required due to hosting.com's Passenger routing

### **Production (Subdomain - Application URL: `https://api.deanforantdesigns.com`):**
- **Backend URL**: `https://api.deanforantdesigns.com/api/contact/submit`

### **Frontend JavaScript Update Required:**

Update your `frontend/assets/js/main.js` file to match your chosen setup:

**For Path-based setup:**
```javascript
const isLocalDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const apiBaseUrl = isLocalDev 
  ? 'http://localhost:3000' 
  : 'https://deanforantdesigns.com/api';  // Note: /api path
```

**For Subdomain setup:**
```javascript
const isLocalDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const apiBaseUrl = isLocalDev 
  ? 'http://localhost:3000' 
  : 'https://api.deanforantdesigns.com';  // Subdomain URL
```

## 🔗 CORS Configuration

The backend now uses a flexible CORS system that reads allowed origins from environment variables:

### **Environment Variable Format**
```bash
# Single origin
FRONTEND_URL=https://deanforantdesigns.com

# Multiple origins (comma-separated)
FRONTEND_URL=https://deanforantdesigns.com,https://www.deanforantdesigns.com,https://staging.deanforantdesigns.com
```

### **Development vs Production**

**Local Development (.env):**
```bash
FRONTEND_URL=http://127.0.0.1:5500,http://localhost:5500,http://localhost:3000
```

**Production (.env):**
```bash
FRONTEND_URL=https://deanforantdesigns.com,https://www.deanforantdesigns.com
```

### **Debugging CORS**
When the server starts, it will log the allowed origins:
```
🌐 Allowed CORS origins: http://127.0.0.1:5500, http://localhost:5500, http://localhost:3000
```

## 🚨 Common Issues & Solutions

### **CORS Errors**
If frontend can't reach backend:
1. **Check `FRONTEND_URL` in backend `.env`**:
   - For local development: `FRONTEND_URL=http://127.0.0.1:5500,http://localhost:5500`
   - For production: `FRONTEND_URL=https://deanforantdesigns.com,https://www.deanforantdesigns.com`
   - Multiple URLs are supported (comma-separated)
2. **Verify CORS configuration** in `server.js` (should automatically use environment variable)
3. **Check server startup logs** for "Allowed CORS origins" to confirm configuration
4. Ensure subdomain is properly configured

### **hosting.com Specific Issues**

#### **If subdomain not available:**
Use same domain with path:
```javascript
// In frontend/assets/js/main.js, change:
const apiBaseUrl = isLocalDev ? 'http://localhost:3000' : 'https://deanforantdesigns.com/api';
```

#### **Backend configuration:**
```
Application URL: https://deanforantdesigns.com/api
```

**Environment Variables for path-based setup:**
```bash
FRONTEND_URL=https://deanforantdesigns.com
```

### **Email Issues**
1. Verify SMTP settings work from server IP
2. Check hosting.com email policies
3. Consider external email service (SendGrid)

## 📋 Deployment Checklist

### **Frontend Checklist**
- [ ] SASS compiled (`npm run build`)
- [ ] All assets uploaded to `public_html/`
- [ ] Website loads correctly
- [ ] Navigation works
- [ ] Images display properly

### **Backend Checklist**
- [ ] Node.js app created in cPanel
- [ ] Environment variables configured
- [ ] Dependencies installed (`npm install`)
- [ ] App shows "Running" status
- [ ] Health check responds: `/api/health`
- [ ] Contact form submits successfully

### **Integration Checklist**
- [ ] Frontend can reach backend API
- [ ] CORS configured correctly
- [ ] Contact form sends emails
- [ ] Auto-reply emails work
- [ ] No console errors

## 🔄 Future Updates

### **Frontend Updates**
1. Update files locally
2. Run `npm run build`
3. Upload changed files to `public_html/`

### **Backend Updates**
1. Update `backend/server.js`
2. Upload to Node.js app directory
3. Restart app in cPanel

## 🌟 Benefits of This Structure

✅ **Separation of Concerns**: Frontend and backend are independent
✅ **Easier Deployment**: Each part can be deployed separately
✅ **Better Scalability**: Can move backend to different service if needed
✅ **Development Flexibility**: Work on frontend/backend independently
✅ **Hosting Options**: More deployment options available

## 🛡️ Security Notes

- Backend only exposes API endpoints
- Frontend is static files (more secure)
- Environment variables isolated to backend
- CORS properly configured
- Rate limiting on API endpoints

This structure is much more professional and gives you flexibility for future scaling!
