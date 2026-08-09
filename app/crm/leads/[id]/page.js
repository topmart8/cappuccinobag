import Link from "next/link";
import { notFound } from "next/navigation";
import LeadDetailActions from "../../../../components/LeadDetailActions";
import { getCrmActor } from "../../../../lib/crm/auth";
import { supabaseRequest } from "../../../../lib/crm/supabase";

export const dynamic = "force-dynamic";

const fields = [
  ["公司", "company"], ["联系人", "name"], ["国家", "country"], ["行业", "industry"],
  ["网站", "website"], ["邮箱", "email"], ["电话", "phone"], ["WhatsApp", "whatsapp_phone"],
  ["Facebook", "facebook_url"], ["Instagram", "instagram_url"], ["LinkedIn", "linkedin_url"],
  ["来源", "source"], ["来源 URL", "source_url"], ["负责人", "owner"], ["阶段", "stage"],
  ["自动评分", "score"], ["人工评分", "score_override"], ["下次跟进", "next_follow_up"],
  ["老客户", "is_existing_customer"], ["禁止客户开发", "do_not_prospect"],
  ["屏蔽原因", "blocked_reason"], ["等待重复复核", "duplicate_review"],
  ["重复于客户", "duplicate_of"], ["最后联系", "last_contacted_at"],
];

export default async function LeadDetailPage({ params }) {
  const actor = await getCrmActor();
  const { id } = await params;
  const rows = await supabaseRequest(`customers?id=eq.${encodeURIComponent(id)}&select=*&limit=1`);
  const lead = rows[0];
  if (!lead || (actor.role !== "admin" && lead.owner && lead.owner !== actor.user)) notFound();
  const [activities, tasks, emails, whatsapps, inquiries] = await Promise.all([
    supabaseRequest(`activities?customer_id=eq.${id}&select=*&order=created_at.desc&limit=100`),
    supabaseRequest(`tasks?customer_id=eq.${id}&select=*&order=created_at.desc&limit=100`),
    supabaseRequest(`email_drafts?customer_id=eq.${id}&select=*&order=created_at.desc&limit=50`),
    supabaseRequest(`whatsapp_drafts?customer_id=eq.${id}&select=*&order=created_at.desc&limit=50`),
    supabaseRequest(`inquiries?customer_id=eq.${id}&select=*&order=created_at.desc&limit=50`),
  ]);
  return <main className="crm-content">
    <div className="crm-heading"><div><Link href="/crm/leads">← 返回企业线索</Link><h1 style={{ marginTop: 12 }}>{lead.company || lead.name || "未命名企业"}</h1><p>{lead.customer_number} · {lead.site === "novlane" ? "Novlane" : "Cappuccino Bag"} · {lead.stage}</p></div></div>
    <div className="crm-detail-grid">
      <div className="crm-stack">
        <section className="crm-panel"><div className="crm-panel-header"><h2>企业资料</h2></div><div className="crm-kv">{fields.map(([label, key]) => <div key={key}><small>{label}</small><p>{String(lead[key] ?? "—")}</p></div>)}</div></section>
        <section className="crm-panel"><div className="crm-panel-header"><div><h2>产品与备注</h2><p>{(lead.product_keywords || []).join(" · ") || "未填写产品关键词"}</p></div></div><p className="crm-message">{lead.notes || "暂无备注。"}</p></section>
        <section className="crm-panel"><div className="crm-panel-header"><h2>时间线</h2></div>
          {[...activities, ...inquiries.map((item) => ({ id: `inq-${item.id}`, title: `网站询盘 ${item.inquiry_number}`, body: item.message, created_at: item.created_at }))]
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
            .map((item) => <div className="crm-activity" key={item.id}><span className="crm-activity-dot" /><div><p>{item.title}</p><small>{item.body || ""} · {new Date(item.created_at).toLocaleString("zh-CN")}</small></div></div>)}
          {!activities.length && !inquiries.length ? <div className="crm-empty"><p>还没有活动记录。</p></div> : null}
        </section>
        <section className="crm-panel"><div className="crm-panel-header"><h2>任务与草稿</h2></div>
          {[...tasks.map((item) => ({ ...item, type: "任务" })), ...emails.map((item) => ({ ...item, type: "邮件草稿", title: item.subject })), ...whatsapps.map((item) => ({ ...item, type: "WhatsApp 草稿", title: item.body.slice(0, 80) }))]
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
            .map((item) => <div className="crm-activity" key={`${item.type}-${item.id}`}><span className="crm-activity-dot" /><div><p>{item.type} · {item.title}</p><small>{item.status} · {new Date(item.created_at).toLocaleString("zh-CN")}</small></div></div>)}
        </section>
      </div>
      <LeadDetailActions lead={lead} actor={actor} />
    </div>
  </main>;
}
