# Portfolio Contact Form API

A comprehensive backend solution for handling contact form submissions with advanced spam detection, data sanitization, email notifications, and an admin dashboard.

## 🌟 Features

- **📧 Email Integration**: Automated email notifications with beautiful HTML templates
- **🛡️ Advanced Spam Detection**: Multi-layered spam analysis with customizable thresholds
- **🧹 Data Sanitization**: Comprehensive input cleaning and validation
- **⚡ Rate Limiting**: Prevents abuse with configurable limits
- **🔒 Admin Dashboard**: Secure web interface for monitoring and configuration
- **📊 Real-time Analytics**: System stats and performance monitoring
- **🎨 Auto-Reply**: Professional confirmation emails to users
- **🔐 Secure Authentication**: JWT-based admin authentication
- **📱 Responsive Design**: Works on all devices

## 🚀 Quick Start

### 1. Installation

```bash
cd api
npm install
```

Or run the setup script:
```bash
node setup.js
```

### 2. Configuration

Copy `.env.example` to `.env` and configure:

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# Email Configuration (required)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# Admin Settings
ADMIN_EMAIL=dean@deanforantdesigns.com
ADMIN_NAME=Dean Forant
ADMIN_PASSWORD_HASH=your_bcrypt_hash_here

# Security
JWT_SECRET=your_secure_jwt_secret

# Spam Detection (optional - has defaults)
SPAM_SCORE_THRESHOLD=7
MAX_LINKS_ALLOWED=2
MAX_CAPS_PERCENTAGE=30
```

### 3. Generate Admin Password Hash

```bash
node -e "const bcrypt=require('bcryptjs'); console.log('ADMIN_PASSWORD_HASH=' + bcrypt.hashSync('your_password', 12));"
```

### 4. Start the Server

```bash
# Development
npm run dev

# Production
npm start
```

### 5. Access Admin Dashboard

Open `http://localhost:3001/admin` and login with your admin password.

## 📡 API Endpoints

### Contact Form

#### POST `/api/contact/submit`
Submit a contact form with spam detection and email notification.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "message": "I'm interested in your web design services..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Thank you for your message! We will get back to you within 24 hours.",
  "timestamp": "2025-09-02T10:30:00.000Z",
  "messageId": "email-message-id"
}
```

#### GET `/api/contact/health`
Check contact service health status.

### Admin API

#### POST `/api/admin/login`
Authenticate admin user.

**Request Body:**
```json
{
  "password": "your_admin_password"
}
```

#### GET `/api/admin/settings`
Get current system settings (requires authentication).

#### PUT `/api/admin/settings`
Update system settings (requires authentication).

#### GET `/api/admin/stats`
Get system statistics and performance metrics.

#### POST `/api/admin/test-email`
Send a test email to verify configuration.

## 🛡️ Spam Detection Algorithm

The spam detection system uses multiple analysis layers:

### Detection Criteria

1. **Keyword Analysis**: Checks for common spam words
2. **Pattern Detection**: Identifies suspicious patterns (URLs, excessive caps, etc.)
3. **Message Quality**: Analyzes length, structure, and readability
4. **Link Analysis**: Counts and validates links
5. **Email Validation**: Checks for temporary/suspicious email domains
6. **Name Validation**: Identifies fake or suspicious names
7. **Repetition Analysis**: Detects repetitive content

### Scoring System

- Each criteria assigns a score based on severity
- Total score compared against configurable threshold (default: 7)
- High-confidence spam (>80%) is automatically rejected
- Detailed analysis provided in admin notifications

### Customization

Adjust detection sensitivity in `.env`:
```env
SPAM_SCORE_THRESHOLD=7    # Overall spam threshold
MAX_LINKS_ALLOWED=2       # Maximum links in message
MAX_CAPS_PERCENTAGE=30    # Maximum percentage of capitals
```

## 🧹 Data Sanitization

All input data is thoroughly sanitized:

- **HTML/Script Removal**: Strips dangerous HTML and JavaScript
- **Input Validation**: Enforces length and format requirements
- **Character Filtering**: Removes harmful characters
- **Encoding**: Proper encoding for safe storage and display

## 📧 Email System

### Features

- **HTML Templates**: Beautiful, responsive email designs
- **Auto-Reply**: Professional confirmation emails to users
- **Admin Notifications**: Detailed submission reports with spam analysis
- **SMTP Support**: Works with Gmail, Outlook, and other providers

### Email Configuration

For Gmail:
1. Enable 2-factor authentication
2. Generate an app-specific password
3. Use these settings:
   ```env
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your_email@gmail.com
   SMTP_PASS=your_app_password
   ```

## 🔒 Security Features

- **Rate Limiting**: 3 submissions per 15 minutes per IP
- **Input Validation**: Comprehensive server-side validation
- **JWT Authentication**: Secure admin sessions
- **CORS Protection**: Configured allowed origins
- **Helmet Security**: HTTP security headers
- **Error Handling**: Safe error messages (no information leakage)

## 📊 Admin Dashboard

### Features

- **System Monitoring**: Real-time server stats and uptime
- **Email Management**: Test email configuration
- **Spam Settings**: Adjust detection parameters
- **Security Settings**: Configure rate limits and thresholds
- **Development Tools**: Test spam detection and generate password hashes

### Access

1. Navigate to `http://localhost:3001/admin`
2. Login with your admin password
3. Monitor and configure your system

## 🔧 Development

### Testing Spam Detection

```bash
curl -X POST http://localhost:3001/api/contact/test-spam \
  -H "Content-Type: application/json" \
  -d '{"message": "Your test message here"}'
```

### Generating Password Hashes

```bash
curl -X POST http://localhost:3001/api/admin/generate-password-hash \
  -H "Content-Type: application/json" \
  -d '{"password": "your_new_password"}'
```

## 🚨 Error Handling

The API provides detailed error responses:

```json
{
  "success": false,
  "error": "Validation failed",
  "details": ["Name is required", "Invalid email format"]
}
```

Common error types:
- **400**: Validation errors, malformed requests
- **401**: Authentication required/failed
- **429**: Rate limit exceeded
- **500**: Server errors

## 🔄 Frontend Integration

Update your contact form to use the API:

```javascript
// Form submission (already implemented in main.js)
const response = await fetch('/api/contact/submit', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    name: nameField.value,
    email: emailField.value,
    message: messageField.value
  })
});

const result = await response.json();
```

## 📈 Performance

- **Response Time**: Average < 200ms for form submissions
- **Memory Usage**: Minimal footprint with efficient processing
- **Rate Limiting**: Prevents abuse while allowing legitimate use
- **Error Recovery**: Graceful handling of service interruptions

## 🛠️ Customization

### Adding Custom Spam Keywords

Edit `utils/spamDetector.js`:
```javascript
this.spamKeywords = [
  // Add your custom keywords
  'custom-spam-word',
  // ... existing keywords
];
```

### Custom Email Templates

Modify `utils/emailService.js` to customize email designs and content.

### Additional Validation

Add custom validation rules in `routes/contact.js`.

## 📝 Logging

The system provides comprehensive logging:
- Request/response logging
- Spam detection results
- Email send status
- Error tracking
- Performance metrics

## 🔧 Troubleshooting

### Common Issues

1. **Email not sending**:
   - Check SMTP credentials
   - Verify firewall settings
   - Test with admin dashboard

2. **High spam false positives**:
   - Adjust `SPAM_SCORE_THRESHOLD`
   - Review spam detection keywords
   - Check detection logs

3. **Rate limiting too strict**:
   - Adjust `RATE_LIMIT_MAX` and `RATE_LIMIT_WINDOW`
   - Consider IP whitelisting for testing

### Debug Mode

Set `NODE_ENV=development` for detailed error messages and debug features.

## 📚 Dependencies

### Core Dependencies
- **express**: Web framework
- **nodemailer**: Email sending
- **bcryptjs**: Password hashing
- **jsonwebtoken**: Authentication
- **express-validator**: Input validation
- **dompurify**: HTML sanitization
- **helmet**: Security headers
- **cors**: Cross-origin resource sharing

### Development Dependencies
- **nodemon**: Auto-restart during development
- **jest**: Testing framework

## 🚀 Deployment

### Production Checklist

1. ✅ Set `NODE_ENV=production`
2. ✅ Use strong JWT secret
3. ✅ Configure proper SMTP settings
4. ✅ Set secure admin password
5. ✅ Configure reverse proxy (nginx/Apache)
6. ✅ Enable HTTPS
7. ✅ Set up monitoring
8. ✅ Configure backups

### Environment Variables for Production

```env
NODE_ENV=production
PORT=3001
JWT_SECRET=very_long_random_secure_string
ADMIN_PASSWORD_HASH=strong_bcrypt_hash
SMTP_HOST=your_production_smtp
FRONTEND_URL=https://deanforantdesigns.com
```

## 📄 License

MIT License - See LICENSE file for details.

## 🆘 Support

- Check the admin dashboard for system status
- Review console logs for detailed error information
- Verify environment configuration
- Test email settings using the admin panel

## 🎯 Next Steps

1. **Database Integration**: Add MongoDB for persistent storage
2. **Enhanced Analytics**: Detailed submission tracking
3. **Multi-language Support**: Internationalization
4. **Advanced Security**: Additional authentication methods
5. **API Rate Plans**: Different access levels

---

**Built with ❤️ for Dean Forant Designs**
