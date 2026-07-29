import Link from "next/link";
import { applyOwnerScope, getCrmActor } from "../../../lib/crm/auth";
import { normalizeFilters } from "../../../lib/crm/dashboard";
import { supabaseRequest } from "../../../lib/crm/supabase";

export const dynamic = "force-dynamic";

export default async function InquiriesPage({ searchParams }) {
  const filters = normalizeFilters(await searchParams);
  const actor = await getCrmActor();
  let path = "inquiries?select=*,customers(customer_number)&order=created_at.desc&limit=500";
  if (filters.site !== "all") path += `&site=eq.${filters.site}`;
  if (filters.stage !== "all") path += `&stage=eq.${filters.stage}`;
  const inquiries = await supabaseRequest(applyOwnerScope(path, actor)).catch(() => []);
  return <main className="crm-content">
    <div className="crm-heading"><div><h1>网站询盘</h1><p>RFQ、Contact、项目构建器和 WhatsApp 统一进入此处。</p></div><Link className="crm-button" href="/api/crm/export?format=csv" prefetch={false}>导出询盘</Link></div>
    <section className="crm-panel">
      <form className="crm-filter"><input name="q" placeholder="询盘编号、企业、邮箱" defaultValue={filters.q} /><select name="site" defaultValue={filters.site}><option value="all">全部站点</option><option value="cappuccinobag">Cappuccino</option><option value="novlane">Novlane</option></select><select name="stage" defaultValue={filters.stage}><option value="all">全部阶段</option>{["new","qualified","contacted","replied","quoted","sample","negotiation","won","lost"].map((stage) => <option key={stage}>{stage}</option>)}</select><button className="crm-button primary">筛选</button></form>
      {inquiries.length ? <div className="crm-table-wrap"><table className="crm-table"><thead><tr><th>编号</th><th>站点</th><th>客户 / 企业</th><th>国家</th><th>产品</th><th>数量</th><th>来源</th><th>评分</th><th>阶段</th><th>提交时间</th></tr></thead><tbody>{inquiries.map((item) => <tr key={item.id}><td><Link href={`/crm/inquiries/${item.id}`}>{item.inquiry_number}</Link><small>{item.customers?.customer_number}</small></td><td><span className={`crm-site ${item.site}`}>{item.site}</span></td><td>{item.name || "—"}<small>{item.company || item.email}</small></td><td>{item.country || "—"}</td><td>{item.product || item.product_category || "—"}</td><td>{item.quantity || "—"}</td><td>{item.source || item.source_channel}</td><td><span className="crm-score">{item.lead_score}</span></td><td><span className={`crm-stage ${item.stage}`}>{item.stage}</span></td><td>{new Date(item.created_at).toLocaleString("zh-CN")}</td></tr>)}</tbody></table></div> : <div className="crm-empty"><h3>暂无询盘</h3><p>完成 Supabase 配置后，从两个正式网站提交测试询盘。</p></div>}
    </section>
  </main>;
}
