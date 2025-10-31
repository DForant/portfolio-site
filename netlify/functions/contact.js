/**
 * Netlify Function: Contact Form Handler
 * Handles contact form submissions with validation and email sending
 */

const nodemailer = require('nodemailer');
const xss = require('xss');

const ENABLE_DEBUG = process.env.ENABLE_EMAIL_DEBUG === '1';

// Basic spam check
function basicSpamCheck(data) {
  const { firstName, lastName, description } = data;
  let score = 0;
  const flags = [];

  // Check for suspicious patterns
  if (!firstName || !lastName) {
    score += 5;
    flags.push('missing-name');
  }

  if (!description || description.length < 10) {
    score += 5;
    flags.push('short-description');
  }

  // Check for common spam keywords
  const spamKeywords = ['viagra', 'cialis', 'casino', 'lottery', 'winner', 'click here'];
  const text = `${firstName} ${lastName} ${description}`.toLowerCase();
  spamKeywords.forEach(keyword => {
    if (text.includes(keyword)) {
      score += 10;
      flags.push(`spam-keyword-${keyword}`);
    }
  });

  // Check for excessive links
  const linkCount = (description.match(/https?:\/\//gi) || []).length;
  if (linkCount > 3) {
    score += 5;
    flags.push('excessive-links');
  }

  return {
    score,
    flags,
    isSpam: score >= 10
  };
}

// Build email transporter
function buildTransporter() {
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: (process.env.SMTP_PORT === '465'),
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
    });
  }
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
    });
  }
  return nodemailer.createTransport({
    jsonTransport: true // fallback for dev; logs email JSON
  });
}

exports.handler = async (event) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ success: false, message: 'Method not allowed' })
    };
  }

  try {
    const data = JSON.parse(event.body);
    const { firstName, lastName, company = '', phone, email = '', description, services = [] } = data;

    // Basic validation
    if (!firstName || !lastName || !phone || !description) {
      return {
        statusCode: 400,
        body: JSON.stringify({ 
          success: false, 
          message: 'Missing required fields: firstName, lastName, phone, description' 
        })
      };
    }

    // Sanitize inputs
    const sanitizedData = {
      firstName: xss(firstName.trim()),
      lastName: xss(lastName.trim()),
      company: xss(company.trim()),
      phone: xss(phone.trim()),
      email: email ? xss(email.trim()) : '',
      description: xss(description.trim()),
      services: Array.isArray(services) ? services.map(s => xss(s)) : []
    };

    // Spam check
    const spamCheck = basicSpamCheck(sanitizedData);
    if (spamCheck.isSpam) {
      return {
        statusCode: 400,
        body: JSON.stringify({ 
          success: false, 
          message: 'Detected as spam. Please revise and try again.' 
        })
      };
    }

    const fullName = `${sanitizedData.firstName} ${sanitizedData.lastName}`.trim();
    const submittedAt = new Date();

    const html = `
      <div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto;padding:20px;background:#f8f9fa;">
        <h2 style="color:#4A6C9B;margin-top:0;">New Project Inquiry</h2>
        <p><strong>Name:</strong> ${fullName}</p>
        <p><strong>Company:</strong> ${sanitizedData.company || '—'}</p>
        <p><strong>Phone:</strong> ${sanitizedData.phone}</p>
        <p><strong>Email:</strong> ${sanitizedData.email || '—'}</p>
        <p><strong>Services:</strong> ${sanitizedData.services.join(', ') || '—'}</p>
        <p><strong>Submitted:</strong> ${submittedAt.toISOString()}</p>
        <hr />
        <p style="white-space:pre-wrap;line-height:1.5;">${sanitizedData.description}</p>
        <hr />
        <small style="color:#555;">Spam score: ${spamCheck.score} | Flags: ${spamCheck.flags.join(', ') || 'none'}</small>
      </div>`;

    const transporter = buildTransporter();
    const fromEmail = process.env.SMTP_USER || process.env.EMAIL_USER || 'noreply@deanforantdesigns.com';
    const toEmail = process.env.CONTACT_TO || 'dean@deanforantdesigns.com';

    const info = await transporter.sendMail({
      from: `Portfolio Inquiry <${fromEmail}>`,
      to: toEmail,
      subject: 'New Inquiry from Website',
      html,
      replyTo: sanitizedData.email || undefined
    });

    if (ENABLE_DEBUG) {
      console.log('[Contact Function] Email sent:', info.messageId || info);
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        success: true, 
        message: 'Thank you! Your message was sent successfully.' 
      })
    };

  } catch (error) {
    console.error('[Contact Function] Error:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: false,
        message: 'Server error sending email. Please try again later.',
        error: ENABLE_DEBUG ? error.message : undefined
      })
    };
  }
};
