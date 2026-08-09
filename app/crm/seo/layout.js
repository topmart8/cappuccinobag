import Link from "next/link";

const tabs = [
  ["Overview", "/crm/seo"],
  ["Keywords", "/crm/seo/keywords"],
  ["Content", "/crm/seo/content"],
  ["Internal links", "/crm/seo/internal-links"],
  ["Image jobs", "/crm/seo/image-jobs"],
  ["Publishing", "/crm/seo/publishing"],
  ["Analytics", "/crm/seo/analytics"],
  ["Settings", "/crm/seo/settings"],
];

export const metadata = { title: "SEO Automation | LeadFlow CRM", robots: { index: false, follow: false } };

export default function SeoLayout({ children }) {
  return <>
    <nav className="seo-tabs" aria-label="SEO automation">
      {tabs.map(([label, href]) => <Link key={href} href={href}>{label}</Link>)}
    </nav>
    {children}
  </>;
}
