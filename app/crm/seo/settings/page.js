import { getAutomationEnvironment } from "../../../../automation/lib/environment";

export default function SeoSettingsPage() {
  const environment = getAutomationEnvironment();
  const checks = [
    ["Automation mode", environment.mode],
    ["Safety checks", environment.ok ? "passing" : environment.errors.join(" ")],
    ["OpenAI", environment.hasOpenAi ? "configured" : "optional / not configured"],
    ["Supabase", environment.hasSupabase ? "configured" : "not configured"],
    ["Search Console", environment.hasGsc ? "configured" : "optional / CSV available"],
    ["GitHub token", environment.hasGithub ? "configured" : "not configured"],
  ];
  return <main className="crm-content"><div className="crm-heading"><div><h1>SEO automation settings</h1><p>Read-only environment status. Secret values are never rendered.</p></div></div><section className="crm-panel"><div className="crm-kv">{checks.map(([label, value]) => <div key={label}><small>{label}</small><p>{value}</p></div>)}</div></section></main>;
}
