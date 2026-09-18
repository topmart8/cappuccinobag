"use client";

import { useState } from "react";
import styles from "./racket-sports-pages.module.css";

const productOptions = [
  "Padel bag",
  "Padel backpack",
  "Padel racket sleeve / cover",
  "Tennis racket bag",
  "Pickleball bag",
  "Racket sports accessory case",
  "Club/team gear bag",
  "Other racket sports soft goods",
];

export default function RacketSportsRfqForm({ defaultProduct }) {
  const [status, setStatus] = useState({ type: "idle", message: "" });

  async function submitRfq(event) {
    event.preventDefault();
    setStatus({ type: "loading", message: "Sending your project brief…" });
    const form = event.currentTarget;
    const data = new FormData(form);
    data.set("product_category", data.get("product_type"));
    data.set("pageUrl", window.location.href);
    data.set("message", [
      `Product type: ${data.get("product_type") || "Not specified"}`,
      `Target quantity: ${data.get("quantity") || "Not specified"}`,
      `Equipment dimensions: ${data.get("equipment_dimensions") || "Not specified"}`,
      `Material direction: ${data.get("material") || "Not specified"}`,
      `Logo method: ${data.get("logo_method") || "Not specified"}`,
      `Destination market: ${data.get("target_market") || "Not specified"}`,
      `Packaging: ${data.get("packaging") || "Not specified"}`,
      `Required sample timeline: ${data.get("sample_timeline") || "Not specified"}`,
      `Project notes: ${data.get("reference_notes") || "Not specified"}`,
    ].join("\n"));

    try {
      const response = await fetch("/api/inquiries", { method: "POST", body: data });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Your RFQ could not be sent.");
      form.reset();
      setStatus({ type: "success", message: `Thank you. Your RFQ reference is ${result.inquiryNumber}. We will review the specification before replying.` });
    } catch (error) {
      setStatus({ type: "error", message: `${error.message} You can also email info@cappuccinobag.net.` });
    }
  }

  return (
    <form className={styles.rfqForm} onSubmit={submitRfq}>
      <div className={styles.formGrid}>
        <label><span>Name *</span><input name="name" autoComplete="name" required /></label>
        <label><span>Work email *</span><input name="email" type="email" autoComplete="email" required /></label>
        <label><span>Company / brand</span><input name="company" autoComplete="organization" /></label>
        <label><span>WhatsApp</span><input name="phone" type="tel" autoComplete="tel" /></label>
        <label><span>Product type *</span><select name="product_type" defaultValue={defaultProduct} required>{productOptions.map((option) => <option key={option}>{option}</option>)}</select></label>
        <label><span>Target quantity *</span><input name="quantity" placeholder="e.g. 100 pcs" required /></label>
        <label><span>Equipment dimensions</span><input name="equipment_dimensions" placeholder="Racket size or intended load" /></label>
        <label><span>Destination market *</span><input name="target_market" placeholder="UK, EU, US or other market" required /></label>
        <label><span>Material direction</span><input name="material" placeholder="Nylon, polyester, coated fabric…" /></label>
        <label><span>Logo method</span><input name="logo_method" placeholder="Print, embroidery, patch, woven label…" /></label>
        <label className={styles.fullField}><span>Packaging requirements</span><input name="packaging" placeholder="Hangtag, barcode, polybag, retail carton…" /></label>
        <label><span>Required sample timeline</span><input name="sample_timeline" placeholder="Requested date or launch window" /></label>
        <label><span>Reference images</span><input name="attachments" type="file" accept="image/jpeg,image/png,application/pdf" multiple /></label>
        <label className={styles.fullField}><span>Project notes</span><textarea name="reference_notes" placeholder="Share the product use, colours, protection level, compartments and requested timing." /></label>
      </div>
      <label className={styles.honeypot} aria-hidden="true">Website<input name="website" tabIndex="-1" autoComplete="off" /></label>
      <button className={styles.formButton} disabled={status.type === "loading"} type="submit">{status.type === "loading" ? "Sending…" : "Send RFQ"}</button>
      <p className={`${styles.formStatus} ${styles[status.type] || ""}`} aria-live="polite">{status.message}</p>
    </form>
  );
}
