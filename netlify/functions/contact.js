// Netlify Function: contact form handler
// Path: /.netlify/functions/contact

const nodemailer = require('nodemailer');
const { validatePayload, basicSpamCheck } = require('./lib/validation');

function buildTransporter() {
  let mode = 'json';
  let transporter;
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    mode = 'smtp';
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: (process.env.SMTP_PORT === '465'),
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
    });
  } else if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    mode = 'gmail';
    transporter = nodemailer.createTransport({ service: 'gmail', auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS } });
  } else {
    transporter = nodemailer.createTransport({ jsonTransport: true });
  }
  if (process.env.ENABLE_EMAIL_DEBUG === '1' || process.env.NODE_ENV !== 'production') {
    console.log(`[contact:function] Email transport mode: ${mode}`);
  }
  return { transporter, mode };
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ success: false, message: 'Method not allowed' }) };
  }

  let payload;
  try { payload = JSON.parse(event.body || '{}'); }
  catch { return { statusCode: 400, body: JSON.stringify({ success: false, message: 'Invalid JSON body' }) }; }

  const { errors, data } = validatePayload(payload);
  if (errors.length) {
    return { statusCode: 400, body: JSON.stringify({ success: false, message: 'Validation failed', errors }) };
  }

  const spam = basicSpamCheck({ firstName: data.firstName, lastName: data.lastName, description: data.description });
  if (spam.isSpam) {
    return { statusCode: 400, body: JSON.stringify({ success: false, message: 'Detected as spam. Please revise and try again.' }) };
  }

  const fullName = `${data.firstName} ${data.lastName}`.trim();
  const submittedAt = new Date();

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto;padding:20px;background:#f8f9fa;">
      <h2 style="color:#4A6C9B;margin-top:0;">New Project Inquiry</h2>
      <p><strong>Name:</strong> ${fullName}</p>
      <p><strong>Company:</strong> ${data.company || '—'}</p>
      <p><strong>Phone:</strong> ${data.phone}</p>
      <p><strong>Email:</strong> ${data.email}</p>
      <p><strong>Services:</strong> ${(data.services || []).join(', ') || '—'}</p>
      <p><strong>Submitted:</strong> ${submittedAt.toISOString()}</p>
      <hr />
      <p style="white-space:pre-wrap;line-height:1.5;">${data.description}</p>
      <hr />
      <small style="color:#555;">Spam score: ${spam.score} | Flags: ${spam.flags.join(', ')}</small>
    </div>`;

  try {
    const { transporter, mode } = buildTransporter();
    if (transporter.verify) {
      try {
        await transporter.verify();
      } catch (verErr) {
        console.warn('[contact:function] Transport verify failed (continuing):', verErr.message);
      }
    }
    const info = await transporter.sendMail({
      from: `Portfolio Inquiry <${process.env.SMTP_USER || process.env.EMAIL_USER || 'noreply@deanforantdesigns.com'}>` ,
      to: 'dean@deanforantdesigns.com',
      subject: 'New Inquiry from Website',
      html,
      replyTo: data.email
    });
    console.log('Function email processed:', info.messageId || info);
    if (process.env.ENABLE_EMAIL_DEBUG === '1' || process.env.NODE_ENV !== 'production') {
      console.log('[contact:function] Debug envelope:', info.envelope || {});
      console.log('[contact:function] Accepted:', info.accepted);
      console.log('[contact:function] Rejected:', info.rejected);
      console.log('[contact:function] Response:', info.response);
    }
    return { statusCode: 200, body: JSON.stringify({ success: true, message: 'Thank you! Your message was sent successfully.', transportMode: mode }) };
  } catch (err) {
    console.error('Function email send failed:', err);
    const devExtras = process.env.NODE_ENV === 'development' ? { detail: err.message } : {};
    return { statusCode: 500, body: JSON.stringify({ success: false, message: 'Server error sending email. Please try again later.', ...devExtras }) };
  }
};
