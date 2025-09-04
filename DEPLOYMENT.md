# 🚀 Deployment Checklist for hosting.com

## Pre-Deployment Preparation

### ✅ Local Testing
- [ ] Contact form works locally
- [ ] Emails are being sent and received
- [ ] All navigation links work
- [ ] Mobile responsiveness tested
- [ ] No console errors in browser

### ✅ File Preparation
- [ ] Run `npm run sass:build` to create production CSS
- [ ] Test with `NODE_ENV=production` locally
- [ ] Backup current live site (if applicable)

## 📁 Files to Upload

### ✅ Required Files/Folders
```
📂 Upload to hosting.com root directory:
├── 📁 assets/
│   ├── 📁 css/
│   │   ├── style.css
│   │   └── style.css.map
│   ├── 📁 images/ (all image files)
│   ├── 📁 js/
│   │   └── main.js
│   └── 📁 sass/ (optional, for future edits)
├── 📄 index.html
├── 📄 server.js
├── 📄 package.json
└── 📄 .env (create on server)
```

### ❌ Do NOT Upload
- [ ] `node_modules/` folder
- [ ] `.git/` folder
- [ ] `.github/` folder
- [ ] `test-server.js`
- [ ] `implementation-plan.md`
- [ ] Local `.env` file (create new one on server)

## 🔧 Server Setup Steps

### Step 1: Upload Files
- [ ] Connect to hosting.com via FTP/SFTP or File Manager
- [ ] Upload all required files to domain root directory
- [ ] Verify file permissions (644 for files, 755 for folders)

### Step 2: Node.js Configuration
- [ ] Access hosting.com control panel
- [ ] Enable Node.js hosting for your domain
- [ ] Set Node.js version (16+ recommended)
- [ ] Set startup file to `server.js`

### Step 3: Install Dependencies
```bash
# Run in hosting.com terminal or SSH:
cd /path/to/your/domain
npm install --production
```

### Step 4: Environment Variables
Create `.env` file on server with:
```env
# Email Configuration
SMTP_HOST=mail.deanforantdesigns.com
SMTP_PORT=465
SMTP_USER=dean@deanforantdesigns.com
SMTP_PASS=YOUR_PRODUCTION_PASSWORD

# Server Configuration  
PORT=3000
NODE_ENV=production
```

### Step 5: Start Application
- [ ] Use hosting.com's Node.js control panel to start the app
- [ ] Or run manually: `node server.js`
- [ ] Verify the process is running and listening on correct port

## 📧 Email Configuration Verification

### ✅ Email Settings Check
- [ ] Confirm SMTP host: `mail.deanforantdesigns.com`
- [ ] Verify port 465 is allowed by hosting.com
- [ ] Test SMTP credentials work from server IP
- [ ] Check if hosting.com requires specific outgoing mail settings

### ✅ Alternative Email Setup (if SMTP blocked)
If hosting.com blocks SMTP, configure external email service:

**Option 1: SendGrid**
```env
# Replace SMTP settings with:
SENDGRID_API_KEY=your_sendgrid_api_key
EMAIL_SERVICE=sendgrid
```

**Option 2: Mailgun**
```env
# Replace SMTP settings with:
MAILGUN_API_KEY=your_mailgun_api_key
MAILGUN_DOMAIN=your_domain.com
EMAIL_SERVICE=mailgun
```

## 🌐 Domain & SSL Setup

### ✅ Domain Configuration
- [ ] Point domain DNS to hosting.com servers
- [ ] Update A records if needed
- [ ] Verify domain propagation (24-48 hours)

### ✅ SSL Certificate
- [ ] Enable SSL/TLS in hosting.com control panel
- [ ] Force HTTPS redirects
- [ ] Test secure connection: `https://deanforantdesigns.com`

## 🧪 Post-Deployment Testing

### ✅ Functionality Tests
- [ ] Website loads at your domain
- [ ] All pages/sections accessible
- [ ] Navigation menu works
- [ ] Client carousel functions
- [ ] Process tabs work properly

### ✅ Contact Form Testing
- [ ] Fill out contact form completely
- [ ] Submit form and verify success modal appears
- [ ] Check dean@deanforantdesigns.com for email
- [ ] Verify auto-reply email is sent to submitter
- [ ] Test form validation (try submitting empty form)

### ✅ Performance Testing
- [ ] Test on mobile devices
- [ ] Check loading speed
- [ ] Verify images load properly
- [ ] Test on different browsers

## 🐛 Troubleshooting Common Issues

### Issue: Contact form shows "Network Error"
**Solutions:**
- [ ] Check if Node.js server is running
- [ ] Verify port configuration matches hosting.com requirements
- [ ] Check server logs for errors
- [ ] Ensure fetch URL matches domain (not localhost)

### Issue: Emails not sending
**Solutions:**
- [ ] Verify SMTP credentials in production `.env`
- [ ] Check if hosting.com blocks port 465/587
- [ ] Test email settings with telnet/openssl
- [ ] Consider using external email service (SendGrid, Mailgun)

### Issue: CSS/Styling issues
**Solutions:**
- [ ] Verify all CSS files uploaded correctly
- [ ] Check file permissions (should be 644)
- [ ] Clear browser cache
- [ ] Verify relative paths in HTML

### Issue: JavaScript not working
**Solutions:**
- [ ] Check browser console for errors
- [ ] Verify main.js uploaded correctly
- [ ] Ensure all file paths are correct
- [ ] Test with different browsers

## 📞 hosting.com Specific Notes

### Contact hosting.com support if:
- [ ] Node.js is not available on your plan
- [ ] SMTP ports are blocked
- [ ] Server won't start despite correct setup
- [ ] Domain not pointing correctly

### Common hosting.com Requirements:
- [ ] May need to enable Node.js in control panel
- [ ] Port might be assigned automatically (not 3000)
- [ ] May require app.js instead of server.js as entry point
- [ ] Check if PM2 or similar process manager is required

## ✅ Final Verification

### Production Checklist
- [ ] Website loads without errors
- [ ] Contact form sends emails successfully
- [ ] SSL certificate is active and working
- [ ] All features work as expected
- [ ] Performance is satisfactory
- [ ] Mobile experience is smooth

### Backup & Monitoring
- [ ] Create backup of working deployment
- [ ] Set up monitoring for uptime
- [ ] Document any hosting.com specific configurations
- [ ] Save production environment variables securely

---

## 🆘 Quick Support Commands

**Check if server is running:**
```bash
ps aux | grep node
netstat -tulpn | grep :3000
```

**View server logs:**
```bash
tail -f /path/to/your/app/logs/error.log
# Or check hosting.com control panel logs
```

**Restart Node.js app:**
```bash
# Via hosting.com control panel or:
pkill node
node server.js
```

## 📋 Post-Deployment TODO

- [ ] Update local development environment to match production
- [ ] Document any hosting.com specific configurations
- [ ] Set up regular backups
- [ ] Monitor email delivery rates
- [ ] Plan for future updates and maintenance

---

**🎉 Congratulations!** Your portfolio site should now be live on hosting.com with full contact form functionality!
