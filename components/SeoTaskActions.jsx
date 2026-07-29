"use client";

import { useState } from "react";

export default function SeoTaskActions({ id }) {
  const [message, setMessage] = useState("");
  async function update(action) {
    const response = await fetch(`/api/seo/tasks/${encodeURIComponent(id)}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    const result = await response.json();
    setMessage(response.ok ? `Status: ${result.status}` : result.message || "Update failed.");
  }
  return <div>
    <div className="seo-row-actions">
      <button type="button" onClick={() => update("approve")}>Approve draft</button>
      <button type="button" onClick={() => update("revise")}>Return</button>
      <button type="button" onClick={() => update("reject")}>Reject</button>
    </div>
    <small>{message}</small>
  </div>;
}
