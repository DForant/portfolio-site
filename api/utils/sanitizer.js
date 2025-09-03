const createDOMPurify = require('dompurify');
const { JSDOM } = require('jsdom');

// Create DOMPurify instance
const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);

/**
 * Data Sanitization Utilities
 * Cleans and validates form input data
 */

class DataSanitizer {
  /**
   * Sanitize contact form data
   * @param {Object} formData - Raw form data
   * @returns {Object} Sanitized form data
   */
  static sanitizeContactForm(formData) {
    const { name, email, message } = formData;

    return {
      name: this.sanitizeName(name),
      email: this.sanitizeEmail(email),
      message: this.sanitizeMessage(message),
      timestamp: new Date().toISOString(),
      ip: formData.ip || 'unknown',
      userAgent: this.sanitizeUserAgent(formData.userAgent)
    };
  }

  /**
   * Sanitize name field
   * @param {string} name - Raw name input
   * @returns {string} Sanitized name
   */
  static sanitizeName(name) {
    if (!name || typeof name !== 'string') {
      throw new Error('Name is required and must be a string');
    }

    // Remove HTML tags and scripts
    let sanitized = DOMPurify.sanitize(name, { ALLOWED_TAGS: [] });
    
    // Remove excessive whitespace
    sanitized = sanitized.replace(/\s+/g, ' ').trim();
    
    // Remove special characters except basic punctuation
    sanitized = sanitized.replace(/[^\w\s\-'\.]/g, '');
    
    // Limit length
    sanitized = sanitized.substring(0, 100);
    
    // Check minimum length
    if (sanitized.length < 1) {
      throw new Error('Name cannot be empty after sanitization');
    }

    return sanitized;
  }

  /**
   * Sanitize email field
   * @param {string} email - Raw email input
   * @returns {string} Sanitized email
   */
  static sanitizeEmail(email) {
    if (!email || typeof email !== 'string') {
      throw new Error('Email is required and must be a string');
    }

    // Remove HTML tags and scripts
    let sanitized = DOMPurify.sanitize(email, { ALLOWED_TAGS: [] });
    
    // Remove whitespace
    sanitized = sanitized.replace(/\s/g, '').toLowerCase();
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(sanitized)) {
      throw new Error('Invalid email format');
    }

    // Limit length
    sanitized = sanitized.substring(0, 320); // RFC 5321 limit

    return sanitized;
  }

  /**
   * Sanitize message field
   * @param {string} message - Raw message input
   * @returns {string} Sanitized message
   */
  static sanitizeMessage(message) {
    if (!message || typeof message !== 'string') {
      throw new Error('Message is required and must be a string');
    }

    // Remove dangerous HTML tags but allow basic formatting
    let sanitized = DOMPurify.sanitize(message, {
      ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u'],
      ALLOWED_ATTR: []
    });

    // Remove excessive whitespace but preserve line breaks
    sanitized = sanitized.replace(/[ \t]+/g, ' '); // Replace multiple spaces/tabs with single space
    sanitized = sanitized.replace(/\n\s*\n\s*\n/g, '\n\n'); // Limit consecutive line breaks
    
    // Trim whitespace from start and end
    sanitized = sanitized.trim();
    
    // Limit length
    sanitized = sanitized.substring(0, 5000);
    
    // Check minimum length
    if (sanitized.length < 10) {
      throw new Error('Message must be at least 10 characters long');
    }

    return sanitized;
  }

  /**
   * Sanitize user agent string
   * @param {string} userAgent - Raw user agent
   * @returns {string} Sanitized user agent
   */
  static sanitizeUserAgent(userAgent) {
    if (!userAgent || typeof userAgent !== 'string') {
      return 'unknown';
    }

    // Remove HTML tags
    let sanitized = DOMPurify.sanitize(userAgent, { ALLOWED_TAGS: [] });
    
    // Limit length
    sanitized = sanitized.substring(0, 500);
    
    return sanitized || 'unknown';
  }

  /**
   * Validate sanitized data
   * @param {Object} sanitizedData - Already sanitized data
   * @returns {Object} Validation result
   */
  static validateData(sanitizedData) {
    const errors = [];

    // Validate name
    if (!sanitizedData.name || sanitizedData.name.length < 1) {
      errors.push('Name is required');
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!sanitizedData.email || !emailRegex.test(sanitizedData.email)) {
      errors.push('Valid email is required');
    }

    // Validate message
    if (!sanitizedData.message || sanitizedData.message.length < 10) {
      errors.push('Message must be at least 10 characters long');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Escape data for safe display
   * @param {string} text - Text to escape
   * @returns {string} Escaped text
   */
  static escapeForDisplay(text) {
    if (!text || typeof text !== 'string') {
      return '';
    }

    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;');
  }

  /**
   * Sanitize and validate admin input
   * @param {Object} adminData - Admin form data
   * @returns {Object} Sanitized admin data
   */
  static sanitizeAdminData(adminData) {
    const sanitized = {};

    // Sanitize each field if present
    Object.keys(adminData).forEach(key => {
      const value = adminData[key];
      
      if (typeof value === 'string') {
        // Remove HTML tags
        sanitized[key] = DOMPurify.sanitize(value, { ALLOWED_TAGS: [] }).trim();
      } else {
        sanitized[key] = value;
      }
    });

    return sanitized;
  }
}

module.exports = DataSanitizer;
