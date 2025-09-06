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
   Application URL: https://api.deanforantdesigns.com
   Startup file: server.js
   ```

### **Option 2: Separate Hosting**

#### **Frontend**: hosting.com (Static hosting)
- Upload `frontend/` contents to `public_html/`
- No Node.js required

#### **Backend**: hosting.com Node.js App or separate service
- Deploy `backend/` as Node.js application
- Configure subdomain: `api.deanforantdesigns.com`

## 🛠️ Step-by-Step Deployment

### **Step 1: Prepare Frontend**

```bash
# In frontend directory
cd frontend/
npm install
npm run build
```

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
   Node.js version: 18.x
   Application mode: Production
   Application root: portfolio-api
   Application URL: https://api.deanforantdesigns.com (or subdirectory)
   Application startup file: server.js
   ```

2. **Environment Variables**:
   ```
   NODE_ENV=production
   PORT=3000
   SMTP_HOST=mail.deanforantdesigns.com
   SMTP_PORT=465
   SMTP_USER=dean@deanforantdesigns.com
   SMTP_PASS=your_password
   FRONTEND_URL=https://deanforantdesigns.com
   ```

3. **Upload Files**:
   ```
   ~/portfolio-api/
   ├── server.js
   ├── package.json
   └── .env
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

The frontend automatically detects environment:

- **Local Development**: `http://localhost:3000/api/contact/submit`
- **Production**: `https://api.deanforantdesigns.com/api/contact/submit`

## 🚨 Common Issues & Solutions

### **CORS Errors**
If frontend can't reach backend:
1. Check `FRONTEND_URL` in backend `.env`
2. Verify CORS configuration in `server.js`
3. Ensure subdomain is properly configured

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
