import { useState, useCallback } from 'react';

const defaultServices = ['Brand Design', 'Web Design', 'Creative Direction'];

const validators = {
  firstName: (v) => {
    const val = v.trim();
    if (!val) return 'First name is required';
    if (!/^[A-Za-z]{2,}$/.test(val)) return 'Only letters, min 2 characters';
    return '';
  },
  lastName: (v) => {
    const val = v.trim();
    if (!val) return 'Last name is required';
    if (!/^[A-Za-z]{2,}$/.test(val)) return 'Only letters, min 2 characters';
    return '';
  },
  phone: (v) => {
    const val = v.trim();
    if (!val) return 'Phone number is required';
    if (!/^[+]?[(]?[0-9]{1,4}[)]?[-\s0-9]{5,}$/.test(val)) return 'Enter valid phone number';
    return '';
  },
  email: (v) => {
    const val = v.trim();
    if (!val) return 'Email is required';
    if (!/^\S+@\S+\.\S+$/.test(val)) return 'Enter a valid email';
    return '';
  },
  description: (v) => {
    const val = v.trim();
    if (!val) return 'Description is required';
    if (val.length < 10) return 'Minimum 10 characters';
    if (val.length > 5000) return 'Maximum 5000 characters';
    return '';
  },
};

function sanitizeText(value) {
  return value.replace(/[<>]/g, '').trim();
}

/**
 * Contact component - Contact form section
 * @param {Object} props
 * @param {string} props.title - Section title
 * @param {string} props.leadText - Lead paragraph text
 * @param {Array} props.bulletPoints - Array of bullet point strings
 * @param {string} props.assuranceText - Privacy assurance text
 * @param {Array} props.serviceOptions - Array of service option strings
 */
function Contact({
  title = "Ready to Win? Let's Build Your Brand.",
  leadText = "I'd love to learn about your goals, challenges, and what success looks like for you. Share as much context as you can—this helps me prepare meaningful next steps.",
  bulletPoints = [
    'Project type or problem you\'re solving',
    'Any timeline considerations',
    'Brand maturity (new / refresh / expansion)',
    'Links or references (if relevant)',
  ],
  assuranceText = 'Your info is kept private and only used to respond to your inquiry.',
  serviceOptions = defaultServices,
}) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    company: '',
    phone: '',
    email: '',
    description: '',
    services: [],
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [status, setStatus] = useState({ message: '', type: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateField = useCallback((name, value) => {
    if (validators[name]) {
      return validators[name](value);
    }
    return '';
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === 'checkbox') {
      setFormData((prev) => ({
        ...prev,
        services: checked
          ? [...prev.services, value]
          : prev.services.filter((s) => s !== value),
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const error = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ message: 'Validating...', type: 'info' });

    // Validate all fields
    const newErrors = {};
    let hasErrors = false;

    Object.keys(validators).forEach((field) => {
      const error = validateField(field, formData[field]);
      if (error) {
        newErrors[field] = error;
        hasErrors = true;
      }
    });

    setErrors(newErrors);
    setTouched({
      firstName: true,
      lastName: true,
      phone: true,
      email: true,
      description: true,
    });

    if (hasErrors) {
      setStatus({ message: 'Please correct the errors above.', type: 'error' });
      return;
    }

    setIsSubmitting(true);
    setStatus({ message: 'Sending...', type: 'info' });

    // Prepare payload
    const payload = {
      firstName: sanitizeText(formData.firstName),
      lastName: sanitizeText(formData.lastName),
      company: sanitizeText(formData.company),
      phone: sanitizeText(formData.phone),
      email: sanitizeText(formData.email),
      description: sanitizeText(formData.description),
      services: formData.services.slice(0, 10),
    };

    // Determine API endpoint
    let endpoint = '/api/contact';
    try {
      const host = window.location.hostname;
      const port = window.location.port;
      if (
        (host === 'localhost' || host === '127.0.0.1') &&
        port &&
        port !== '4000' &&
        port !== '8888' &&
        port !== '8889'
      ) {
        endpoint = 'http://localhost:4000/api/contact';
      }
    } catch {
      // Keep default endpoint
    }

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({
        success: false,
        message: 'Unexpected server response',
      }));

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Submission failed');
      }

      setStatus({
        message: data.message || 'Message sent successfully!',
        type: 'success',
      });

      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        company: '',
        phone: '',
        email: '',
        description: '',
        services: [],
      });
      setTouched({});
      setErrors({});

      // Clear success message after 8 seconds
      setTimeout(() => {
        setStatus({ message: '', type: '' });
      }, 8000);
    } catch (err) {
      console.error('Contact form error:', err);
      setStatus({
        message: err.message || 'An error occurred. Please try again later.',
        type: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="contact" aria-labelledby="contact-title">
      <div className="section__container contact__container">
        <div className="contact__heading-row">
          <h2 id="contact-title" className="section__title">
            {title}
          </h2>
        </div>
        <div className="contact__layout">
          <div className="contact__content">
            <p className="contact__lead">{leadText}</p>
            <ul className="contact__bullets" aria-label="What to include">
              {bulletPoints.map((point, index) => (
                <li key={index} className="contact__bullet">
                  {point}
                </li>
              ))}
            </ul>
            <p className="contact__assurance">{assuranceText}</p>
          </div>

          <form
            id="contact-form"
            className="contact__form"
            noValidate
            aria-describedby="contact-form-status"
            onSubmit={handleSubmit}
          >
            <div className="contact__form__row">
              <div className="contact__form__group">
                <label htmlFor="firstName" className="contact__form__label">
                  First Name *
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  inputMode="text"
                  autoComplete="given-name"
                  required
                  minLength={2}
                  pattern="^[A-Za-z]{2,}$"
                  className={`contact__form__input${errors.firstName && touched.firstName ? ' contact__form__input--error' : ''}`}
                  placeholder="Jane"
                  aria-required="true"
                  value={formData.firstName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                <p
                  className="contact__form__error"
                  data-error-for="firstName"
                  aria-live="polite"
                >
                  {touched.firstName && errors.firstName}
                </p>
              </div>
              <div className="contact__form__group">
                <label htmlFor="lastName" className="contact__form__label">
                  Last Name *
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  inputMode="text"
                  autoComplete="family-name"
                  required
                  minLength={2}
                  pattern="^[A-Za-z]{2,}$"
                  className={`contact__form__input${errors.lastName && touched.lastName ? ' contact__form__input--error' : ''}`}
                  placeholder="Doe"
                  aria-required="true"
                  value={formData.lastName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                <p
                  className="contact__form__error"
                  data-error-for="lastName"
                  aria-live="polite"
                >
                  {touched.lastName && errors.lastName}
                </p>
              </div>
            </div>

            <div className="contact__form__row">
              <div className="contact__form__group">
                <label htmlFor="company" className="contact__form__label">
                  Company
                </label>
                <input
                  id="company"
                  name="company"
                  type="text"
                  autoComplete="organization"
                  maxLength={100}
                  className="contact__form__input"
                  placeholder="Company Name"
                  value={formData.company}
                  onChange={handleChange}
                />
                <p className="contact__form__error" data-error-for="company" aria-live="polite"></p>
              </div>
              <div className="contact__form__group">
                <label htmlFor="phone" className="contact__form__label">
                  Phone Number *
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  required
                  className={`contact__form__input${errors.phone && touched.phone ? ' contact__form__input--error' : ''}`}
                  placeholder="(555) 123-4567"
                  aria-required="true"
                  pattern="^[+]?[(]?[0-9]{1,4}[)]?[-\s0-9]*$"
                  value={formData.phone}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                <p
                  className="contact__form__error"
                  data-error-for="phone"
                  aria-live="polite"
                >
                  {touched.phone && errors.phone}
                </p>
              </div>
            </div>

            <div className="contact__form__row">
              <div className="contact__form__group">
                <label htmlFor="email" className="contact__form__label">
                  Email *
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  aria-required="true"
                  className={`contact__form__input${errors.email && touched.email ? ' contact__form__input--error' : ''}`}
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                <p
                  className="contact__form__error"
                  data-error-for="email"
                  aria-live="polite"
                >
                  {touched.email && errors.email}
                </p>
              </div>
            </div>

            <div className="contact__form__row contact__form__row--full">
              <fieldset className="contact__form__group contact__form__services contact__form__services--boxed">
                <legend className="contact__form__label contact__form__label--legend">
                  Services Interested In
                </legend>
                <div className="contact__form__checkboxes">
                  {serviceOptions.map((service) => (
                    <label key={service} className="contact__form__checkbox">
                      <input
                        type="checkbox"
                        name="services"
                        value={service}
                        checked={formData.services.includes(service)}
                        onChange={handleChange}
                      />
                      <span>
                        {service === 'Creative Direction'
                          ? 'Creative Direction & Consultation'
                          : service}
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>
            </div>

            <div className="contact__form__group">
              <label htmlFor="description" className="contact__form__label">
                Description of work needed *{' '}
                <span className="contact__form__hint">(10–5000 characters)</span>
              </label>
              <textarea
                id="description"
                name="description"
                required
                minLength={10}
                maxLength={5000}
                className={`contact__form__textarea${errors.description && touched.description ? ' contact__form__input--error' : ''}`}
                placeholder="Tell me about your project goals, timeline, and any specifics you'd like to share."
                aria-required="true"
                value={formData.description}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              <p
                className="contact__form__error"
                data-error-for="description"
                aria-live="polite"
              >
                {touched.description && errors.description}
              </p>
            </div>

            <div className="contact__form__meta">
              <small className="contact__form__required-note">* Required fields</small>
            </div>

            <div className="contact__form__actions">
              <button
                type="submit"
                className="btn btn--primary contact__form__submit"
                id="contact-submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit'}
              </button>
              <div
                className={`contact__form__status${status.type ? ` contact__form__status--${status.type}` : ''}`}
                id="contact-form-status"
                role="status"
                aria-live="polite"
              >
                {status.message}
              </div>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}

export default Contact;
