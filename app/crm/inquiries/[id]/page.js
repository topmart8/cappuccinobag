import Link from "next/link";
import { notFound } from "next/navigation";
import CrmActions from "../../../../components/CrmActions";
import { supabaseRequest } from "../../../../lib/crm/supabase";

export const dynamic = "force-dynamic";
export const metadata = { title: "Inquiry detail | Unified CRM", robots: { index: false, follow: false } };

const fields = [
  ["Brand", "brand"], ["Channel", "source_channel"], ["Name", "name"], ["Company", "company"],
  ["Email", "email"], ["Phone / WhatsApp", "whatsapp"], ["Country", "country"], ["Language", "language"],
  ["Product", "product"], ["Category", "product_category"], ["Quantity", "quantity"], ["Material", "material"],
  ["Logo method", "logo_method"], ["Target price", "target_price"], ["Target delivery", "target_delivery_date"],
  ["First landing page", "first_landing_page"], ["Submit page", "current_page_url"], ["Referrer", "referrer"],
  ["UTM source", "utm_source"], ["UTM medium", "utm_medium"], ["UTM campaign", "utm_campaign"],
  ["UTM content", "utm_content"], ["UTM term", "utm_term"], ["gclid", "gclid"], ["msclkid", "msclkid"],
  ["Device", "device"], ["Lead score", "lead_score"], ["Risk", "risk_level"], ["Stage", "stage"],
];

export default async function InquiryPage({ params }) {
  const { id } = await params;
  const rows = await supabaseRequest(`inquiries?id=eq.${encodeURIComponent(id)}&select=*,customers(customer_number)&limit=1`);
  const inquiry = rows?.[0];
  if (!inquiry) notFound();
  const conversations = await supabaseRequest(`conversations?inquiry_id=eq.${id}&select=*&order=created_at.desc`);
  const conversationIds = conversations.map((item) => item.id);
  const messages = conversationIds.length
    ? await supabaseRequest(`messages?conversation_id=in.(${conversationIds.join(",")})&select=*&order=created_at.asc`)
    : [];
  return <main className="detail">
    <Link href="/crm">← Back to CRM</Link>
    <header><p>{inquiry.brand} · {inquiry.customers?.customer_number || "Customer number pending"}</p><h1>{inquiry.inquiry_number}</h1><span>{inquiry.human_takeover ? "Human review required" : inquiry.reply_status}</span></header>
    <section className="summary"><h2>AI customer summary</h2><p>{inquiry.ai_customer_summary || "Not generated."}</p><strong>{inquiry.ai_recommended_action}</strong></section>
    <section className="grid">{fields.map(([label, key]) => <div key={key}><small>{label}</small><p>{String(inquiry[key] ?? "—")}</p></div>)}</section>
    <section><h2>Inquiry message</h2><pre>{inquiry.message || "—"}</pre></section>
    <section><h2>WhatsApp / conversation history</h2>{messages.length ? messages.map((message) => <article key={message.id}><strong>{message.direction}</strong><small>{new Date(message.created_at).toLocaleString()} · {message.status}</small><p>{message.body || `[${message.message_type}]`}</p></article>) : <p>No messages.</p>}</section>
    <CrmActions inquiry={inquiry} />
    <style>{`
      *{box-sizing:border-box}.detail{max-width:1080px;margin:auto;padding:36px;color:#25211e;font:15px/1.55 Arial,sans-serif}.detail>a{color:#72472b}header{display:flex;align-items:end;gap:16px;margin:28px 0}header p{margin:0;color:#76543e}header h1{margin:0;font-size:34px}header span{margin-left:auto;padding:8px 12px;background:#f0e4d7;border-radius:8px}.summary,section{margin:18px 0;padding:22px;border:1px solid #ded7cf;border-radius:12px;background:#fff}.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:0}.grid div{padding:10px;border-bottom:1px solid #eee}.grid small,article small{display:block;color:#786f68}.grid p{overflow-wrap:anywhere}pre{white-space:pre-wrap;font:inherit}.crm-actions textarea{width:100%;padding:12px}.crm-actions div{display:flex;flex-wrap:wrap;gap:8px;margin-top:10px}.crm-actions button{padding:10px 13px;border:1px solid #cfc5bb;background:#fff;border-radius:7px}.crm-actions .primary{background:#2b2724;color:white}@media(max-width:760px){.grid{grid-template-columns:1fr}header{align-items:start;flex-direction:column}header span{margin:0}}
    `}</style>
  </main>;
}
