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

  return <section className="crm-panel crm-reply-editor">
    <div className="crm-panel-header"><div><h2>英文回复草稿</h2><p>发送前必须由业务员人工检查；敏感商业承诺不会自动发送。</p></div></div>
    <textarea value={draft} onChange={(event) => setDraft(event.target.value)} rows={12} />
    <div className="crm-actions" style={{ marginTop: 10 }}>
      <button className="crm-button" onClick={() => act("save_draft", { draft })}>保存编辑</button>
      <button className="crm-button primary" onClick={() => act("approve", { draft })}>人工批准并发送</button>
      <button className="crm-button" onClick={() => act("reject")}>拒绝草稿</button>
      <button className="crm-button" onClick={() => act("regenerate")}>重新生成</button>
      <button className="crm-button danger" onClick={() => act("toggle_takeover", { value: !inquiry.human_takeover })}>{inquiry.human_takeover ? "解除人工接管" : "人工接管"}</button>
    </div>
    {status ? <p role="status">{status}</p> : null}
  </section>;
}
