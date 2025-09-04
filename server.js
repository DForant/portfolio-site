// Load environment variables
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const nodemailer = require('nodemailer');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdnjs.cloudflare.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'"],
        },
    },
}));

app.use(cors());
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

// Serve static files
app.use(express.static('.'));

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

    // Check for excessive links
    const linkCount = (message.match(/https?:\/\//g) || []).length;
    if (linkCount > 2) {
        spamScore += 3;
        flags.push(`Too many links: ${linkCount}`);
    }

    // Check for excessive caps
    const capsCount = (message.match(/[A-Z]/g) || []).length;
    const capsPercentage = (capsCount / message.length) * 100;
    if (capsPercentage > 30) {
        spamScore += 2;
        flags.push(`Excessive capitals: ${capsPercentage.toFixed(1)}%`);
    }

    // Check message length
    if (message.length < 10) {
        spamScore += 1;
        flags.push('Message too short');
    }

    // Check for valid email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        spamScore += 3;
        flags.push('Invalid email format');
    }

    return {
        isSpam: spamScore >= 5,
        spamScore,
        flags,
        confidence: Math.min(spamScore / 10, 1)
    };
};

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
        .withMessage('Organization name cannot exceed 100 characters')
        .escape()
], async (req, res) => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Please check your form data and try again.',
                errors: errors.array()
            });
        }

        const formData = {
            name: req.body.name,
            email: req.body.email,
            message: req.body.message,
            organization: req.body.organization || '',
            timestamp: new Date().toISOString(),
            ip: req.ip || req.connection.remoteAddress,
            userAgent: req.get('User-Agent') || 'Unknown'
        };

        console.log('📧 New contact form submission:', { 
            name: formData.name, 
            email: formData.email,
            organization: formData.organization,
            messageLength: formData.message.length
        });

        // Spam detection
        const spamAnalysis = detectSpam(formData);
        console.log('🛡️ Spam analysis:', spamAnalysis);

        if (spamAnalysis.isSpam) {
            console.log('🚫 Blocked spam submission:', spamAnalysis.flags);
            return res.status(400).json({
                success: false,
                message: 'Your message appears to be spam. If this is an error, please try rewording your message.'
            });
        }

        // Create email transporter
        const transporter = createTransporter();

        // Email content
        const emailHtml = `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
                <div style="background: white; border-radius: 10px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <h1 style="color: #4A6C9B; margin: 0; font-size: 24px;">New Website Inquiry</h1>
                        <p style="color: #666; margin: 10px 0 0 0;">From your portfolio website contact form</p>
                    </div>
                    
                    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                        <h2 style="color: #333; font-size: 18px; margin: 0 0 15px 0;">Contact Information</h2>
                        <p style="margin: 8px 0; color: #555;"><strong>Name:</strong> ${formData.name}</p>
                        <p style="margin: 8px 0; color: #555;"><strong>Email:</strong> <a href="mailto:${formData.email}" style="color: #4A6C9B;">${formData.email}</a></p>
                        ${formData.organization ? `<p style="margin: 8px 0; color: #555;"><strong>Organization:</strong> ${formData.organization}</p>` : ''}
                        <p style="margin: 8px 0; color: #555;"><strong>Submitted:</strong> ${new Date(formData.timestamp).toLocaleString()}</p>
                    </div>
                    
                    <div style="background: white; border: 1px solid #e1e5e9; border-radius: 8px; padding: 20px;">
                        <h2 style="color: #333; font-size: 18px; margin: 0 0 15px 0;">Message</h2>
                        <div style="background: #f8f9fa; padding: 15px; border-radius: 6px; border-left: 4px solid #4A6C9B;">
                            <p style="margin: 0; color: #333; line-height: 1.6; white-space: pre-wrap;">${formData.message}</p>
                        </div>
                    </div>
                    
                    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e1e5e9; text-align: center;">
                        <p style="color: #666; font-size: 14px; margin: 0;">
                            <strong>Quick Actions:</strong> 
                            <a href="mailto:${formData.email}?subject=Re: Your inquiry about my design services" style="color: #4A6C9B; text-decoration: none; margin: 0 10px;">Reply to ${formData.name}</a> |
                            <a href="tel:${formData.email}" style="color: #4A6C9B; text-decoration: none; margin: 0 10px;">Schedule Call</a>
                        </p>
                    </div>
                </div>
                
                <div style="text-align: center; margin-top: 20px;">
                    <p style="color: #666; font-size: 12px; margin: 0;">
                        This email was sent from your portfolio website contact form.<br>
                        Spam confidence: ${(spamAnalysis.confidence * 100).toFixed(1)}% | IP: ${formData.ip}
                    </p>
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
        
        try {
            const info = await transporter.sendMail(mailOptions);
            console.log('✅ Email sent successfully to dean@deanforantdesigns.com');
            console.log('📧 Message ID:', info.messageId);
        } catch (emailError) {
            console.error('❌ Error sending main email:', emailError);
            throw emailError; // Re-throw to be caught by main try-catch
        }

        // Send auto-reply to user
        const autoReplyHtml = `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
                <div style="background: white; border-radius: 10px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <h1 style="color: #4A6C9B; margin: 0; font-size: 24px;">Thank You for Your Inquiry!</h1>
                        <p style="color: #666; margin: 10px 0 0 0;">I've received your message and will respond within 24 hours</p>
                    </div>
                    
                    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                        <p style="margin: 0; color: #333; line-height: 1.6;">Hi ${formData.name},</p>
                        <br>
                        <p style="margin: 0; color: #333; line-height: 1.6;">
                            Thank you for reaching out! I'm excited to learn more about your project and discuss how I can help bring your vision to life.
                        </p>
                        <br>
                        <p style="margin: 0; color: #333; line-height: 1.6;">
                            I typically respond to all inquiries within 24 hours during business days. In the meantime, feel free to check out my portfolio for examples of my recent work.
                        </p>
                        <br>
                        <p style="margin: 0; color: #333; line-height: 1.6;">
                            Looking forward to connecting with you soon!
                        </p>
                        <br>
                        <p style="margin: 0; color: #333; line-height: 1.6;">
                            Best regards,<br>
                            <strong>Dean Forant</strong><br>
                            Brand & Web Design<br>
                            <a href="mailto:dean@deanforantdesigns.com" style="color: #4A6C9B;">dean@deanforantdesigns.com</a>
                        </p>
                    </div>
                    
                    <div style="text-align: center; background: #4A6C9B; padding: 20px; border-radius: 8px;">
                        <p style="margin: 0; color: white; font-size: 16px;">
                            <strong>Your message has been received</strong>
                        </p>
                        <p style="margin: 5px 0 0 0; color: #e6f3ff; font-size: 14px;">
                            Reference: ${new Date(formData.timestamp).toLocaleDateString()} - ${formData.name}
                        </p>
                    </div>
                </div>
            </div>
        `;

        const autoReplyOptions = {
            from: `"Dean Forant" <${process.env.SMTP_USER || 'dean@deanforantdesigns.com'}>`,
            to: formData.email,
            subject: 'Thank you for your inquiry - Dean Forant Design',
            html: autoReplyHtml
        };

        console.log('📧 Attempting to send auto-reply...');
        try {
            const autoReplyInfo = await transporter.sendMail(autoReplyOptions);
            console.log('✅ Auto-reply sent to user');
            console.log('📧 Auto-reply Message ID:', autoReplyInfo.messageId);
        } catch (autoReplyError) {
            console.error('⚠️ Error sending auto-reply (non-critical):', autoReplyError);
            // Don't throw here - auto-reply failure shouldn't fail the whole process
        }

        res.status(200).json({
            success: true,
            message: 'Thank you for your message! I\'ll get back to you within 24 hours.'
        });

    } catch (error) {
        console.error('❌ Contact form error:', error);
        
        res.status(500).json({
            success: false,
            message: 'Sorry, there was an error sending your message. Please try again or contact me directly at dean@deanforantdesigns.com.'
        });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        service: 'Dean Forant Portfolio API'
    });
});

// Catch-all for SPA routing
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, async () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📧 Contact form endpoint: http://localhost:${PORT}/api/contact/submit`);
    console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
    
    // Test email configuration
    await testEmailConfig();
});

module.exports = app;
