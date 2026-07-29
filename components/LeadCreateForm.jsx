"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LeadCreateForm() {
  const router = useRouter();
  const [status, setStatus] = useState("");
  async function submit(event) {
    event.preventDefault();
    setStatus("正在保存…");
    const input = Object.fromEntries(new FormData(event.currentTarget));
    const response = await fetch("/api/crm/leads", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) return setStatus(result.message || "保存失败。");
    router.push(`/crm/leads/${result.id}`);
  }
  return <form className="crm-form-grid" onSubmit={submit}>
    <div className="crm-field"><label>站点</label><select name="site"><option value="cappuccinobag">Cappuccino Bag</option><option value="novlane">Novlane</option></select></div>
    <div className="crm-field"><label>阶段</label><select name="stage"><option value="new">new</option><option value="qualified">qualified</option><option value="contacted">contacted</option></select></div>
    <div className="crm-field"><label>公司名 *</label><input name="company" /></div><div className="crm-field"><label>联系人</label><input name="name" /></div>
    <div className="crm-field"><label>国家</label><input name="country" /></div><div className="crm-field"><label>行业</label><input name="industry" /></div>
    <div className="crm-field"><label>公司网站</label><input name="website" type="url" /></div><div className="crm-field"><label>邮箱</label><input name="email" type="email" /></div>
    <div className="crm-field"><label>电话</label><input name="phone" /></div><div className="crm-field"><label>WhatsApp</label><input name="whatsapp" /></div>
    <div className="crm-field full"><label>产品关键词（用分号分隔）</label><input name="product_keywords" placeholder="padel bag; outdoor backpack" /></div>
    <div className="crm-field full"><label>公开来源 URL</label><input name="source_url" type="url" /></div>
    <div className="crm-field full"><label>备注</label><textarea name="notes" /></div>
    <div className="crm-field full"><button className="crm-button primary" type="submit">保存企业线索</button>{status ? <p className="crm-form-status" role="status">{status}</p> : null}</div>
  </form>;
}
