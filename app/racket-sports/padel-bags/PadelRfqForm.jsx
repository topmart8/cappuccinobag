"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./page.module.css";

const initialState = { type: "idle", message: "" };

export default function PadelRfqForm() {
  const [status, setStatus] = useState(initialState);

  const formRef = useRef(null);
  const [summary, setSummary] = useState("");
  const [assessment, setAssessment] = useState("bulk");

  function summarize(form) {
    const data = new FormData(form);
    return [
      ["Reference", "reference_sku"], ["Brief", "assessment"], ["Pieces per style", "quantity"],
      ["Intended use", "use_case"], ["Requested function", "desired_function"],
      ["Requested material", "material_preference"], ["Requested logo", "logo_method"],
      ["Destination", "target_market"], ["Requested shoe compartment", "shoe_compartment"],
      ["Requested racket sleeves", "racket_sleeve_quantity"],
    ].filter(([, key]) => data.get(key)).map(([label, key]) => label + ": " + data.get(key)).join(" · ");
  }

  useEffect(() => {
    const form = formRef.current;
    const sku = new URLSearchParams(window.location.search).get("sku");
    if (["PDB014", "PDB016", "PDB017", "S005"].includes(sku)) form.elements.reference_sku.value = sku;
    setSummary(summarize(form));
  }, []);

  async function submitRfq(event) {
    event.preventDefault();
    setStatus({ type: "loading", message: "Sending your padel bag brief…" });

    const form = event.currentTarget;
    const data = new FormData(form);
    data.set("product_category", data.get("product_type"));
    data.set("pageUrl", window.location.href);
    data.set("message", [
      summarize(form),
      `Reference / design notes: ${data.get("reference_notes") || "Not specified"}`,
      `Target price range: ${data.get("target_price_range") || "Not specified"}`,
      `Shoe compartment: ${data.get("shoe_compartment") || "Not specified"}`,
      `Racket sleeves: ${data.get("racket_sleeve_quantity") || "Not specified"}`,
      `Sample deadline: ${data.get("sample_deadline") || "Not specified"}`,
      `Bulk delivery deadline: ${data.get("bulk_delivery_deadline") || "Not specified"}`,
    ].join("\n"));

    try {
      const response = await fetch("/api/inquiries", { method: "POST", body: data });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Your RFQ could not be sent.");
      if (result.ok !== true || result.saved === false || !result.inquiryNumber || !result.submissionId) {
        throw new Error("The receipt could not be confirmed. Your brief remains available for review.");
      }
      form.reset();
      setAssessment("bulk");
      setSummary("");
      setStatus({
        type: "success",
        message: `Thank you. Your RFQ reference is ${result.inquiryNumber}. We will review the brief before replying.`,
      });
    } catch (error) {
      setStatus({
        type: "error",
        message: `${error.message} You can also email info@cappuccinobag.net or contact us on WhatsApp.`,
      });
    }
  }

  return (
    <form className={styles.rfqForm} ref={formRef} onChange={(event) => setSummary(summarize(event.currentTarget))} onSubmit={submitRfq}>
      <div className={styles.rfqFormGrid}>
        <label><span>Model reference</span><select name="reference_sku" defaultValue=""><option value="">Choose a reference if known</option>{["PDB014", "PDB016", "PDB017", "S005"].map((sku) => <option key={sku}>{sku}</option>)}</select></label>
        <label><span>Assessment</span><select name="assessment" value={assessment} onChange={(event) => {
          const next = event.target.value;
          setAssessment(next);
          formRef.current.elements.quantity.value = next === "sample" ? "1" : "300";
        }}><option value="bulk">Custom production</option><option value="sample">Development sample · assessed separately</option></select></label>
        <label><span>Intended use</span><input name="use_case" placeholder="Club travel or court training" /></label>
        <label><span>Requested material or finish</span><input name="material_preference" placeholder="Textile or swatch to assess" /></label>
        <label><span>Function to develop</span><input name="desired_function" placeholder="Describe the layout to review on a sample" /></label>
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
          <select name="product_type" defaultValue="Custom padel bag design" required>
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
            <option value="1" hidden={assessment !== "sample"} disabled={assessment !== "sample"}>1 development sample</option>
            {["300","500","1000"].map((tier) => <option key={tier} hidden={assessment === "sample"} disabled={assessment === "sample"} value={tier}>{tier} pieces per style</option>)}
          </select>
        </label>
        <label>
          <span>Target price range</span>
          <input name="target_price_range" placeholder="Per-unit target or project budget" />
        </label>
        <label>
          <span>Market *</span>
          <select name="target_market" defaultValue="" required><option value="">Please specify</option>
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
          <select name="logo_method" defaultValue=""><option value="">Please specify</option>
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
          <select name="shoe_compartment" defaultValue=""><option value="">Please specify</option>
            <option>Yes</option>
            <option>No</option>
            <option>Need a recommendation</option>
          </select>
        </label>
        <label>
          <span>Racket sleeve quantity</span>
          <select name="racket_sleeve_quantity" defaultValue=""><option value="">Please specify</option>
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
      <p aria-live="polite"><strong>Your requested brief</strong><br />{summary}</p>
      <button className={styles.formButton} type="submit" disabled={status.type === "loading"}>
        {status.type === "loading" ? "Sending…" : "Send Padel Bag RFQ"}
      </button>
      <p className={`${styles.formStatus} ${styles[status.type] || ""}`} aria-live="polite">{status.message}</p>
    </form>
  );
}
