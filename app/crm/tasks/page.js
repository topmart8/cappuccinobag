import { applyOwnerScope, getCrmActor } from "../../../lib/crm/auth";
import { supabaseRequest } from "../../../lib/crm/supabase";

export const dynamic = "force-dynamic";

export default async function TasksPage() {
  const actor = await getCrmActor();
  const tasks = await supabaseRequest(applyOwnerScope("tasks?select=*,customers(company,name,customer_number)&order=due_at.asc.nullslast&limit=500", actor)).catch(() => []);
  return <main className="crm-content"><div className="crm-heading"><div><h1>跟进任务</h1><p>按负责人、截止时间与优先级管理销售动作。</p></div></div><section className="crm-panel">
    {tasks.length ? <div className="crm-table-wrap"><table className="crm-table"><thead><tr><th>任务</th><th>企业</th><th>站点</th><th>负责人</th><th>优先级</th><th>截止时间</th><th>状态</th></tr></thead><tbody>{tasks.map((item) => <tr key={item.id}><td>{item.title}<small>{item.description}</small></td><td>{item.customers?.company || item.customers?.name || "—"}<small>{item.customers?.customer_number}</small></td><td><span className={`crm-site ${item.site}`}>{item.site}</span></td><td>{item.owner || "待分配"}</td><td>{item.priority}</td><td>{item.due_at ? new Date(item.due_at).toLocaleString("zh-CN") : "—"}</td><td><span className={`crm-stage ${item.status === "done" ? "won" : ""}`}>{item.status}</span></td></tr>)}</tbody></table></div> : <div className="crm-empty"><h3>暂无任务</h3><p>在线索详情页创建首次联系、报价审核或样品跟进任务。</p></div>}
  </section></main>;
}
