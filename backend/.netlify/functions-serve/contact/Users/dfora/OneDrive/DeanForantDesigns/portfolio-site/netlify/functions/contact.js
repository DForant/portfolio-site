var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};

// ../netlify/functions/lib/validation.js
var require_validation = __commonJS({
  "../netlify/functions/lib/validation.js"(exports2, module2) {
    var xss = require("xss");
    function sanitize(val) {
      if (typeof val !== "string") return "";
      return xss(val.trim());
    }
    function validatePayload2(body) {
      const errors = [];
      const out = {};
      const reqField = (key, label, fn) => {
        const raw = body[key];
        const val = typeof raw === "string" ? raw.trim() : "";
        if (!val) {
          errors.push({ field: key, message: `${label} is required` });
          return;
        }
        if (fn && !fn(val)) {
        }
        out[key] = sanitize(val);
      };
      reqField("firstName", "First name", (v) => {
        if (!/^[A-Za-z]{2,}$/.test(v)) {
          errors.push({ field: "firstName", message: "First name must be letters only (min 2)." });
          return false;
        }
        return true;
      });
      reqField("lastName", "Last name", (v) => {
        if (!/^[A-Za-z]{2,}$/.test(v)) {
          errors.push({ field: "lastName", message: "Last name must be letters only (min 2)." });
          return false;
        }
        return true;
      });
      if (body.company) {
        const c = String(body.company).trim();
        if (c.length > 120) errors.push({ field: "company", message: "Company max 120 chars." });
        else out.company = sanitize(c);
      } else {
        out.company = "";
      }
      reqField("phone", "Phone number", (v) => {
        if (!/^[+]?[(]?[0-9]{1,4}[)]?[-\s0-9]{5,}$/.test(v)) {
          errors.push({ field: "phone", message: "Provide a valid phone number." });
          return false;
        }
        return true;
      });
      reqField("email", "Email", (v) => {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) {
          errors.push({ field: "email", message: "Invalid email address." });
          return false;
        }
        return true;
      });
      reqField("description", "Description", (v) => {
        if (v.length < 10 || v.length > 5e3) {
          errors.push({ field: "description", message: "Description must be 10-5000 chars." });
          return false;
        }
        return true;
      });
      if (Array.isArray(body.services)) {
        if (body.services.length > 10) errors.push({ field: "services", message: "Services max 10 items." });
        out.services = body.services.filter((s) => typeof s === "string" && s.length <= 40).slice(0, 10);
      } else {
        out.services = [];
      }
      return { errors, data: out };
    }
    function basicSpamCheck2({ firstName, lastName, description }) {
      const text = `${firstName} ${lastName} ${description}`.toLowerCase();
      const spamWords = ["viagra", "casino", "lottery", "winner", "bitcoin", "crypto", "million"];
      let score = 0;
      const flags = [];
      spamWords.forEach((w) => {
        if (text.includes(w)) {
          score += 2;
          flags.push(`contains:${w}`);
        }
      });
      if (/(.)\1{5,}/.test(text)) {
        score += 2;
        flags.push("repeat-chars");
      }
      if (description && description.split(" ").length < 3) {
        score += 1;
        flags.push("too-short");
      }
      return { isSpam: score >= 3, score, flags };
    }
    module2.exports = { validatePayload: validatePayload2, basicSpamCheck: basicSpamCheck2, sanitize };
  }
});

// ../netlify/functions/contact.js
var nodemailer = require("nodemailer");
var { validatePayload, basicSpamCheck } = require_validation();
function buildTransporter() {
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "587", 10),
      secure: process.env.SMTP_PORT === "465",
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
    });
  }
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    return nodemailer.createTransport({ service: "gmail", auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS } });
  }
  return nodemailer.createTransport({ jsonTransport: true });
}
exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ success: false, message: "Method not allowed" }) };
  }
  let payload;
  try {
    payload = JSON.parse(event.body || "{}");
  } catch {
    return { statusCode: 400, body: JSON.stringify({ success: false, message: "Invalid JSON body" }) };
  }
  const { errors, data } = validatePayload(payload);
  if (errors.length) {
    return { statusCode: 400, body: JSON.stringify({ success: false, message: "Validation failed", errors }) };
  }
  const spam = basicSpamCheck({ firstName: data.firstName, lastName: data.lastName, description: data.description });
  if (spam.isSpam) {
    return { statusCode: 400, body: JSON.stringify({ success: false, message: "Detected as spam. Please revise and try again." }) };
  }
  const fullName = `${data.firstName} ${data.lastName}`.trim();
  const submittedAt = /* @__PURE__ */ new Date();
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto;padding:20px;background:#f8f9fa;">
      <h2 style="color:#4A6C9B;margin-top:0;">New Project Inquiry</h2>
      <p><strong>Name:</strong> ${fullName}</p>
      <p><strong>Company:</strong> ${data.company || "\u2014"}</p>
      <p><strong>Phone:</strong> ${data.phone}</p>
      <p><strong>Email:</strong> ${data.email}</p>
      <p><strong>Services:</strong> ${(data.services || []).join(", ") || "\u2014"}</p>
      <p><strong>Submitted:</strong> ${submittedAt.toISOString()}</p>
      <hr />
      <p style="white-space:pre-wrap;line-height:1.5;">${data.description}</p>
      <hr />
      <small style="color:#555;">Spam score: ${spam.score} | Flags: ${spam.flags.join(", ")}</small>
    </div>`;
  try {
    const transporter = buildTransporter();
    const info = await transporter.sendMail({
      from: `Portfolio Inquiry <${process.env.SMTP_USER || process.env.EMAIL_USER || "noreply@deanforantdesigns.com"}>`,
      to: "dean@deanforantdesigns.com",
      subject: "New Inquiry from Website",
      html,
      replyTo: data.email
    });
    console.log("Function email processed:", info.messageId || info);
    return { statusCode: 200, body: JSON.stringify({ success: true, message: "Thank you! Your message was sent successfully." }) };
  } catch (err) {
    console.error("Function email send failed:", err);
    const devExtras = process.env.NODE_ENV === "development" ? { detail: err.message } : {};
    return { statusCode: 500, body: JSON.stringify({ success: false, message: "Server error sending email. Please try again later.", ...devExtras }) };
  }
};
//# sourceMappingURL=contact.js.map
