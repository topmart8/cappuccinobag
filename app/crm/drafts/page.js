import { applyOwnerScope, getCrmActor } from "../../../lib/crm/auth";
import { supabaseRequest } from "../../../lib/crm/supabase";

export const dynamic = "force-dynamic";

export default async function DraftsPage({ searchParams }) {
  const channel = (await searchParams)?.channel === "whatsapp" ? "whatsapp" : "email";
  const actor = await getCrmActor();
  const table = channel === "whatsapp" ? "whatsapp_drafts" : "email_drafts";
  const drafts = await supabaseRequest(applyOwnerScope(`${table}?select=*,customers(company,name,customer_number)&order=created_at.desc&limit=500`, actor)).catch(() => []);
  return <main className="crm-content"><div className="crm-heading"><div><h1>{channel === "whatsapp" ? "WhatsApp 草稿" : "邮件草稿"}</h1><p>{channel === "whatsapp" ? "第一阶段固定 draft_only，不自动发送。" : "报价、付款、银行信息、投诉、赔偿与最终交期必须人工审核。"}</p></div></div><section className="crm-panel">
    {drafts.length ? <div className="crm-table-wrap"><table className="crm-table"><thead><tr><th>企业</th><th>收件人</th>{channel === "email" ? <th>主题</th> : <th>产品 / 来源页面</th>}<th>草稿</th><th>负责人</th><th>状态</th><th>生成时间</th></tr></thead><tbody>{drafts.map((item) => <tr key={item.id}><td>{item.customers?.company || item.customers?.name || "—"}<small>{item.customers?.customer_number}</small></td><td>{item.recipient || "—"}</td><td>{channel === "email" ? item.subject : item.product_category}<small>{channel === "whatsapp" ? item.source_page : ""}</small></td><td>{item.body.slice(0, 180)}{item.body.length > 180 ? "…" : ""}</td><td>{item.owner || "—"}</td><td><span className="crm-stage">{item.status}</span></td><td>{new Date(item.created_at).toLocaleString("zh-CN")}</td></tr>)}</tbody></table></div> : <div className="crm-empty"><h3>暂无草稿</h3><p>在线索详情页一键生成与品牌产品知识匹配的英文跟进草稿。</p></div>}
  </section></main>;
}
