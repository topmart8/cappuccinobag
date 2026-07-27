import Link from "next/link";
import { supabaseRequest } from "../../lib/crm/supabase";

export const dynamic = "force-dynamic";
export const metadata = { title: "Unified CRM", robots: { index: false, follow: false } };

const tabs = [
  ["all", "All"], ["cappuccinobag", "Cappuccino"], ["novlane", "Novlane"],
  ["website", "Website"], ["whatsapp", "WhatsApp"], ["unreplied", "Unreplied"],
  ["high_intent", "High intent"], ["review", "Human review"], ["today", "Follow up today"],
];

function queryFor(filter) {
  const base = "inquiries?select=*&order=created_at.desc&limit=250";
  if (filter === "cappuccinobag" || filter === "novlane") return `${base}&site=eq.${filter}`;
  if (filter === "website" || filter === "whatsapp") return `${base}&source_channel=eq.${filter}`;
  if (filter === "unreplied") return `${base}&reply_status=eq.unreplied`;
  if (filter === "high_intent") return `${base}&lead_score=gte.70`;
  if (filter === "review") return `${base}&human_takeover=eq.true`;
  if (filter === "today") return `${base}&next_follow_up=lte.${encodeURIComponent(new Date().toISOString())}`;
  return base;
}

export default async function CrmPage({ searchParams }) {
  const params = await searchParams;
  const filter = params?.filter || "all";
  let inquiries = [];
  let error = "";
  try {
    inquiries = await supabaseRequest(queryFor(filter));
  } catch (caught) {
    error = caught.message;
  }
  return (
    <main className="crm-shell">
      <header><div><p>UNIFIED SALES CRM</p><h1>Cappuccino Bag + Novlane</h1></div><div className="exports"><Link href="/api/crm/export?format=csv" download>CSV</Link><Link href="/api/crm/export?format=xls" download>Excel</Link></div></header>
      <nav>{tabs.map(([value, label]) => <Link className={filter === value ? "active" : ""} href={`/crm?filter=${value}`} key={value}>{label}</Link>)}</nav>
      {error ? <section className="notice">CRM data unavailable: {error}</section> : null}
      <section className="crm-table"><table><thead><tr><th>Customer #</th><th>Brand</th><th>Name / company</th><th>Country</th><th>Product</th><th>Qty</th><th>Channel</th><th>Score</th><th>Stage</th><th>Next follow-up</th></tr></thead>
        <tbody>{inquiries.map((item) => <tr key={item.id}>
          <td><Link href={`/crm/inquiries/${item.id}`}>{item.inquiry_number}</Link></td>
          <td><span className={`brand ${item.site}`}>{item.brand}</span></td>
          <td>{item.name || "—"}<small>{item.company || ""}</small></td><td>{item.country || "—"}</td>
          <td>{item.product || item.product_category || "—"}</td><td>{item.quantity || "—"}</td>
          <td>{item.source_channel}</td><td>{item.lead_score}</td><td>{item.stage}</td>
          <td>{item.next_follow_up ? new Date(item.next_follow_up).toLocaleString() : "—"}</td>
        </tr>)}</tbody></table></section>
      <style>{`
        *{box-sizing:border-box}.crm-shell{min-height:100vh;background:#f5f3ee;color:#23201d;padding:32px;font:14px/1.45 Arial,sans-serif}
        header{display:flex;justify-content:space-between;align-items:end;gap:24px}header p{letter-spacing:.18em;color:#79583d}h1{margin:4px 0 0;font-size:34px}.exports{display:flex;gap:8px}.exports a,nav a{padding:9px 13px;border:1px solid #d4c7b8;border-radius:999px;color:inherit;text-decoration:none;background:white}
        nav{display:flex;flex-wrap:wrap;gap:8px;margin:28px 0}nav a.active{background:#2d2925;color:white}.notice{padding:18px;background:#fff0d8;border:1px solid #e0b46b}.crm-table{overflow:auto;background:white;border:1px solid #e0d8cf;border-radius:12px}table{width:100%;border-collapse:collapse;min-width:1050px}th,td{text-align:left;padding:14px;border-bottom:1px solid #eee7df;vertical-align:top}th{font-size:11px;letter-spacing:.08em;color:#766c63}td a{color:#744a2c;font-weight:700}td small{display:block;color:#837a72;margin-top:3px}.brand{white-space:nowrap;padding:5px 8px;border-radius:6px;background:#eee}.brand.cappuccinobag{background:#efe0d3}.brand.novlane{background:#e5e1ed}
      `}</style>
    </main>
  );
}
