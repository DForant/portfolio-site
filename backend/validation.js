// Shared validation & sanitization helpers for contact form
const { body } = require('express-validator');
const xss = require('xss');

const sanitize = (val) => {
  if (typeof val !== 'string') return '';
  return xss(val.trim());
};

const contactValidators = [
  body('firstName')
    .trim()
    .matches(/^[A-Za-z]{2,}$/)
    .withMessage('First name must be letters only (min 2).')
    .isLength({ min: 2, max: 100 })
    .withMessage('First name must be 2-100 chars.')
    .customSanitizer(sanitize),
  body('lastName')
    .trim()
    .matches(/^[A-Za-z]{2,}$/)
    .withMessage('Last name must be letters only (min 2).')
    .isLength({ min: 2, max: 100 })
    .withMessage('Last name must be 2-100 chars.')
    .customSanitizer(sanitize),
  body('company')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ max: 120 }).withMessage('Company max 120 chars.')
    .customSanitizer(sanitize),
  body('phone')
    .trim()
    .matches(/^[+]?[(]?[0-9]{1,4}[)]?[-\s0-9]{5,}$/)
    .withMessage('Provide a valid phone number.')
    .customSanitizer(sanitize),
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required.')
    .isEmail().withMessage('Invalid email address.')
    .normalizeEmail(),
  body('description')
    .trim()
    .isLength({ min: 10, max: 5000 })
    .withMessage('Description must be 10-5000 chars.')
    .customSanitizer(sanitize),
  body('services')
    .optional({ values: 'falsy' })
    .isArray({ max: 10 }).withMessage('Services must be an array of max 10 items.')
    .custom((arr) => arr.every(v => typeof v === 'string' && v.length <= 40))
    .withMessage('Invalid services values.')
];

function basicSpamCheck({ firstName, lastName, description }) {
  const text = `${firstName} ${lastName} ${description}`.toLowerCase();
  const spamWords = ['viagra','casino','lottery','winner','bitcoin','crypto','million'];
  let score = 0;
  const flags = [];
  spamWords.forEach(w => { if (text.includes(w)) { score += 2; flags.push(`contains:${w}`); } });
  if (/(.)\1{5,}/.test(text)) { score += 2; flags.push('repeat-chars'); }
  if (description && description.split(' ').length < 3) { score += 1; flags.push('too-short'); }
  return { isSpam: score >= 3, score, flags };
}

module.exports = { contactValidators, basicSpamCheck, sanitize };
