"use client";

import { useRef, useState } from "react";
import {
  buildPadelInquiryPayload,
  createSubmissionGuard,
  readInquiryAttribution,
} from "../../../lib/inquiry/client-contract.js";
import styles from "./page.module.css";

const initialState = { type: "idle", message: "" };

export default function PadelRfqForm() {
  const [status, setStatus] = useState(initialState);
  const submissionGuard = useRef(null);
  submissionGuard.current ||= createSubmissionGuard();

  async function submitRfq(event) {
    event.preventDefault();
    const submissionId = submissionGuard.current.begin();
    if (!submissionId) return;

    const form = event.currentTarget;
    const fields = Object.fromEntries(new FormData(form).entries());
    const payload = buildPadelInquiryPayload(
      fields,
      readInquiryAttribution(),
      submissionId,
    );
    let succeeded = false;
    form.setAttribute("aria-busy", "true");
    setStatus({ type: "loading", message: "Sending your padel bag brief…" });

    try {
      const response = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.message || "Your RFQ could not be sent.");
      succeeded = true;
      window.cappuccinoAnalytics?.trackLeadSuccess(
        "rfq",
        result.inquiryNumber,
        { product_category: "Padel Bags" },
      );
      form.reset();
      setStatus({
        type: "success",
        message: `Thank you. Your RFQ reference is ${result.inquiryNumber}. We will review the brief before replying.`,
      });
    } catch (error) {
      setStatus({
        type: "error",
        message: `${error.message} You can also email info@cappuccinobag.net or contact us on WhatsApp.`,
      });
    } finally {
      submissionGuard.current.finish({ success: succeeded });
      form.removeAttribute("aria-busy");
    }
  }

  return (
    <form className={styles.rfqForm} data-form="rfq" onSubmit={submitRfq}>
      <div className={styles.rfqFormGrid}>
        <label>
          <span>Name *</span>
          <input name="name" autoComplete="name" required />
        </label>
        <label>
          <span>Work email *</span>
          <input name="email" type="email" autoComplete="email" required />
        </label>
        <label>
          <span>Company / brand</span>
          <input name="company" autoComplete="organization" />
        </label>
        <label>
          <span>WhatsApp</span>
          <input name="phone" type="tel" autoComplete="tel" placeholder="+1 555 000 0000" />
        </label>
        <label>
          <span>Product type *</span>
          <select name="product_type" defaultValue="Premium padel duffel" required>
            <option>Premium padel duffel</option>
            <option>Padel backpack</option>
            <option>Tournament / club bag</option>
            <option>Entry-level launch program</option>
            <option>Custom padel bag design</option>
          </select>
        </label>
        <label>
          <span>Target quantity *</span>
          <select name="quantity" defaultValue="300" required>
            <option value="50">50 pcs</option>
            <option value="100">100 pcs</option>
            <option value="300">300 pcs</option>
            <option value="500">500 pcs</option>
            <option value="1000+">1000+ pcs</option>
          </select>
        </label>
        <label>
          <span>Target price range</span>
          <input name="target_price_range" placeholder="Per-unit target or project budget" />
        </label>
        <label>
          <span>Market *</span>
          <select name="target_market" defaultValue="EU" required>
            <option>EU</option>
            <option>UK</option>
            <option>US</option>
            <option>Australia</option>
            <option>Southeast Asia</option>
            <option>Other</option>
          </select>
        </label>
        <label>
          <span>Material preference</span>
          <input name="material" placeholder="1680D Oxford, recycled polyester…" />
        </label>
        <label>
          <span>Logo method</span>
          <select name="logo_method" defaultValue="Rubber patch">
            <option>Rubber patch</option>
            <option>Woven label</option>
            <option>Heat transfer</option>
            <option>Embroidery</option>
            <option>Logo zipper pull</option>
            <option>Need a recommendation</option>
          </select>
        </label>
        <label>
          <span>Shoe compartment</span>
          <select name="shoe_compartment" defaultValue="Yes">
            <option>Yes</option>
            <option>No</option>
            <option>Need a recommendation</option>
          </select>
        </label>
        <label>
          <span>Racket sleeve quantity</span>
          <select name="racket_sleeve_quantity" defaultValue="2">
            <option value="1">1 sleeve</option>
            <option value="2">2 sleeves</option>
            <option>Need a recommendation</option>
          </select>
        </label>
        <label>
          <span>Sample deadline</span>
          <input name="sample_deadline" type="date" />
        </label>
        <label>
          <span>Bulk delivery deadline</span>
          <input name="bulk_delivery_deadline" type="date" />
        </label>
        <label className={styles.fullField}>
          <span>Reference / design notes</span>
          <textarea name="reference_notes" placeholder="Share the intended use, dimensions, material direction, colours and any reference design details." />
        </label>
      </div>
      <label className={styles.honeypot} aria-hidden="true">
        Website<input name="website" tabIndex="-1" autoComplete="off" />
      </label>
      <button className={styles.formButton} type="submit" disabled={status.type === "loading"}>
        {status.type === "loading" ? "Sending…" : "Send Padel Bag RFQ"}
      </button>
      <p className={`${styles.formStatus} ${styles[status.type] || ""}`} aria-live="polite">{status.message}</p>
    </form>
  );
}
