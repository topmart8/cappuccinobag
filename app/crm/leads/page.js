import Link from "next/link";
import LeadCreateForm from "../../../components/LeadCreateForm";
import { getCrmActor } from "../../../lib/crm/auth";
import { loadCrmDashboard, normalizeFilters } from "../../../lib/crm/dashboard";

export const dynamic = "force-dynamic";

export default async function LeadsPage({ searchParams }) {
  const params = await searchParams;
  const filters = normalizeFilters(params);
  const actor = await getCrmActor();
  const data = await loadCrmDashboard(filters, actor);
  if (params?.new === "1") return <main className="crm-content"><div className="crm-heading"><div><h1>新建企业线索</h1><p>仅录入合法 API、手工整理、网站询盘或公开来源资料。</p></div><Link className="crm-button" href="/crm/leads">返回线索库</Link></div><section className="crm-panel"><LeadCreateForm /></section></main>;
  return <main className="crm-content">
    <div className="crm-heading"><div><h1>企业线索库</h1><p>搜索、筛选与分配两个网站的企业客户。</p></div><div className="crm-actions"><Link className="crm-button" href="/crm/imports">导入 CSV</Link><Link className="crm-button primary" href="/crm/leads?new=1">新建线索</Link></div></div>
    <section className="crm-panel">
      <form className="crm-filter">
        <input name="q" defaultValue={filters.q} placeholder="公司、联系人、邮箱、网站" />
        <select name="site" defaultValue={filters.site}><option value="all">全部站点</option><option value="cappuccinobag">Cappuccino</option><option value="novlane">Novlane</option></select>
        <select name="stage" defaultValue={filters.stage}><option value="all">全部阶段</option>{["new","qualified","contacted","replied","quoted","sample","negotiation","won","lost"].map((item) => <option key={item}>{item}</option>)}</select>
        <input name="country" defaultValue={filters.country} placeholder="国家" /><input name="industry" defaultValue={filters.industry} placeholder="行业" /><input name="product" defaultValue={filters.product} placeholder="产品关键词" />
        <select name="contact" defaultValue={filters.contact}><option value="">全部联系方式</option><option value="email">有邮箱</option><option value="phone">有电话</option><option value="whatsapp">有 WhatsApp</option></select>
        <button className="crm-button primary">筛选</button>
      </form>
      {data.leads.length ? <div className="crm-table-wrap"><table className="crm-table"><thead><tr><th>企业</th><th>站点</th><th>国家 / 行业</th><th>产品关键词</th><th>邮箱 / WhatsApp</th><th>负责人</th><th>评分</th><th>阶段</th></tr></thead><tbody>
        {data.leads.map((lead) => <tr key={lead.id}><td><Link href={`/crm/leads/${lead.id}`}>{lead.company || lead.name || "未命名"}</Link><small>{lead.customer_number || "—"}</small></td><td><span className={`crm-site ${lead.site}`}>{lead.site}</span></td><td>{lead.country || "—"}<small>{lead.industry || "—"}</small></td><td>{(lead.product_keywords || []).join(" · ") || "—"}</td><td>{lead.email || "—"}<small>{lead.whatsapp_phone || "—"}</small></td><td>{lead.owner || "待分配"}</td><td><span className="crm-score">{lead.score_override ?? lead.score ?? 0}</span></td><td><span className={`crm-stage ${lead.stage}`}>{lead.stage}</span></td></tr>)}
      </tbody></table></div> : <div className="crm-empty"><h3>没有匹配线索</h3><p>调整筛选条件，或导入第一批真实企业资料。</p><div className="crm-actions"><Link className="crm-button primary" href="/crm/imports">导入 CSV</Link></div></div>}
    </section>
  </main>;
}
