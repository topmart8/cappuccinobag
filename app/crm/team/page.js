import { notFound } from "next/navigation";
import { getCrmActor } from "../../../lib/crm/auth";
import { supabaseRequest } from "../../../lib/crm/supabase";

export const dynamic = "force-dynamic";

export default async function TeamPage() {
  const actor = await getCrmActor();
  if (actor.role !== "admin") notFound();
  const profiles = await supabaseRequest("profiles?select=*&order=created_at.asc&limit=100").catch(() => []);
  const loginState = {
    admin: Boolean(process.env.CRM_ADMIN_USER && process.env.CRM_ADMIN_PASSWORD),
    sales: Boolean(process.env.CRM_SALES_USER && process.env.CRM_SALES_PASSWORD),
  };
  return <main className="crm-content"><div className="crm-heading"><div><h1>团队与权限</h1><p>当前登录保护支持 Admin 与 Sales；Supabase profiles 为后续正式邀请制账号预留。</p></div></div>
    <section className="crm-metrics"><div className="crm-metric"><small>Admin 登录</small><strong>{loginState.admin ? "已配置" : "未配置"}</strong><em>可查看与分配全部线索</em></div><div className="crm-metric"><small>Sales 登录</small><strong>{loginState.sales ? "已配置" : "未配置"}</strong><em>只看本人负责线索</em></div><div className="crm-metric"><small>Supabase profiles</small><strong>{profiles.length}</strong><em>不显示任何密码或密钥</em></div></section>
    <section className="crm-panel"><div className="crm-panel-header"><div><h2>成员</h2><p>在 Supabase Auth 邀请用户后，为 profiles.role 设置 admin 或 sales。</p></div></div>
      {profiles.length ? <div className="crm-table-wrap"><table className="crm-table"><thead><tr><th>姓名</th><th>邮箱</th><th>角色</th><th>站点</th><th>状态</th></tr></thead><tbody>{profiles.map((item) => <tr key={item.id}><td>{item.display_name || "—"}</td><td>{item.email}</td><td>{item.role}</td><td>{item.site}</td><td>{item.active ? "启用" : "停用"}</td></tr>)}</tbody></table></div> : <div className="crm-empty"><h3>尚未连接 Supabase Auth 成员</h3><p>当前环境变量账号可安全完成首发。准备邀请多人时，在 Supabase Auth 创建用户并插入 profiles；不要把密码写入仓库。</p></div>}
    </section>
  </main>;
}
