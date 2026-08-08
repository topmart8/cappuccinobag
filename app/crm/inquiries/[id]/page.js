import Link from "next/link";
import { notFound } from "next/navigation";
import CrmActions from "../../../../components/CrmActions";
import { getCrmActor } from "../../../../lib/crm/auth";
import { supabaseRequest } from "../../../../lib/crm/supabase";

export const dynamic = "force-dynamic";

const fields = [
  ["站点", "brand"], ["来源", "source_channel"], ["姓名", "name"], ["企业", "company"],
  ["邮箱", "email"], ["电话 / WhatsApp", "whatsapp"], ["国家", "country"], ["语言", "language"],
  ["产品", "product"], ["分类", "product_category"], ["数量", "quantity"], ["材料", "material"],
  ["Logo 工艺", "logo_method"], ["目标价", "target_price"], ["目标交期", "target_delivery_date"],
  ["首次落地页", "first_landing_page"], ["提交页", "current_page_url"], ["Referrer", "referrer"],
  ["UTM source", "utm_source"], ["UTM medium", "utm_medium"], ["UTM campaign", "utm_campaign"],
  ["UTM content", "utm_content"], ["UTM term", "utm_term"], ["gclid", "gclid"], ["msclkid", "msclkid"],
  ["当前 Referrer", "current_referrer"], ["当前 UTM source", "current_utm_source"],
  ["当前 UTM medium", "current_utm_medium"], ["当前 UTM campaign", "current_utm_campaign"],
  ["当前 UTM content", "current_utm_content"], ["当前 UTM term", "current_utm_term"],
  ["当前 gclid", "current_gclid"], ["当前 msclkid", "current_msclkid"],
  ["首次访问", "first_visit_time"], ["提交时间", "submit_time"], ["设备", "device"],
  ["归因国家", "attribution_country"], ["评分", "lead_score"], ["风险", "risk_level"], ["阶段", "stage"],
];

export default async function InquiryPage({ params }) {
  const actor = await getCrmActor();
  const { id } = await params;
  const rows = await supabaseRequest(`inquiries?id=eq.${encodeURIComponent(id)}&select=*,customers(customer_number,owner)&limit=1`);
  const inquiry = rows?.[0];
  if (!inquiry || (actor.role !== "admin" && inquiry.customers?.owner && inquiry.customers.owner !== actor.user)) notFound();
  const conversations = await supabaseRequest(`conversations?inquiry_id=eq.${id}&select=*&order=created_at.desc`);
  const ids = conversations.map((item) => item.id);
  const [messages, activities, tasks] = await Promise.all([
    ids.length ? supabaseRequest(`messages?conversation_id=in.(${ids.join(",")})&select=*&order=created_at.asc`) : [],
    supabaseRequest(`activities?inquiry_id=eq.${id}&select=*&order=created_at.desc`).catch(() => []),
    supabaseRequest(`tasks?inquiry_id=eq.${id}&select=*&order=created_at.desc`).catch(() => []),
  ]);
  return <main className="crm-content">
    <div className="crm-heading"><div><Link href="/crm/inquiries">← 返回询盘</Link><h1 style={{ marginTop: 12 }}>{inquiry.inquiry_number}</h1><p>{inquiry.brand} · {inquiry.customers?.customer_number || "客户编号待生成"} · {inquiry.human_takeover ? "需要人工审核" : inquiry.reply_status}</p></div></div>
    <div className="crm-detail-grid">
      <div className="crm-stack">
        <section className="crm-panel"><div className="crm-panel-header"><div><h2>客户摘要</h2><p>{inquiry.ai_recommended_action || "尚未生成建议动作"}</p></div></div><p>{inquiry.ai_customer_summary || "尚未生成摘要。"}</p></section>
        <section className="crm-panel"><div className="crm-panel-header"><h2>询盘与来源追踪</h2></div><div className="crm-kv">{fields.map(([label, key]) => <div key={key}><small>{label}</small><p>{String(inquiry[key] ?? "—")}</p></div>)}</div></section>
        <section className="crm-panel"><div className="crm-panel-header"><h2>询盘原文</h2></div><pre className="crm-message">{inquiry.message || "—"}</pre></section>
        <section className="crm-panel"><div className="crm-panel-header"><h2>WhatsApp / 对话记录</h2></div>{messages.length ? messages.map((message) => <div className="crm-activity" key={message.id}><span className="crm-activity-dot" /><div><p>{message.direction} · {message.body || `[${message.message_type}]`}</p><small>{new Date(message.created_at).toLocaleString("zh-CN")} · {message.status}</small></div></div>) : <div className="crm-empty"><p>暂无对话记录。</p></div>}</section>
      </div>
      <div className="crm-stack">
        <CrmActions inquiry={inquiry} />
        <section className="crm-panel"><div className="crm-panel-header"><h2>活动与任务</h2></div>{[...activities, ...tasks.map((task) => ({ ...task, title: `任务：${task.title}`, body: task.status }))].map((item) => <div className="crm-activity" key={item.id}><span className="crm-activity-dot" /><div><p>{item.title}</p><small>{item.body || ""} · {new Date(item.created_at).toLocaleString("zh-CN")}</small></div></div>)}</section>
      </div>
    </div>
  </main>;
}
