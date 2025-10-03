require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const nodemailer = require('nodemailer');
const { validationResult } = require('express-validator');
const { contactValidators, basicSpamCheck } = require('./validation');

const app = express();
const PORT = process.env.PORT || 4000;

// Security
app.use(helmet());
app.use(express.json({ limit: '100kb' }));

// CORS
const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:3000').split(',').map(o => o.trim());
app.use(cors({ origin: allowedOrigins, methods: ['POST','GET'], credentials: false }));

// Rate limit
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false
});
app.use('/api/', limiter);

// Health
app.get('/api/health', (req, res) => res.json({ status: 'ok', ts: Date.now() }));

// Transporter factory
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

// Contact endpoint
app.post('/api/contact', contactValidators, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
  }

  const { firstName, lastName, company = '', phone, email = '', description, services = [] } = req.body;

  // Spam check
  const spam = basicSpamCheck({ firstName, lastName, description });
  if (spam.isSpam) {
    return res.status(400).json({ success: false, message: 'Detected as spam. Please revise and try again.' });
  }

  const fullName = `${firstName} ${lastName}`.trim();
  const submittedAt = new Date();

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto;padding:20px;background:#f8f9fa;">
      <h2 style="color:#4A6C9B;margin-top:0;">New Project Inquiry</h2>
      <p><strong>Name:</strong> ${fullName}</p>
      <p><strong>Company:</strong> ${company || '—'}</p>
      <p><strong>Phone:</strong> ${phone}</p>
      <p><strong>Email:</strong> ${email || '—'}</p>
      <p><strong>Services:</strong> ${(services || []).join(', ') || '—'}</p>
      <p><strong>Submitted:</strong> ${submittedAt.toISOString()}</p>
      <hr />
      <p style="white-space:pre-wrap;line-height:1.5;">${description}</p>
      <hr />
      <small style="color:#555;">Spam score: ${spam.score} | Flags: ${spam.flags.join(', ')}</small>
    </div>`;

  try {
    const transporter = buildTransporter();
    const info = await transporter.sendMail({
      from: `Portfolio Inquiry <${process.env.SMTP_USER || process.env.EMAIL_USER || 'noreply@deanforantdesigns.com'}>`,
      to: 'dean@deanforantdesigns.com',
      subject: 'New Inquiry from Website',
      html,
      replyTo: email || undefined
    });
    console.log('Email processed:', info.messageId || info);
    return res.json({ success: true, message: 'Thank you! Your message was sent successfully.' });
  } catch (err) {
    console.error('Email send failed:', err); // log full error for diagnosis
    const devExtras = process.env.NODE_ENV === 'development' ? { detail: err.message, stack: err.stack } : {};
    return res.status(500).json({ success: false, message: 'Server error sending email. Please try again later.', ...devExtras });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`API listening on port ${PORT}`);
  console.log('Allowed origins:', allowedOrigins.join(', '));
});

module.exports = app;
