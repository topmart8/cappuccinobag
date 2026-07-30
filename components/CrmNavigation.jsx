"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function current(pathname, href) {
  return href === "/crm" ? pathname === href : pathname.startsWith(href);
}

export default function CrmNavigation({ labels, isAdmin, mobile = false }) {
  const pathname = usePathname();
  const primary = [
    ["/crm", labels.dashboard],
    ["/crm/analytics", labels.analytics],
    ["/crm/leads", labels.leads],
    ["/crm/inquiries", labels.inquiries],
    ["/crm/tasks", labels.tasks],
  ];
  const sales = [
    ["/crm/imports", labels.imports],
    ["/crm/drafts?channel=email", labels.email],
    ["/crm/drafts?channel=whatsapp", labels.whatsapp],
  ];
  if (mobile) {
    return <nav className="crm-mobile-nav" aria-label="Mobile CRM">
      {primary.slice(0, 3).map(([href, label]) => <Link key={href} href={href} aria-current={current(pathname, href) ? "page" : undefined}>{label}</Link>)}
      <Link href="/crm/tasks" aria-current={current(pathname, "/crm/tasks") ? "page" : undefined}>{labels.tasks}</Link>
    </nav>;
  }
  return <nav aria-label="CRM">
      {primary.map(([href, label]) => <Link key={href} href={href} aria-current={current(pathname, href) ? "page" : undefined}>{label}</Link>)}
      <p className="crm-side-section">{labels.sales}</p>
      {sales.map(([href, label]) => {
        const base = href.split("?")[0];
        return <Link key={href} href={href} aria-current={current(pathname, base) ? "page" : undefined}>{label}</Link>;
      })}
      {isAdmin ? <Link href="/crm/seo" aria-current={current(pathname, "/crm/seo") ? "page" : undefined}>{labels.seo}</Link> : null}
      {isAdmin ? <Link href="/crm/team" aria-current={current(pathname, "/crm/team") ? "page" : undefined}>{labels.team}</Link> : null}
    </nav>;
}

      {isAdmin ? <Link href="/crm/team" aria-current={current(pathname, "/crm/team") ? "page" : undefined}>{labels.team}</Link> : null}
    </nav>;
}
