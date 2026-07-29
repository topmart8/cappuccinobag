import Link from "next/link";
import ImportWizard from "../../../components/ImportWizard";
import { getCrmActor, applyOwnerScope } from "../../../lib/crm/auth";
import { supabaseRequest } from "../../../lib/crm/supabase";

export const dynamic = "force-dynamic";

export default async function ImportsPage() {
  const actor = await getCrmActor();
  let imports = [];
  let error = "";
  try {
    imports = await supabaseRequest(applyOwnerScope("imports?select=*&order=created_at.desc&limit=50", actor));
  } catch (caught) {
    error = caught.message;
  }
  return <main className="crm-content">
    <div className="crm-heading"><div><h1>CSV 导入与导出</h1><p>字段映射、预览、组合去重、错误行和导入历史。</p></div><div className="crm-actions"><Link className="crm-button" href="/api/crm/imports/template" download prefetch={false}>下载 CSV 模板</Link><Link className="crm-button" href="/api/crm/export?entity=leads&format=csv" prefetch={false}>导出企业线索</Link></div></div>
    {error ? <div className="crm-alert">导入历史暂不可用：{error}</div> : null}
    <section className="crm-panel"><ImportWizard /></section>
    <section className="crm-panel" style={{ marginTop: 20 }}>
      <div className="crm-panel-header"><div><h2>导入历史</h2><p>每批次都保留成功、重复与错误计数。</p></div></div>
      {imports.length ? <div className="crm-table-wrap"><table className="crm-table"><thead><tr><th>时间</th><th>文件</th><th>站点</th><th>负责人</th><th>总行数</th><th>已导入</th><th>重复</th><th>错误</th><th>状态</th></tr></thead><tbody>{imports.map((item) => <tr key={item.id}><td>{new Date(item.created_at).toLocaleString("zh-CN")}</td><td>{item.filename}</td><td>{item.site}</td><td>{item.owner || "—"}</td><td>{item.total_rows}</td><td>{item.imported_rows}</td><td>{item.duplicate_rows}</td><td>{item.error_rows}</td><td><span className={`crm-stage ${item.status === "completed" ? "won" : item.status === "failed" ? "lost" : ""}`}>{item.status}</span></td></tr>)}</tbody></table></div> : <div className="crm-empty"><p>还没有导入历史。下载模板并导入第一批真实客户。</p></div>}
    </section>
  </main>;
}
