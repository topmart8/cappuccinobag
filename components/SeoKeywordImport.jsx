"use client";

import { useState } from "react";

export default function SeoKeywordImport() {
  const [value, setValue] = useState("");
  const [message, setMessage] = useState("");
  async function submit(event) {
    event.preventDefault();
    setMessage("Importing…");
    const keywords = value.split(/\r?\n/).map((item) => item.trim()).filter(Boolean);
    const response = await fetch("/api/seo/keywords", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ keywords, source: "manual_paste" }),
    });
    const result = await response.json();
    setMessage(response.ok
      ? `${result.imported} keyword(s) analyzed. Status remains manual_review.`
      : result.message || "Import failed.");
    if (response.ok) setValue("");
  }
  return <form className="seo-import" onSubmit={submit}>
    <label className="crm-field">
      <span>Paste one keyword per line</span>
      <textarea value={value} onChange={(event) => setValue(event.target.value)} placeholder={"custom padel bag manufacturer\nprivate label pickleball bag"} required />
    </label>
    <div className="crm-actions">
      <button className="crm-button primary" type="submit">Analyze draft keywords</button>
      <label className="crm-button">
        CSV upload
        <input type="file" accept=".csv,text/csv" hidden onChange={async (event) => {
          const file = event.target.files?.[0];
          if (!file) return;
          setMessage("Importing CSV…");
          const response = await fetch("/api/seo/keywords", {
            method: "POST", headers: { "Content-Type": "text/csv" }, body: await file.text(),
          });
          const result = await response.json();
          setMessage(response.ok ? `${result.imported} row(s) analyzed.` : result.message || "Import failed.");
        }} />
      </label>
    </div>
    <p className="crm-form-status" role="status">{message}</p>
  </form>;
}
