import { useState } from "react";

const initialForm = {
  name: "",
  email: "",
  phone: "",
  company: "",
  country: "",
  productRequirement: "",
  message: "",
  website: ""
};

export default function B2BInquiryForm({ endpoint = "/api/inquiry" }) {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState({ type: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: "" }));
  }

  function validate() {
    const nextErrors = {};
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phonePattern = /^\+?[0-9\s().-]{7,20}$/;

    if (!form.name.trim()) nextErrors.name = "Please enter your name.";
    if (!emailPattern.test(form.email)) nextErrors.email = "Please enter a valid email address.";
    if (!phonePattern.test(form.phone)) nextErrors.phone = "Please enter a valid international phone number.";

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (form.website) {
      setStatus({ type: "error", message: "Submission blocked. Please try again later." });
      return;
    }
    if (!validate()) {
      setStatus({ type: "error", message: "Please complete all required fields with valid contact information." });
      return;
    }

    setIsSubmitting(true);
    setStatus({ type: "", message: "Sending your inquiry..." });

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          company: form.company,
          country: form.country,
          productRequirement: form.productRequirement,
          message: form.message
        })
      });

      if (!response.ok) throw new Error("Inquiry endpoint failed.");

      setStatus({ type: "success", message: "Submitted successfully. Our sales team will contact you soon." });
      setForm(initialForm);
    } catch (error) {
      setStatus({ type: "error", message: "Submission failed. Please try again or contact us on WhatsApp." });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="inquiry-form" onSubmit={handleSubmit} noValidate>
      <div className="form-head">
        <p className="eyebrow">Request Free Quote</p>
        <h2>B2B Inquiry Form</h2>
        <p>Fields marked with <strong>*</strong> are required.</p>
      </div>

      <div className="form-grid">
        <Field label="Full Name" name="name" value={form.name} onChange={updateField} required error={errors.name} placeholder="Your full name" />
        <Field label="Email" name="email" type="email" value={form.email} onChange={updateField} required error={errors.email} placeholder="you@company.com" />
        <Field label="Phone / WhatsApp" name="phone" type="tel" value={form.phone} onChange={updateField} required error={errors.phone} placeholder="+1 555 000 0000" />
        <Field label="Company Name" name="company" value={form.company} onChange={updateField} placeholder="Your company or brand name" />
        <Field label="Country / Region" name="country" value={form.country} onChange={updateField} placeholder="United States, UAE, Saudi Arabia..." />
        <Field label="Product Requirement" name="productRequirement" value={form.productRequirement} onChange={updateField} placeholder="Women’s bags, outdoor bags, travel gear..." />
      </div>

      <Field label="Message" name="message" value={form.message} onChange={updateField} textarea placeholder="Tell us quantity, material, logo method, target price, delivery market and timeline." />

      <label className="hp-field" aria-hidden="true">
        Website
        <input name="website" value={form.website} onChange={updateField} tabIndex="-1" autoComplete="off" />
      </label>

      <div className="form-actions">
        <button type="submit" className="btn btn-primary inquiry-submit" disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : "Submit Inquiry"}
        </button>
      </div>

      <p className={`form-status ${status.type ? `is-${status.type}` : ""}`} role="status" aria-live="polite">
        {status.message}
      </p>
    </form>
  );
}

function Field({ label, name, value, onChange, type = "text", required = false, error, placeholder, textarea = false }) {
  const Control = textarea ? "textarea" : "input";
  return (
    <label className={error ? "is-invalid" : ""}>
      <span>{label} {required && <strong>*</strong>}</span>
      <Control
        name={name}
        type={textarea ? undefined : type}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
      />
      <small className="field-error">{error}</small>
    </label>
  );
}
