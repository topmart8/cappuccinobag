import Link from "next/link";
import { getCrmActor } from "../../../lib/crm/auth.js";
import { loadDailySalesBrief } from "../../../lib/crm/daily-brief.js";

export const dynamic = "force-dynamic";

function Empty({ children }) {
  return <div className="crm-empty"><p>{children}</p></div>;
}

export default async function DailyBriefPage() {
  const actor = await getCrmActor();
  const brief = await loadDailySalesBrief(actor).catch(() => null);
  if (!brief) return <main className="crm-content">
    <div className="crm-heading"><div><h1>AI 销售每日简报</h1><p>只读数据暂不可用；未生成、保存或发送任何内容。</p></div></div>
    <div className="crm-alert">无法读取当前 CRM 数据。请检查现有 Supabase 配置与访问权限。</div>
  </main>;

  const summary = brief.executive_summary;
  return <main className="crm-content">
    <div className="crm-heading">
      <div><h1>AI 销售每日简报</h1><p>按需生成 · 只读派生 · 所有草稿和动作必须人工审核</p></div>
      <small>生成于 {new Date(brief.generated_at).toLocaleString("zh-CN")}</small>
    </div>
    <section className="crm-metrics" aria-label="Daily brief summary">
      {[
        ["今日重点", summary.actionable_customers, "最多 10 个"],
        ["风险机会", summary.at_risk_deals, "非成交概率"],
        ["逾期跟进", summary.overdue_followups, "canonical tasks"],
        ["资格问题", summary.qualification_issues, "缺口或冲突"],
        ["再激活候选", summary.reactivation_candidates, "非复购判断"],
        ["人工动作", summary.human_actions_today, "最多 5 项"],
      ].map(([label, value, note]) => <div className="crm-metric" key={label}><small>{label}</small><strong>{value}</strong><em>{note}</em></div>)}
    </section>

    <div className="crm-stack">
      <section className="crm-panel">
        <div className="crm-panel-header"><div><h2>今日优先客户</h2><p>Daily Priority 解释“为何今天处理”，不等同于 Lead Score。</p></div></div>
        {brief.priority_customers.length ? <div className="crm-table-wrap"><table className="crm-table"><thead><tr>
          <th>#</th><th>客户 / 项目</th><th>评分 / 层级</th><th>Deal Health</th><th>为何今天</th><th>下一步</th><th>草稿</th>
        </tr></thead><tbody>{brief.priority_customers.map((item) => <tr key={`${item.customer_id}:${item.inquiry_id || "customer"}`}>
          <td><strong>#{item.rank}</strong></td>
          <td><Link href={item.inquiry_id ? `/crm/inquiries/${item.inquiry_id}` : `/crm/leads/${item.customer_id}`}>{item.company !== "UNKNOWN" ? item.company : item.customer_name}</Link><small>{item.product} · {item.market} · {item.stage}</small></td>
          <td><span className="crm-score">{item.lead_score}</span><small>{item.lead_score_source} · Tier {item.customer_tier}</small></td>
          <td><span className={`crm-stage ${item.deal_health.state === "CRITICAL" ? "lost" : ""}`}>{item.deal_health.state}</span><small>{item.risk_flags.join(" · ") || "无已知风险"}</small></td>
          <td>{item.why_today}<small>置信度：{item.confidence}</small></td>
          <td>{item.next_best_action.action}<small>{item.next_question || item.next_best_action.why}</small></td>
          <td>{item.script_mode}<small>{item.recommended_draft ? "可供人工审核" : "无可靠草稿"}</small></td>
        </tr>)}</tbody></table></div> : <Empty>今天没有足够证据支持的可执行客户；系统不会用弱记录凑满数量。</Empty>}
      </section>

      <div className="crm-grid">
        <div className="crm-stack">
          <section className="crm-panel">
            <div className="crm-panel-header"><div><h2>资格缺口与冲突</h2><p>复用 BUILD 02-A1，只推荐一个安全问题，不自动发送。</p></div></div>
            {brief.qualification_attention.length ? brief.qualification_attention.map((item) => <div className="crm-activity" key={`${item.customer_id}:${item.inquiry_id}`}><span className="crm-activity-dot" /><div><p>{item.conflicts.length ? `冲突：${item.conflicts.join("、")}` : `缺口：${item.gaps.join("、")}`}</p><small>{item.next_question || "等待人工复核"}</small></div></div>) : <Empty>当前无已连接来源的资格缺口或冲突。</Empty>}
          </section>
          <section className="crm-panel">
            <div className="crm-panel-header"><div><h2>跟进到期</h2><p>只读 canonical tasks；不会创建或更新任务。</p></div></div>
            {brief.followups_due.length ? brief.followups_due.map((task) => <div className="crm-activity" key={task.task_id}><span className="crm-activity-dot" /><div><p>{task.title || "人工跟进任务"}</p><small>{task.due_at ? new Date(task.due_at).toLocaleString("zh-CN") : "UNKNOWN"} · {task.priority || "normal"}</small></div></div>) : <Empty>没有逾期或今日到期的 canonical task。</Empty>}
          </section>
        </div>
        <aside className="crm-stack">
          <section className="crm-panel">
            <div className="crm-panel-header"><div><h2>今日 Top 5 人工动作</h2><p>无自动执行。</p></div></div>
            {brief.today_top_actions.length ? <ol className="crm-onboarding">{brief.today_top_actions.map((item) => <li key={`${item.rank}:${item.customer_id}`}><strong>{item.action}</strong><span>{item.why}</span></li>)}</ol> : <Empty>暂无足够证据支持的动作。</Empty>}
          </section>
          <section className="crm-panel">
            <div className="crm-panel-header"><div><h2>再激活候选</h2><p>保守候选，不代表复购机会。</p></div></div>
            {brief.reactivation_opportunities.length ? brief.reactivation_opportunities.map((item) => <div className="crm-activity" key={item.customer_id}><span className="crm-activity-dot" /><div><p>{item.customer}</p><small>{item.classification} · {item.last_activity} · {item.confidence}</small></div></div>) : <Empty>没有满足保守门槛的再激活候选。</Empty>}
          </section>
          <section className="crm-panel">
            <div className="crm-panel-header"><div><h2>生命周期信号</h2><p>尚未接入，不推断完整性。</p></div></div>
            <div className="crm-kv">{Object.entries(brief.lifecycle_availability).map(([key, value]) => <div key={key}><small>{key.toUpperCase()}</small><p>{value}</p></div>)}</div>
          </section>
        </aside>
      </div>
    </div>
  </main>;
}
