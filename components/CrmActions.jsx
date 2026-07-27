"use client";

import { useState } from "react";

export default function CrmActions({ inquiry }) {
  const [draft, setDraft] = useState(inquiry.ai_reply_draft || "");
  const [status, setStatus] = useState("");

  async function act(action, extra = {}) {
    setStatus("Working…");
    const response = await fetch(`/api/crm/inquiries/${inquiry.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, ...extra }),
    });
    const result = await response.json().catch(() => ({}));
    setStatus(response.ok ? result.message || "Saved." : result.message || "Action failed.");
    if (result.draft) setDraft(result.draft);
  }

  return <section className="crm-actions">
    <h2>AI reply draft</h2>
    <textarea value={draft} onChange={(event) => setDraft(event.target.value)} rows={12} />
    <div>
      <button onClick={() => act("save_draft", { draft })}>Save edit</button>
      <button onClick={() => act("approve", { draft })} className="primary">Approve & send</button>
      <button onClick={() => act("reject")}>Reject</button>
      <button onClick={() => act("regenerate")}>Regenerate</button>
      <button onClick={() => act("toggle_takeover", { value: !inquiry.human_takeover })}>{inquiry.human_takeover ? "Release takeover" : "Human takeover"}</button>
    </div>
    {status ? <p role="status">{status}</p> : null}
  </section>;
}

