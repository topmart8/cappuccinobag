import Link from "next/link";
import { getCrmActor } from "../../lib/crm/auth";
import { loadCrmDashboard, normalizeFilters, summarizeDashboard } from "../../lib/crm/dashboard";

export const dynamic = "force-dynamic";

const stageLabels = {
  new: "新线索", qualified: "已筛选", contacted: "已联系", replied: "已回复",
  quoted: "已报价", sample: "样品中", negotiation: "谈判中", won: "已成交", lost: "已丢失",
};

function tally(rows, key, fallback = "未填写") {
  const counts = new Map();
  for (const row of rows) {
    const value = row[key] || fallback;
    counts.set(value, (counts.get(value) || 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
}

function Distribution({ title, rows }) {
  const maximum = Math.max(1, ...rows.map(([, count]) => count));
  return <section><div className="crm-panel-header"><h2>{title}</h2></div><div className="crm-bars">
    {rows.length ? rows.map(([label, count]) => <div key={label}>
      <div className="crm-bar-label"><span>{label}</span><strong>{count}</strong></div>
      <div className="crm-bar-track"><i style={{ width: `${Math.max(6, count / maximum * 100)}%` }} /></div>
    </div>) : <p className="crm-panel-header">暂无真实数据</p>}
  </div></section>;
}

function LeadTable({ leads }) {
  if (!leads.length) return <div className="crm-empty">
    <h3>还没有真实企业线索</h3>
    <p>先连接 Supabase，或下载 CSV 模板导入客户。生产环境默认不显示假客户；示例数据必须手动开启。</p>
    <div className="crm-actions">
      <Link className="crm-button primary" href="/crm/imports">导入第一批客户</Link>
      <Link className="crm-button" href="/crm?demo=1">查看标记示例</Link>
    </div>
  </div>;
  return <div className="crm-table-wrap"><table className="crm-table"><thead><tr>
    <th>企业 / 联系人</th><th>站点</th><th>国家 / 行业</th><th>产品关键词</th><th>联系方式</th><th>负责人</th><th>评分</th><th>阶段</th><th>下次跟进</th>
  </tr></thead><tbody>{leads.map((lead) => <tr key={lead.id}>
    <td><Link href={lead.is_demo ? "/crm?demo=1" : `/crm/leads/${lead.id}`}>{lead.company || lead.name || "未命名企业"}</Link><small>{lead.customer_number || lead.email || "—"}{lead.is_demo ? " · 演示数据" : ""}</small></td>
    <td><span className={`crm-site ${lead.site}`}>{lead.site === "novlane" ? "Novlane" : "Cappuccino"}</span></td>
    <td>{lead.country || "—"}<small>{lead.industry || "—"}</small></td>
    <td>{(lead.product_keywords || []).slice(0, 3).join(" · ") || "—"}</td>
    <td>{lead.email || lead.whatsapp_phone || lead.phone || "—"}</td><td>{lead.owner || lead.assigned_owner || "待分配"}</td>
    <td><span className="crm-score">{lead.score_override ?? lead.score ?? 0}</span></td>
    <td><span className={`crm-stage ${lead.stage}`}>{stageLabels[lead.stage] || lead.stage}</span></td>
    <td>{lead.next_follow_up ? new Date(lead.next_follow_up).toLocaleDateString("zh-CN") : "—"}</td>
  </tr>)}</tbody></table></div>;
}

export default async function CrmPage({ searchParams }) {
  const filters = normalizeFilters(await searchParams);
  const actor = await getCrmActor();
  const data = await loadCrmDashboard(filters, actor);
  const summary = summarizeDashboard(data);
  const sourceRows = tally(data.leads, "source");
  const countryRows = tally(data.leads, "country");
  const categoryRows = tally(data.inquiries, "product_category");
  return <main className="crm-content">
    <div className="crm-heading">
      <div><h1>多站点获客工作台</h1><p>Cappuccino Bag 与 Novlane 共用数据层，按站点、负责人和角色隔离。</p></div>
      <div className="crm-actions"><Link className="crm-button" href="/api/crm/export?format=csv" prefetch={false}>导出 CSV</Link><Link className="crm-button primary" href="/crm/leads?new=1">新建线索</Link></div>
    </div>
    {filters.demo ? <div className="crm-alert demo">当前显示明确标记的演示数据，不会写入生产客户库。 <Link href="/crm">关闭演示</Link></div> : null}
    {!data.configured && !filters.demo ? <div className="crm-alert">CRM 尚未连接或 migration 未执行：{data.error || "请完成 Supabase 配置。"} 公开网站仍会使用安全失败提示，不会伪造提交成功。</div> : null}
    <section className="crm-metrics" aria-label="CRM metrics">
      {[["总线索", summary.total, "当前筛选"], ["今日新增", summary.today, "按创建时间"], ["待跟进", summary.pending, "已到期"],
        ["已报价", summary.quoted, "需人工审核"], ["样品中", summary.sample, "Sample"], ["已成交", summary.won, "Won"]]
        .map(([label, value, note]) => <div className="crm-metric" key={label}><small>{label}</small><strong>{value}</strong><em>{note}</em></div>)}
    </section>
    <div className="crm-grid">
      <div className="crm-stack">
        <section className="crm-panel">
          <div className="crm-panel-header"><div><h2>销售阶段</h2><p>从新线索到成交的统一漏斗</p></div></div>
          <div className="crm-pipeline">{Object.entries(stageLabels).map(([key, label]) => <div key={key}><span>{label}</span><strong>{summary[key]}</strong></div>)}</div>
        </section>
        <section className="crm-panel">
          <div className="crm-panel-header"><div><h2>企业线索库</h2><p>真实数据与演示数据严格分离</p></div><Link className="crm-button" href="/crm/leads">全部线索</Link></div>
          <LeadTable leads={data.leads.slice(0, 12)} />
        </section>
        <section className="crm-panel crm-distributions">
          <Distribution title="来源分布" rows={sourceRows} /><Distribution title="国家分布" rows={countryRows} /><Distribution title="产品分类" rows={categoryRows} />
        </section>
      </div>
      <aside className="crm-stack">
        <section className="crm-panel">
          <div className="crm-panel-header"><div><h2>开始使用</h2><p>四步完成正式上线</p></div></div>
          <ol className="crm-onboarding">
            <li><strong>连接 Supabase</strong><span>执行两份 migration 并配置 Vercel 环境变量</span></li>
            <li><strong>验证两个网站</strong><span>分别提交 RFQ / Contact 测试询盘</span></li>
            <li><strong>导入客户</strong><span>下载模板、预览映射并确认去重</span></li>
            <li><strong>分配业务员</strong><span>Admin 设置负责人，Sales 只看负责线索</span></li>
          </ol>
        </section>
        <section className="crm-panel">
          <div className="crm-panel-header"><div><h2>最近活动</h2><p>询盘、备注、任务和草稿</p></div></div>
          {data.activities.length ? data.activities.map((item) => <div className="crm-activity" key={item.id}><span className="crm-activity-dot" /><div><p>{item.title}</p><small>{item.body || ""} · {new Date(item.created_at).toLocaleString("zh-CN")}</small></div></div>) : <div className="crm-empty"><p>暂无活动。导入或提交询盘后会在这里出现。</p></div>}
        </section>
      </aside>
    </div>
  </main>;
}
