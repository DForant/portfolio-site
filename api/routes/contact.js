const express = require('express');
const { body, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');

const DataSanitizer = require('../utils/sanitizer');
const SpamDetector = require('../utils/spamDetector');
const EmailService = require('../utils/emailService');

const router = express.Router();

// Initialize services
const spamDetector = new SpamDetector();
const emailService = new EmailService();

// Contact form rate limiting (more restrictive than global)
const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // limit each IP to 3 contact form submissions per windowMs
  message: {
    error: 'Too many contact form submissions from this IP, please try again later.',
    retryAfter: 15 * 60 // 15 minutes in seconds
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Validation rules
const contactValidation = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Name must be between 1 and 100 characters')
    .matches(/^[a-zA-Z\s\-'\.]+$/)
    .withMessage('Name can only contain letters, spaces, hyphens, apostrophes, and periods'),
  
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail()
    .isLength({ max: 320 })
    .withMessage('Email address is too long'),
  
  body('message')
    .trim()
    .isLength({ min: 10, max: 5000 })
    .withMessage('Message must be between 10 and 5000 characters')
];

/**
 * POST /api/contact/submit
 * Handle contact form submission
 */
router.post('/submit', contactLimiter, contactValidation, async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    // Get client IP and user agent
    const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
    const userAgent = req.get('User-Agent') || 'unknown';

    // Add metadata to form data
    const rawFormData = {
      ...req.body,
      ip: clientIP,
      userAgent: userAgent
    };

    // Sanitize form data
    let sanitizedData;
    try {
      sanitizedData = DataSanitizer.sanitizeContactForm(rawFormData);
    } catch (sanitizationError) {
      return res.status(400).json({
        success: false,
        error: 'Data sanitization failed',
        message: sanitizationError.message
      });
    }

    // Validate sanitized data
    const validation = DataSanitizer.validateData(sanitizedData);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        error: 'Data validation failed',
        details: validation.errors
      });
    }

    // Perform spam detection
    const spamAnalysis = spamDetector.analyzeMessage(sanitizedData);
    
    // Log spam detection results
    console.log(`🔍 Spam analysis for ${sanitizedData.email}:`, {
      isSpam: spamAnalysis.isSpam,
      score: spamAnalysis.spamScore,
      confidence: spamAnalysis.confidence
    });

    // If spam is detected with high confidence, reject immediately
    if (spamAnalysis.isSpam && spamAnalysis.confidence > 80) {
      console.log(`🚫 High-confidence spam blocked from ${sanitizedData.email}`);
      
      // Return generic success message to avoid revealing spam detection
      return res.status(200).json({
        success: true,
        message: 'Thank you for your message. We will get back to you soon.',
        timestamp: new Date().toISOString()
      });
    }

    // Send email to admin
    let emailResult;
    try {
      emailResult = await emailService.sendContactEmail(sanitizedData, spamAnalysis);
    } catch (emailError) {
      console.error('Failed to send contact email:', emailError.message);
      
      return res.status(500).json({
        success: false,
        error: 'Failed to send message',
        message: 'There was an error processing your message. Please try again later or contact us directly.'
      });
    }

    // Send auto-reply to user (only if not spam)
    let autoReplyResult = null;
    if (!spamAnalysis.isSpam) {
      try {
        autoReplyResult = await emailService.sendAutoReply(sanitizedData);
      } catch (autoReplyError) {
        console.error('Failed to send auto-reply:', autoReplyError.message);
        // Don't fail the request if auto-reply fails
      }
    }

    // Log successful submission
    console.log(`✅ Contact form submitted successfully:`, {
      name: sanitizedData.name,
      email: sanitizedData.email,
      timestamp: sanitizedData.timestamp,
      spamScore: spamAnalysis.spamScore,
      emailSent: emailResult.success,
      autoReplySent: autoReplyResult?.success || false
    });

    // Store submission in database (if you add one later)
    // await saveSubmission(sanitizedData, spamAnalysis);

    // Return success response
    res.status(200).json({
      success: true,
      message: 'Thank you for your message! We will get back to you within 24 hours.',
      timestamp: new Date().toISOString(),
      messageId: emailResult.messageId
    });

  } catch (error) {
    console.error('Contact form submission error:', error);
    
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'There was an error processing your message. Please try again later.'
    });
  }
});

/**
 * GET /api/contact/health
 * Health check for contact service
 */
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    service: 'Contact Form API',
    timestamp: new Date().toISOString(),
    features: {
      sanitization: true,
      spamDetection: true,
      emailService: emailService.transporter !== null,
      rateLimiting: true
    }
  });
});

/**
 * POST /api/contact/test-spam
 * Test endpoint for spam detection (development only)
 */
if (process.env.NODE_ENV === 'development') {
  router.post('/test-spam', (req, res) => {
    try {
      const testData = {
        name: req.body.name || 'Test User',
        email: req.body.email || 'test@example.com',
        message: req.body.message || 'This is a test message'
      };

      const spamAnalysis = spamDetector.analyzeMessage(testData);

      res.status(200).json({
        success: true,
        testData,
        spamAnalysis
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });
}

module.exports = router;
