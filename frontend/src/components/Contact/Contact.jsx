import { useState, useCallback, useRef } from 'react';

/**
 * Form field validators
 */
const validators = {
  firstName: (v) => {
    v = v.trim();
    if (!v) return 'First name is required';
    if (!/^[A-Za-z]{2,}$/.test(v)) return 'Only letters, min 2 characters';
    return '';
  },
  lastName: (v) => {
    v = v.trim();
    if (!v) return 'Last name is required';
    if (!/^[A-Za-z]{2,}$/.test(v)) return 'Only letters, min 2 characters';
    return '';
  },
  phone: (v) => {
    v = v.trim();
    if (!v) return 'Phone number is required';
    if (!/^[+]?[(]?[0-9]{1,4}[)]?[-\s0-9]{5,}$/.test(v)) return 'Enter valid phone number';
    return '';
  },
  email: (v) => {
    v = v.trim();
    if (!v) return 'Email is required';
    if (!/^\S+@\S+\.\S+$/.test(v)) return 'Enter a valid email';
    return '';
  },
  description: (v) => {
    v = v.trim();
    if (!v) return 'Description is required';
    if (v.length < 10) return 'Minimum 10 characters';
    if (v.length > 5000) return 'Maximum 5000 characters';
    return '';
  },
};

/**
 * Sanitize text input
 * @param {string} value
 * @returns {string}
 */
const sanitizeText = (value) => value.replace(/[<>]/g, '').trim();

/**
 * Get the API endpoint based on environment
 * @returns {string}
 */
const getEndpoint = () => {
  try {
    const host = window.location.hostname;
    const port = window.location.port;
    if ((host === 'localhost' || host === '127.0.0.1') && port && port !== '4000' && port !== '8888' && port !== '8889') {
      return 'http://localhost:4000/api/contact';
    }
  } catch {
    // Ignore
  }
  return '/api/contact';
};

/**
 * Contact component - Contact form section
 * @returns {JSX.Element}
 */
function Contact() {
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
  const [status, setStatus] = useState({ message: '', type: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const statusTimeoutRef = useRef(null);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleServiceChange = useCallback((e) => {
    const { value, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      services: checked
        ? [...prev.services, value]
        : prev.services.filter((s) => s !== value),
    }));
  }, []);

  const validateField = useCallback((name, value) => {
    const validator = validators[name];
    if (validator) {
      const error = validator(value);
      setErrors((prev) => ({ ...prev, [name]: error }));
      return !error;
    }
    return true;
  }, []);

  const handleBlur = useCallback((e) => {
    const { name, value } = e.target;
    validateField(name, value);
  }, [validateField]);

  const setStatusMessage = useCallback((message, type) => {
    if (statusTimeoutRef.current) {
      clearTimeout(statusTimeoutRef.current);
    }
    setStatus({ message, type });
    if (type === 'success') {
      statusTimeoutRef.current = setTimeout(() => {
        setStatus({ message: '', type: '' });
      }, 8000);
    }
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setStatusMessage('Validating...', 'info');

    // Validate all required fields
    let allValid = true;
    const newErrors = {};
    Object.keys(validators).forEach((field) => {
      const error = validators[field](formData[field]);
      if (error) {
        newErrors[field] = error;
        allValid = false;
      }
    });
    setErrors(newErrors);

    if (!allValid) {
      setStatusMessage('Please correct the errors above.', 'error');
      return;
    }

    setIsSubmitting(true);
    setStatusMessage('Sending...', 'info');

    const payload = {
      firstName: sanitizeText(formData.firstName),
      lastName: sanitizeText(formData.lastName),
      company: sanitizeText(formData.company),
      phone: sanitizeText(formData.phone),
      email: sanitizeText(formData.email),
      description: sanitizeText(formData.description),
      services: formData.services.slice(0, 10),
    };

    try {
      const res = await fetch(getEndpoint(), {
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

      setStatusMessage(data.message || 'Message sent successfully!', 'success');
      setFormData({
        firstName: '',
        lastName: '',
        company: '',
        phone: '',
        email: '',
        description: '',
        services: [],
      });
      setErrors({});
    } catch (err) {
      console.error('Contact form error:', err);
      setStatusMessage(err.message || 'An error occurred. Please try again later.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, setStatusMessage]);

  return (
    <section id="contact" className="contact" aria-labelledby="contact-title">
      <div className="section__container contact__container">
        <div className="contact__heading-row">
          <h2 id="contact-title" className="section__title">
            Ready to Win? Let's Build Your Brand.
          </h2>
        </div>
        <div className="contact__layout">
          <div className="contact__content">
            <p className="contact__lead">
              I'd love to learn about your goals, challenges, and what success looks like for you. 
              Share as much context as you can—this helps me prepare meaningful next steps.
            </p>
            <ul className="contact__bullets" aria-label="What to include">
              <li className="contact__bullet">Project type or problem you're solving</li>
              <li className="contact__bullet">Any timeline considerations</li>
              <li className="contact__bullet">Brand maturity (new / refresh / expansion)</li>
              <li className="contact__bullet">Links or references (if relevant)</li>
            </ul>
            <p className="contact__assurance">
              Your info is kept private and only used to respond to your inquiry.
            </p>
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
                <label htmlFor="firstName" className="contact__form__label">First Name *</label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  inputMode="text"
                  autoComplete="given-name"
                  required
                  minLength="2"
                  pattern="^[A-Za-z]{2,}$"
                  className={`contact__form__input${errors.firstName ? ' contact__form__input--error' : ''}`}
                  placeholder="Jane"
                  aria-required="true"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                />
                <p className="contact__form__error" data-error-for="firstName" aria-live="polite">
                  {errors.firstName || ''}
                </p>
              </div>
              <div className="contact__form__group">
                <label htmlFor="lastName" className="contact__form__label">Last Name *</label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  inputMode="text"
                  autoComplete="family-name"
                  required
                  minLength="2"
                  pattern="^[A-Za-z]{2,}$"
                  className={`contact__form__input${errors.lastName ? ' contact__form__input--error' : ''}`}
                  placeholder="Doe"
                  aria-required="true"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                />
                <p className="contact__form__error" data-error-for="lastName" aria-live="polite">
                  {errors.lastName || ''}
                </p>
              </div>
            </div>

            <div className="contact__form__row">
              <div className="contact__form__group">
                <label htmlFor="company" className="contact__form__label">Company</label>
                <input
                  id="company"
                  name="company"
                  type="text"
                  autoComplete="organization"
                  maxLength="100"
                  className="contact__form__input"
                  placeholder="Company Name"
                  value={formData.company}
                  onChange={handleInputChange}
                />
                <p className="contact__form__error" data-error-for="company" aria-live="polite"></p>
              </div>
              <div className="contact__form__group">
                <label htmlFor="phone" className="contact__form__label">Phone Number *</label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  required
                  className={`contact__form__input${errors.phone ? ' contact__form__input--error' : ''}`}
                  placeholder="(555) 123-4567"
                  aria-required="true"
                  pattern="^[+]?[(]?[0-9]{1,4}[)]?[-\s0-9]*$"
                  value={formData.phone}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                />
                <p className="contact__form__error" data-error-for="phone" aria-live="polite">
                  {errors.phone || ''}
                </p>
              </div>
            </div>

            <div className="contact__form__row">
              <div className="contact__form__group">
                <label htmlFor="email" className="contact__form__label">Email *</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  aria-required="true"
                  className={`contact__form__input${errors.email ? ' contact__form__input--error' : ''}`}
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                />
                <p className="contact__form__error" data-error-for="email" aria-live="polite">
                  {errors.email || ''}
                </p>
              </div>
            </div>

            <div className="contact__form__row contact__form__row--full">
              <fieldset className="contact__form__group contact__form__services contact__form__services--boxed">
                <legend className="contact__form__label contact__form__label--legend">
                  Services Interested In
                </legend>
                <div className="contact__form__checkboxes">
                  <label className="contact__form__checkbox">
                    <input
                      type="checkbox"
                      name="services"
                      value="Brand Design"
                      checked={formData.services.includes('Brand Design')}
                      onChange={handleServiceChange}
                    />
                    <span>Brand Design</span>
                  </label>
                  <label className="contact__form__checkbox">
                    <input
                      type="checkbox"
                      name="services"
                      value="Web Design"
                      checked={formData.services.includes('Web Design')}
                      onChange={handleServiceChange}
                    />
                    <span>Web Design</span>
                  </label>
                  <label className="contact__form__checkbox">
                    <input
                      type="checkbox"
                      name="services"
                      value="Creative Direction"
                      checked={formData.services.includes('Creative Direction')}
                      onChange={handleServiceChange}
                    />
                    <span>Creative Direction<br />&amp; Consultation</span>
                  </label>
                </div>
              </fieldset>
            </div>

            <div className="contact__form__group">
              <label htmlFor="description" className="contact__form__label">
                Description of work needed * <span className="contact__form__hint">(10–5000 characters)</span>
              </label>
              <textarea
                id="description"
                name="description"
                required
                minLength="10"
                maxLength="5000"
                className={`contact__form__textarea${errors.description ? ' contact__form__input--error' : ''}`}
                placeholder="Tell me about your project goals, timeline, and any specifics you'd like to share."
                aria-required="true"
                value={formData.description}
                onChange={handleInputChange}
                onBlur={handleBlur}
              />
              <p className="contact__form__error" data-error-for="description" aria-live="polite">
                {errors.description || ''}
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
