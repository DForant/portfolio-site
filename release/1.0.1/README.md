# Dean Forant Portfolio Website

A professional portfolio website with separated frontend and backend architecture.

## 🏗️ Project Architecture

This project is organized into two main components:

```
portfolio-site/
├── frontend/                 # 🌐 Static website (HTML, CSS, JS, images)
│   ├── assets/
│   ├── index.html
│   └── package.json
├── backend/                  # 🚀 Node.js API server (contact form, email)
│   ├── server.js
│   ├── package.json
│   ├── .env
│   └── .env.example
├── DEPLOYMENT-SEPARATED.md   # 📋 Deployment guide
└── README.md
```

## 🚀 Features

- **Responsive Design**: Mobile-first approach with modern CSS Grid and Flexbox
- **Interactive Contact Form**: Professional form with validation and modal feedback
- **Email Integration**: Automated email sending with SMTP support
- **Separated Architecture**: Independent frontend and backend for better scalability
- **Client Carousel**: Interactive showcase of client logos
- **Process Tabs**: Interactive workflow demonstration
- **Security**: Rate limiting, CORS protection, and spam detection

## 🛠️ Quick Start

### **Install All Dependencies**
```bash
npm run install:all
```

### **Development**
```bash
# Start backend API server (Terminal 1)
npm run dev:backend

# Start frontend development (Terminal 2)  
npm run dev:frontend
```

### **Production Build**
```bash
# Build frontend for production
npm run build:frontend

# Prepare backend for production
npm run deploy:backend
```

## 🌐 Production Deployment to hosting.com

### Step 1: Prepare Files for Upload

1. **Build production CSS**
   ```bash
   npm run sass:build
   ```

2. **Update environment variables**
   - Create `.env` file on server with production settings
   - Use production email credentials
   - Set `NODE_ENV=production`

3. **Files to upload to hosting.com:**
   ```
   ✅ Upload these files/folders:
   - assets/ (entire folder)
   - index.html
   - server.js
   - package.json
   - .env (create on server)
   
   ❌ Do NOT upload:
   - node_modules/ (will be installed on server)
   - .git/
   - .github/
   - .env.example
   - implementation-plan.md
   - README.md
   ```

### Step 2: Server Configuration on hosting.com

#### Option A: If hosting.com supports Node.js hosting

1. **Upload files via FTP/SFTP or File Manager**
   - Upload all required files to your domain's root directory
   - Ensure `server.js` and `package.json` are in the root

2. **Install Node.js dependencies**
   ```bash
   npm install --production
   ```

3. **Configure environment variables**
   Create `.env` file on server:
   ```env
   SMTP_HOST=mail.deanforantdesigns.com
   SMTP_PORT=465
   SMTP_USER=dean@deanforantdesigns.com
   SMTP_PASS=your_production_password
   PORT=3000
   NODE_ENV=production
   ```

4. **Start the Node.js application**
   - Use hosting.com's Node.js control panel
   - Set startup file to `server.js`
   - Configure port (usually 3000 or as specified by hosting.com)

#### Option B: If hosting.com only supports static hosting

If your hosting provider doesn't support Node.js, you'll need to modify the contact form to use a third-party service:

1. **Upload static files only:**
   ```
   - assets/
   - index.html
   ```

2. **Modify contact form to use external service:**
   
   **Option 1: Formspree**
   - Sign up at [formspree.io](https://formspree.io)
   - Replace form action in `index.html`:
   ```html
   <form class="contact__form" action="https://formspree.io/f/YOUR_FORM_ID" method="POST">
   ```

   **Option 2: Netlify Forms (if moving to Netlify)**
   - Add `netlify` attribute to form:
   ```html
   <form class="contact__form" netlify name="contact">
   ```

   **Option 3: EmailJS**
   - Sign up at [emailjs.com](https://www.emailjs.com)
   - Replace the fetch call in `main.js` with EmailJS integration

### Step 3: Email Configuration

1. **Verify email settings with hosting.com**
   - Confirm SMTP server details
   - Check if port 465 (SSL) or 587 (TLS) is supported
   - Verify authentication method

2. **Test email functionality**
   - Submit a test form after deployment
   - Check server logs for any errors
   - Verify emails are received at dean@deanforantdesigns.com

### Step 4: Domain Configuration

1. **Point domain to hosting.com**
   - Update DNS A records to point to hosting.com's IP
   - Configure CNAME if using subdomain

2. **SSL Certificate**
   - Enable SSL through hosting.com control panel
   - Update any hardcoded HTTP links to HTTPS

### Step 5: Final Testing

1. **Test all functionality:**
   - [ ] Website loads correctly
   - [ ] Navigation works
   - [ ] Contact form submits successfully
   - [ ] Emails are received
   - [ ] Auto-reply emails work
   - [ ] Mobile responsiveness
   - [ ] Client carousel functions
   - [ ] Process tabs work

2. **Performance optimization:**
   - Enable gzip compression (if available)
   - Configure caching headers
   - Optimize images if needed

## 🔧 Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `SMTP_HOST` | Email server hostname | `mail.deanforantdesigns.com` |
| `SMTP_PORT` | Email server port | `465` (SSL) or `587` (TLS) |
| `SMTP_USER` | Email username | `dean@deanforantdesigns.com` |
| `SMTP_PASS` | Email password | `your_secure_password` |
| `PORT` | Server port | `3000` |
| `NODE_ENV` | Environment | `production` |

## 📧 Email Configuration Details

The contact form sends emails using SMTP with the following features:

- **Primary email**: Sent to dean@deanforantdesigns.com
- **Auto-reply**: Sent to the form submitter
- **Spam detection**: Basic spam filtering
- **Rate limiting**: 5 submissions per 15 minutes per IP
- **Validation**: Client and server-side validation

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

### v1.0.0
- Initial release with complete contact form functionality
- Professional email templates
- Responsive design
- Security implementations
- Client carousel and process tabs

---

**Note**: Replace placeholder values (like email passwords and API keys) with actual production values when deploying.
