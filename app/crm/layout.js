import Link from "next/link";
import { cookies } from "next/headers";
import { getCrmActor } from "../../lib/crm/auth";
import CrmNavigation from "../../components/CrmNavigation";
import "./crm.css";

export const metadata = { title: "LeadFlow CRM", robots: { index: false, follow: false } };

const copy = {
  zh: {
    dashboard: "工作台", analytics: "SEO 与流量", leads: "企业线索", inquiries: "询盘", tasks: "任务",
    imports: "导入与导出", email: "邮件草稿", whatsapp: "WhatsApp 草稿",
    team: "团队与权限", seo: "SEO 自动化", sales: "销售工作区", search: "搜索公司、联系人、邮箱…",
  },
  en: {
    dashboard: "Dashboard", analytics: "SEO & Analytics", leads: "Companies", inquiries: "Inquiries", tasks: "Tasks",
    imports: "Import & Export", email: "Email drafts", whatsapp: "WhatsApp drafts",
    team: "Team & roles", seo: "SEO automation", sales: "Sales workspace", search: "Search company, contact or email…",
  },
};

export default async function CrmLayout({ children }) {
  const actor = await getCrmActor();
  const cookieStore = await cookies();
  const locale = cookieStore.get("crm_locale")?.value === "en" ? "en" : "zh";
  const t = copy[locale];
  return <div className="crm-app">
    <aside className="crm-sidebar">
      <Link className="crm-logo" href="/crm"><span className="crm-logo-mark">L</span><span>LeadFlow CRM</span></Link>
      <CrmNavigation labels={t} isAdmin={actor.role === "admin"} />
      <div className="crm-user"><strong>{actor.user}</strong><small>{actor.role === "admin" ? "Admin" : "Sales"}</small></div>
    </aside>
    <div className="crm-main">
      <div className="crm-topbar">
        <form action="/crm" method="get">
          <input className="crm-search" name="q" aria-label={t.search} placeholder={t.search} />
        </form>
        <div className="crm-top-actions">
          <a className="crm-language" href={`/api/crm/locale?lang=${locale === "zh" ? "en" : "zh"}&next=/crm`}>{locale === "zh" ? "EN" : "中文"}</a>
        </div>
      </div>
      {children}
    </div>
    <CrmNavigation labels={t} isAdmin={actor.role === "admin"} mobile />
  </div>;
}
