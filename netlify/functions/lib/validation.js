// Lightweight validation & spam logic for Netlify Function
// Mirrors backend/validation.js but without express-validator dependency weight.

const xss = require('xss');

function sanitize(val) {
  if (typeof val !== 'string') return '';
  return xss(val.trim());
}

function validatePayload(body) {
  const errors = [];
  const out = {};

  const reqField = (key, label, fn) => {
    const raw = body[key];
    const val = typeof raw === 'string' ? raw.trim() : '';
    if (!val) { errors.push({ field: key, message: `${label} is required` }); return; }
    if (fn && !fn(val)) { /* fn should push its own error if needed */ }
    out[key] = sanitize(val);
  };

  // First / Last Name
  reqField('firstName', 'First name', (v) => {
    if (!/^[A-Za-z]{2,}$/.test(v)) { errors.push({ field: 'firstName', message: 'First name must be letters only (min 2).' }); return false; }
    return true;
  });
  reqField('lastName', 'Last name', (v) => {
    if (!/^[A-Za-z]{2,}$/.test(v)) { errors.push({ field: 'lastName', message: 'Last name must be letters only (min 2).' }); return false; }
    return true;
  });

  // Company (optional)
  if (body.company) {
    const c = String(body.company).trim();
    if (c.length > 120) errors.push({ field: 'company', message: 'Company max 120 chars.' });
    else out.company = sanitize(c);
  } else {
    out.company = '';
  }

  // Phone
  reqField('phone', 'Phone number', (v) => {
    if (!/^[+]?[(]?[0-9]{1,4}[)]?[-\s0-9]{5,}$/.test(v)) { errors.push({ field: 'phone', message: 'Provide a valid phone number.' }); return false; }
    return true;
  });

  // Email
  reqField('email', 'Email', (v) => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) { errors.push({ field: 'email', message: 'Invalid email address.' }); return false; }
    return true;
  });

  // Description
  reqField('description', 'Description', (v) => {
    if (v.length < 10 || v.length > 5000) { errors.push({ field: 'description', message: 'Description must be 10-5000 chars.' }); return false; }
    return true;
  });

  // Services (optional array)
  if (Array.isArray(body.services)) {
    if (body.services.length > 10) errors.push({ field: 'services', message: 'Services max 10 items.' });
    out.services = body.services.filter(s => typeof s === 'string' && s.length <= 40).slice(0, 10);
  } else {
    out.services = [];
  }

  return { errors, data: out };
}

function basicSpamCheck({ firstName, lastName, description }) {
  const text = `${firstName} ${lastName} ${description}`.toLowerCase();
  const spamWords = ['viagra','casino','lottery','winner','bitcoin','crypto','million'];
  let score = 0; const flags = [];
  spamWords.forEach(w => { if (text.includes(w)) { score += 2; flags.push(`contains:${w}`); } });
  if (/(.)\1{5,}/.test(text)) { score += 2; flags.push('repeat-chars'); }
  if (description && description.split(' ').length < 3) { score += 1; flags.push('too-short'); }
  return { isSpam: score >= 3, score, flags };
}

module.exports = { validatePayload, basicSpamCheck, sanitize };