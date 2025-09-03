const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');

const DataSanitizer = require('../utils/sanitizer');

const router = express.Router();

// Admin login rate limiting
const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 login attempts per windowMs
  message: {
    error: 'Too many login attempts from this IP, please try again later.',
    retryAfter: 15 * 60
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Middleware to verify JWT token
const authenticateAdmin = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Access denied. No token provided.'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = decoded;
    next();
  } catch (error) {
    res.status(400).json({
      success: false,
      error: 'Invalid token.'
    });
  }
};

/**
 * POST /api/admin/login
 * Admin authentication
 */
router.post('/login', adminLimiter, [
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { password } = req.body;
    const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;

    if (!adminPasswordHash) {
      return res.status(500).json({
        success: false,
        error: 'Admin authentication not configured'
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, adminPasswordHash);

    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        admin: true,
        timestamp: Date.now()
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log('✅ Admin login successful');

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      expiresIn: '24h'
    });

  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * GET /api/admin/settings
 * Get current admin settings
 */
router.get('/settings', authenticateAdmin, (req, res) => {
  try {
    const settings = {
      adminEmail: process.env.ADMIN_EMAIL,
      adminName: process.env.ADMIN_NAME || 'Admin',
      smtpConfigured: !!(process.env.SMTP_HOST && process.env.SMTP_USER),
      spamThreshold: parseInt(process.env.SPAM_SCORE_THRESHOLD) || 7,
      maxLinksAllowed: parseInt(process.env.MAX_LINKS_ALLOWED) || 2,
      maxCapsPercentage: parseInt(process.env.MAX_CAPS_PERCENTAGE) || 30,
      rateLimitWindow: parseInt(process.env.RATE_LIMIT_WINDOW) || 15,
      rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX) || 10,
      environment: process.env.NODE_ENV || 'development'
    };

    res.status(200).json({
      success: true,
      settings
    });

  } catch (error) {
    console.error('Failed to get admin settings:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve settings'
    });
  }
});

/**
 * PUT /api/admin/settings
 * Update admin settings
 */
router.put('/settings', authenticateAdmin, [
  body('adminEmail').optional().isEmail().withMessage('Valid email required'),
  body('adminName').optional().isLength({ min: 1, max: 100 }).withMessage('Name must be 1-100 characters'),
  body('spamThreshold').optional().isInt({ min: 1, max: 20 }).withMessage('Spam threshold must be 1-20'),
  body('maxLinksAllowed').optional().isInt({ min: 0, max: 10 }).withMessage('Max links must be 0-10'),
  body('maxCapsPercentage').optional().isInt({ min: 0, max: 100 }).withMessage('Max caps percentage must be 0-100')
], (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    // Note: In a real application, you'd update these in a database
    // For now, we'll just return what would be updated
    const sanitizedData = DataSanitizer.sanitizeAdminData(req.body);

    console.log('⚙️ Admin settings update requested:', sanitizedData);

    res.status(200).json({
      success: true,
      message: 'Settings updated successfully',
      updatedSettings: sanitizedData,
      note: 'In production, restart the server to apply environment variable changes.'
    });

  } catch (error) {
    console.error('Failed to update admin settings:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update settings'
    });
  }
});

/**
 * GET /api/admin/stats
 * Get system statistics
 */
router.get('/stats', authenticateAdmin, (req, res) => {
  try {
    const stats = {
      serverUptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      nodeVersion: process.version,
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString(),
      features: {
        emailService: !!(process.env.SMTP_HOST && process.env.SMTP_USER),
        spamDetection: true,
        rateLimiting: true,
        dataValidation: true,
        sanitization: true
      }
    };

    res.status(200).json({
      success: true,
      stats
    });

  } catch (error) {
    console.error('Failed to get admin stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve statistics'
    });
  }
});

/**
 * POST /api/admin/test-email
 * Test email configuration
 */
router.post('/test-email', authenticateAdmin, async (req, res) => {
  try {
    const EmailService = require('../utils/emailService');
    const emailService = new EmailService();

    // Test email data
    const testData = {
      name: 'Test User',
      email: process.env.ADMIN_EMAIL,
      message: 'This is a test email from the admin dashboard to verify email configuration.',
      timestamp: new Date().toISOString(),
      ip: 'admin-test',
      userAgent: 'Admin Dashboard Test'
    };

    const spamAnalysis = {
      isSpam: false,
      spamScore: 0,
      threshold: 7,
      confidence: 0,
      flags: []
    };

    const result = await emailService.sendContactEmail(testData, spamAnalysis);

    res.status(200).json({
      success: true,
      message: 'Test email sent successfully',
      result
    });

  } catch (error) {
    console.error('Failed to send test email:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send test email',
      details: error.message
    });
  }
});

/**
 * POST /api/admin/generate-password-hash
 * Generate password hash for environment setup (development only)
 */
if (process.env.NODE_ENV === 'development') {
  router.post('/generate-password-hash', [
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
  ], async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { password } = req.body;
      const saltRounds = 12;
      const hash = await bcrypt.hash(password, saltRounds);

      res.status(200).json({
        success: true,
        message: 'Password hash generated',
        hash,
        note: 'Add this hash to your .env file as ADMIN_PASSWORD_HASH'
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to generate password hash'
      });
    }
  });
}

module.exports = router;
