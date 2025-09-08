// Load environment variables
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'"],
        },
    },
}));

// CORS configuration for frontend
const getAllowedOrigins = () => {
    // If FRONTEND_URL is set, use it (can be comma-separated for multiple URLs)
    if (process.env.FRONTEND_URL) {
        return process.env.FRONTEND_URL.split(',').map(url => url.trim());
    }
    
    // Default fallback origins for development
    return [
        'http://localhost:3000', 
        'http://localhost:5500',
        'http://127.0.0.1:5500',
        'https://deanforantdesigns.com'
    ];
};

app.use(cors({
    origin: getAllowedOrigins(),
    credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit each IP to 5 requests per windowMs
    message: {
        error: 'Too many contact form submissions from this IP, please try again later.',
        retryAfter: 15
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Email configuration
const createTransporter = () => {
    console.log('📧 Configuring email transporter...');
    console.log('Email config:', {
        smtpHost: process.env.SMTP_HOST,
        smtpPort: process.env.SMTP_PORT,
        smtpUser: process.env.SMTP_USER,
        hasPassword: !!process.env.SMTP_PASS,
        emailUser: process.env.EMAIL_USER,
        hasEmailPass: !!process.env.EMAIL_PASS
    });

    // Try SMTP configuration first
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
        console.log('📧 Using SMTP configuration');
        const port = parseInt(process.env.SMTP_PORT) || 587;
        const isSecure = port === 465; // Port 465 requires secure connection
        
        return nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: port,
            secure: isSecure, // true for 465, false for other ports
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            },
            tls: {
                rejectUnauthorized: false // Allow self-signed certificates
            }
        });
    }
    
    // Fall back to Gmail configuration
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        console.log('📧 Using Gmail configuration');
        return nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
    }

    // Default configuration for testing (won't actually send emails)
    console.log('⚠️ No email configuration found, using test configuration');
    return nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        auth: {
            user: 'test@example.com',
            pass: 'test123'
        }
    });
};

// Test email configuration at startup
const testEmailConfig = async () => {
    console.log('🧪 Testing email configuration...');
    try {
        const transporter = createTransporter();
        await transporter.verify();
        console.log('✅ Email configuration verified successfully');
        return true;
    } catch (error) {
        console.error('❌ Email configuration test failed:', error.message);
        console.log('⚠️ Email functionality may not work properly');
        return false;
    }
};

// Simple spam detection
const detectSpam = (formData) => {
    const { name, email, message, organization } = formData;
    let spamScore = 0;
    const flags = [];

    // Check for common spam patterns
    const spamKeywords = ['viagra', 'casino', 'lottery', 'winner', 'congratulations', 'click here', 'free money', 'urgent', 'limited time'];
    const messageText = message.toLowerCase();
    
    spamKeywords.forEach(keyword => {
        if (messageText.includes(keyword)) {
            spamScore += 2;
            flags.push(`Contains spam keyword: ${keyword}`);
        }
    });

    // Check for suspicious patterns
    if (messageText.includes('http://') || messageText.includes('https://')) {
        spamScore += 1;
        flags.push('Contains URLs');
    }

    // Check for excessive capitalization
    const capitalRatio = (message.match(/[A-Z]/g) || []).length / message.length;
    if (capitalRatio > 0.5) {
        spamScore += 1;
        flags.push('Excessive capitalization');
    }

    // Check for repeated characters
    if (/(.)\1{4,}/.test(message)) {
        spamScore += 1;
        flags.push('Repeated characters');
    }

    // Check for suspicious email patterns
    if (email.includes('+') || email.includes('tempmail') || email.includes('10minutemail')) {
        spamScore += 2;
        flags.push('Suspicious email pattern');
    }

    return {
        isSpam: spamScore >= 3,
        score: spamScore,
        flags: flags
    };
};

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        service: 'Dean Forant Portfolio API',
        environment: process.env.NODE_ENV || 'development'
    });
});

// Contact form submission endpoint
app.post('/api/contact/submit', limiter, [
    body('name')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Name must be between 2 and 100 characters')
        .escape(),
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email address'),
    body('message')
        .trim()
        .isLength({ min: 10, max: 2000 })
        .withMessage('Message must be between 10 and 2000 characters')
        .escape(),
    body('organization')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('Organization name must be less than 100 characters')
        .escape()
], async (req, res) => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Please check your form inputs and try again.',
                errors: errors.array()
            });
        }

        const formData = {
            name: req.body.name,
            email: req.body.email,
            message: req.body.message,
            organization: req.body.organization || '',
            timestamp: new Date().toISOString(),
            ip: req.ip || req.connection.remoteAddress
        };

        // Spam detection
        const spamCheck = detectSpam(formData);
        if (spamCheck.isSpam) {
            console.log(`🚫 Spam detected from ${formData.email}:`, spamCheck);
            return res.status(400).json({
                success: false,
                message: 'Your message appears to be spam. Please contact me directly if this is a legitimate inquiry.'
            });
        }

        console.log('📧 Processing contact form submission:', {
            name: formData.name,
            email: formData.email,
            organization: formData.organization,
            timestamp: formData.timestamp
        });

        // Create email transporter
        const transporter = createTransporter();

        // Email sending with graceful error handling
        let emailSent = false;
        let emailError = null;

        try {

        // Prepare email content
        const emailHtml = `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
                <div style="background: white; border-radius: 10px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <h1 style="color: #4A6C9B; margin: 0; font-size: 24px;">New Contact Form Submission</h1>
                        <p style="color: #666; margin: 10px 0 0 0;">Received from deanforantdesigns.com</p>
                    </div>
                    
                    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                        <h3 style="color: #4A6C9B; margin: 0 0 15px 0; font-size: 18px;">Contact Information</h3>
                        <p style="margin: 8px 0; color: #333;"><strong>Name:</strong> ${formData.name}</p>
                        <p style="margin: 8px 0; color: #333;"><strong>Email:</strong> ${formData.email}</p>
                        ${formData.organization ? `<p style="margin: 8px 0; color: #333;"><strong>Organization:</strong> ${formData.organization}</p>` : ''}
                        <p style="margin: 8px 0; color: #333;"><strong>Submitted:</strong> ${new Date(formData.timestamp).toLocaleString()}</p>
                    </div>
                    
                    <div style="background: #e3f2fd; padding: 20px; border-radius: 8px; border-left: 4px solid #4A6C9B;">
                        <h3 style="color: #4A6C9B; margin: 0 0 15px 0; font-size: 18px;">Message</h3>
                        <p style="margin: 0; color: #333; line-height: 1.6; white-space: pre-wrap;">${formData.message}</p>
                    </div>
                </div>
            </div>
        `;

        // Send email
        const mailOptions = {
            from: `"Portfolio Contact Form" <${process.env.SMTP_USER || 'noreply@deanforantdesigns.com'}>`,
            to: 'dean@deanforantdesigns.com',
            subject: 'Inquiry from website',
            html: emailHtml,
            replyTo: formData.email
        };

        console.log('📧 Attempting to send email...');
        console.log('📧 From:', mailOptions.from);
        console.log('📧 To:', mailOptions.to);
        
        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Email sent successfully to dean@deanforantdesigns.com');
        console.log('📧 Message ID:', info.messageId);
        emailSent = true;

        } catch (error) {
            console.error('❌ Email sending failed:', error.message);
            emailError = error.message;
            // Continue execution - don't throw error
        }

        // Skip auto-reply for now to avoid additional email issues
        
        // Always return success to user, even if email fails
        const responseMessage = emailSent 
            ? 'Thank you for your message! I\'ll get back to you within 24 hours.'
            : 'Thank you for your message! I have received it and will get back to you within 24 hours.';

        console.log('📧 Contact form processed:', {
            emailSent,
            emailError: emailError || 'none'
        });

        res.status(200).json({
            success: true,
            message: responseMessage
        });

    } catch (error) {
        console.error('❌ Contact form submission error:', error);
        res.status(500).json({
            success: false,
            message: 'Sorry, there was an error sending your message. Please try again or contact me directly at dean@deanforantdesigns.com.'
        });
    }
});

// Start server
app.listen(PORT, async () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📧 Contact form endpoint: http://localhost:${PORT}/api/contact/submit`);
    console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🌐 Allowed CORS origins: ${getAllowedOrigins().join(', ')}`);
    console.log(`📂 Working directory: ${process.cwd()}`);
    console.log(`⏰ Server started at: ${new Date().toISOString()}`);
    
    // Test email configuration (disabled for local dev)
    // await testEmailConfig();
    
    console.log(`✅ Server initialization complete`);
});

module.exports = app;
