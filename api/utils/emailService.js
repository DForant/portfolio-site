const nodemailer = require('nodemailer');

/**
 * Email Service for sending contact form submissions
 */

class EmailService {
  constructor() {
    this.transporter = null;
    this.initializeTransporter();
  }

  /**
   * Initialize email transporter
   */
  async initializeTransporter() {
    try {
      // Create transporter
      this.transporter = nodemailer.createTransporter({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
        tls: {
          rejectUnauthorized: false // Allow self-signed certificates in development
        }
      });

      // Verify connection
      await this.transporter.verify();
      console.log('✅ Email transporter initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize email transporter:', error.message);
      this.transporter = null;
    }
  }

  /**
   * Send contact form email to admin
   * @param {Object} formData - Sanitized form data
   * @param {Object} spamAnalysis - Spam detection results
   * @returns {Promise<Object>} Send result
   */
  async sendContactEmail(formData, spamAnalysis) {
    if (!this.transporter) {
      throw new Error('Email transporter not available');
    }

    const { name, email, message, timestamp, ip, userAgent } = formData;
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminName = process.env.ADMIN_NAME || 'Admin';

    // Create email content
    const subject = `New Contact Form Submission from ${name}`;
    
    const htmlContent = this.generateEmailHTML({
      name,
      email,
      message,
      timestamp,
      ip,
      userAgent,
      spamAnalysis
    });

    const textContent = this.generateEmailText({
      name,
      email,
      message,
      timestamp,
      ip,
      userAgent,
      spamAnalysis
    });

    const mailOptions = {
      from: {
        name: 'Portfolio Contact Form',
        address: process.env.SMTP_USER
      },
      to: {
        name: adminName,
        address: adminEmail
      },
      replyTo: {
        name: name,
        address: email
      },
      subject: subject,
      text: textContent,
      html: htmlContent,
      headers: {
        'X-Priority': spamAnalysis.isSpam ? '3' : '1', // Lower priority if spam detected
        'X-Spam-Score': spamAnalysis.spamScore.toString(),
        'X-Form-Source': 'Portfolio Website'
      }
    };

    try {
      const result = await this.transporter.sendMail(mailOptions);
      console.log(`✅ Email sent successfully: ${result.messageId}`);
      
      return {
        success: true,
        messageId: result.messageId,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('❌ Failed to send email:', error.message);
      throw new Error('Failed to send email');
    }
  }

  /**
   * Send auto-reply to form submitter
   * @param {Object} formData - Sanitized form data
   * @returns {Promise<Object>} Send result
   */
  async sendAutoReply(formData) {
    if (!this.transporter) {
      throw new Error('Email transporter not available');
    }

    const { name, email } = formData;
    const adminName = process.env.ADMIN_NAME || 'Dean Forant';

    const subject = `Thank you for contacting ${adminName}`;
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
          <meta charset="utf-8">
          <style>
              body { font-family: 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #6B8BBF 0%, #4A6C9B 50%, #3A5A8A 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
              .footer { margin-top: 20px; padding: 20px; background: #4A6C9B; color: white; text-align: center; border-radius: 8px; font-size: 14px; }
              h1 { margin: 0; font-size: 24px; }
              .highlight { color: #FDB813; font-weight: bold; }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="header">
                  <h1>Thank You, ${name}!</h1>
              </div>
              <div class="content">
                  <p>Hello ${name},</p>
                  
                  <p>Thank you for reaching out through my portfolio website. I've received your message and appreciate you taking the time to contact me.</p>
                  
                  <p><strong>What happens next?</strong></p>
                  <ul>
                      <li>I'll review your message within <span class="highlight">24 hours</span></li>
                      <li>You'll receive a personal response from me directly</li>
                      <li>If it's a project inquiry, I'll provide initial thoughts and next steps</li>
                  </ul>
                  
                  <p>In the meantime, feel free to:</p>
                  <ul>
                      <li>Check out my latest work on <a href="https://www.behance.net/deanforant" style="color: #4A6C9B;">Behance</a></li>
                      <li>Connect with me on <a href="https://linkedin.com/in/deanforant" style="color: #4A6C9B;">LinkedIn</a></li>
                      <li>Follow my design insights on social media</li>
                  </ul>
                  
                  <p>Looking forward to our conversation!</p>
                  
                  <p>Best regards,<br>
                  <strong>${adminName}</strong><br>
                  Brand & Web Design</p>
              </div>
              <div class="footer">
                  <p>This is an automated response. Please don't reply to this email.</p>
                  <p>© ${new Date().getFullYear()} ${adminName} Designs. All rights reserved.</p>
              </div>
          </div>
      </body>
      </html>
    `;

    const textContent = `
Thank You, ${name}!

Thank you for reaching out through my portfolio website. I've received your message and appreciate you taking the time to contact me.

What happens next?
- I'll review your message within 24 hours
- You'll receive a personal response from me directly
- If it's a project inquiry, I'll provide initial thoughts and next steps

In the meantime, feel free to check out my latest work or connect with me on social media.

Looking forward to our conversation!

Best regards,
${adminName}
Brand & Web Design

---
This is an automated response. Please don't reply to this email.
© ${new Date().getFullYear()} ${adminName} Designs. All rights reserved.
    `;

    const mailOptions = {
      from: {
        name: `${adminName} - Portfolio`,
        address: process.env.SMTP_USER
      },
      to: {
        name: name,
        address: email
      },
      subject: subject,
      text: textContent,
      html: htmlContent,
      headers: {
        'X-Priority': '3',
        'X-Auto-Response-Suppress': 'OOF, DR, RN, NRN',
        'X-Form-Source': 'Portfolio Website Auto-Reply'
      }
    };

    try {
      const result = await this.transporter.sendMail(mailOptions);
      console.log(`✅ Auto-reply sent successfully: ${result.messageId}`);
      
      return {
        success: true,
        messageId: result.messageId,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('❌ Failed to send auto-reply:', error.message);
      // Don't throw error for auto-reply failures
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Generate HTML email content
   */
  generateEmailHTML({ name, email, message, timestamp, ip, userAgent, spamAnalysis }) {
    const spamBadge = spamAnalysis.isSpam 
      ? '<span style="background: #dc3545; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px;">SPAM DETECTED</span>'
      : '<span style="background: #28a745; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px;">LEGITIMATE</span>';

    return `
      <!DOCTYPE html>
      <html>
      <head>
          <meta charset="utf-8">
          <style>
              body { font-family: 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; }
              .container { max-width: 700px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
              .header { background: linear-gradient(135deg, #6B8BBF 0%, #4A6C9B 50%, #3A5A8A 100%); color: white; padding: 30px; text-align: center; }
              .content { padding: 30px; }
              .meta-info { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
              .spam-analysis { background: ${spamAnalysis.isSpam ? '#fff5f5' : '#f0fff4'}; border: 1px solid ${spamAnalysis.isSpam ? '#fed7d7' : '#c6f6d5'}; padding: 20px; border-radius: 8px; margin: 20px 0; }
              .message-content { background: #ffffff; border: 1px solid #e2e8f0; padding: 20px; border-radius: 8px; margin: 20px 0; }
              .label { font-weight: bold; color: #4A6C9B; }
              .flags { background: #fff; padding: 10px; border-radius: 4px; margin-top: 10px; }
              .flag { background: #ffeaa7; padding: 2px 6px; border-radius: 3px; font-size: 12px; margin: 2px; display: inline-block; }
              h1 { margin: 0; font-size: 24px; }
              h2 { color: #4A6C9B; border-bottom: 2px solid #4A6C9B; padding-bottom: 10px; }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="header">
                  <h1>📧 New Contact Form Submission</h1>
                  <p>Received from Portfolio Website</p>
              </div>
              
              <div class="content">
                  <div class="meta-info">
                      <h2>📋 Contact Information</h2>
                      <p><span class="label">Name:</span> ${name}</p>
                      <p><span class="label">Email:</span> <a href="mailto:${email}">${email}</a></p>
                      <p><span class="label">Timestamp:</span> ${new Date(timestamp).toLocaleString()}</p>
                      <p><span class="label">IP Address:</span> ${ip}</p>
                      <p><span class="label">User Agent:</span> ${userAgent}</p>
                  </div>

                  <div class="spam-analysis">
                      <h2>🛡️ Spam Analysis ${spamBadge}</h2>
                      <p><span class="label">Spam Score:</span> ${spamAnalysis.spamScore}/${spamAnalysis.threshold}</p>
                      <p><span class="label">Confidence:</span> ${spamAnalysis.confidence}%</p>
                      ${spamAnalysis.flags.length > 0 ? `
                          <div class="flags">
                              <p><span class="label">Detected Issues:</span></p>
                              ${spamAnalysis.flags.map(flag => `<span class="flag">${flag}</span>`).join('')}
                          </div>
                      ` : '<p style="color: #28a745;">No spam indicators detected ✅</p>'}
                  </div>

                  <div class="message-content">
                      <h2>💬 Message</h2>
                      <div style="white-space: pre-wrap; background: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #4A6C9B;">${message}</div>
                  </div>

                  <div style="text-align: center; margin-top: 30px; padding: 20px; background: #f8f9fa; border-radius: 8px;">
                      <p style="margin: 0; color: #666;">You can reply directly to this email to respond to ${name}</p>
                  </div>
              </div>
          </div>
      </body>
      </html>
    `;
  }

  /**
   * Generate plain text email content
   */
  generateEmailText({ name, email, message, timestamp, ip, userAgent, spamAnalysis }) {
    return `
NEW CONTACT FORM SUBMISSION
===========================

Contact Information:
- Name: ${name}
- Email: ${email}
- Timestamp: ${new Date(timestamp).toLocaleString()}
- IP Address: ${ip}
- User Agent: ${userAgent}

Spam Analysis:
- Status: ${spamAnalysis.isSpam ? 'SPAM DETECTED' : 'LEGITIMATE'}
- Spam Score: ${spamAnalysis.spamScore}/${spamAnalysis.threshold}
- Confidence: ${spamAnalysis.confidence}%
${spamAnalysis.flags.length > 0 ? `
- Issues Detected:
  ${spamAnalysis.flags.map(flag => `  • ${flag}`).join('\n')}
` : '- No spam indicators detected ✅'}

Message:
--------
${message}

---
You can reply directly to this email to respond to ${name}
    `;
  }
}

module.exports = EmailService;
