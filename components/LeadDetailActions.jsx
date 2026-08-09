"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LeadDetailActions({ lead, actor }) {
  const router = useRouter();
  const [status, setStatus] = useState("");
  async function act(action, extra = {}) {
    setStatus("处理中…");
    const response = await fetch(`/api/crm/leads/${lead.id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action, ...extra }),
    });
    const result = await response.json().catch(() => ({}));
    setStatus(result.message || (response.ok ? "已完成。" : "操作失败。"));
    if (response.ok) router.refresh();
  }
  function update(event) {
    event.preventDefault();
    act("update", Object.fromEntries(new FormData(event.currentTarget)));
  }
  function note(event) {
    event.preventDefault();
    const form = event.currentTarget;
    act("note", Object.fromEntries(new FormData(form))).then?.(() => form.reset());
  }
  function task(event) {
    event.preventDefault();
    act("task", Object.fromEntries(new FormData(event.currentTarget)));
  }
  return <div className="crm-stack">
    <section className="crm-panel"><div className="crm-panel-header"><h2>销售管理</h2></div>
      <form className="crm-form-grid" onSubmit={update}>
        <div className="crm-field"><label>阶段</label><select name="stage" defaultValue={lead.stage}>{["new","qualified","contacted","replied","quoted","sample","negotiation","won","lost"].map((stage) => <option key={stage}>{stage}</option>)}</select></div>
        <div className="crm-field"><label>人工评分（留空自动）</label><input name="score_override" type="number" min="0" max="100" defaultValue={lead.score_override ?? ""} /></div>
        <div className="crm-field"><label>下次跟进</label><input name="next_follow_up" type="datetime-local" defaultValue={lead.next_follow_up ? new Date(lead.next_follow_up).toISOString().slice(0, 16) : ""} /></div>
        <div className="crm-field"><label>最后联系时间</label><input name="last_contacted_at" type="datetime-local" defaultValue={lead.last_contacted_at ? new Date(lead.last_contacted_at).toISOString().slice(0, 16) : ""} /></div>
        {actor.role === "admin" ? <div className="crm-field"><label>负责人邮箱</label><input name="owner" defaultValue={lead.owner || ""} /></div> : null}
        {actor.role === "admin" ? <>
          <div className="crm-field"><label>客户关系</label><select name="relationship_status" defaultValue={lead.relationship_status || "existing_lead"}>{[
            ["new_lead", "新线索"], ["existing_lead", "已有线索"], ["existing_customer", "现有客户"],
            ["old_customer", "老客户"], ["blocked", "屏蔽 / 禁止联系"], ["supplier_non_buyer", "供应商 / 非买家"],
          ].map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div>
          <div className="crm-field"><label><input name="do_not_prospect" type="checkbox" value="true" defaultChecked={Boolean(lead.do_not_prospect)} /> 禁止客户开发</label></div>
          <div className="crm-field"><label><input name="duplicate_review" type="checkbox" value="true" defaultChecked={Boolean(lead.duplicate_review)} /> 等待重复复核</label></div>
          <div className="crm-field"><label>重复于客户 ID</label><input name="duplicate_of" defaultValue={lead.duplicate_of || ""} placeholder="UUID（留空表示未合并）" /></div>
          <div className="crm-field full"><label>屏蔽原因</label><textarea name="blocked_reason" maxLength="1000" defaultValue={lead.blocked_reason || ""} /></div>
        </> : null}
        <div className="crm-field full"><button className="crm-button primary">保存</button></div>
      </form>
    </section>
    <section className="crm-panel"><div className="crm-panel-header"><h2>添加备注</h2></div><form onSubmit={note}><div className="crm-field"><textarea name="body" required placeholder="记录电话、邮件或客户要求…" /></div><button className="crm-button" style={{ marginTop: 10 }}>保存备注</button></form></section>
    <section className="crm-panel"><div className="crm-panel-header"><h2>创建任务</h2></div><form className="crm-form-grid" onSubmit={task}><div className="crm-field full"><input name="title" required placeholder="例如：确认打样数量" /></div><div className="crm-field"><input name="due_at" type="datetime-local" /></div><div className="crm-field"><select name="priority"><option value="normal">普通</option><option value="high">高</option></select></div><div className="crm-field full"><button className="crm-button">创建任务</button></div></form></section>
    <section className="crm-panel"><div className="crm-panel-header"><div><h2>英文跟进草稿</h2><p>报价、付款、银行信息、投诉、赔偿与最终交期始终人工审核。</p></div></div><div className="crm-actions"><button className="crm-button" onClick={() => act("draft_email")}>生成邮件草稿</button><button className="crm-button" onClick={() => act("draft_whatsapp")}>生成 WhatsApp 草稿</button></div></section>
    {status ? <p className="crm-form-status" role="status">{status}</p> : null}
  </div>;
}
