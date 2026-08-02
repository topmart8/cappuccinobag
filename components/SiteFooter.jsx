import Link from "next/link";
import { footerNavigation } from "../lib/site-navigation";

export default function SiteFooter() {
  return (
    <footer className="site-footer site-footer-unified">
      <div className="footer-brand">
        <strong>Cappuccino Bag</strong>
        <p>Custom padel, racket sports, outdoor and functional bag manufacturing for global brands.</p>
        <p className="footer-legal">Guangzhou Cappuccino Leather Handbag Co., Ltd.</p>
        <a href="mailto:info@cappuccinobag.net">info@cappuccinobag.net</a>
      </div>
      <div className="footer-groups">
        {footerNavigation.map((group) => (
          <section key={group.title}>
            <h2>{group.title}</h2>
            <nav aria-label={`${group.title} footer navigation`}>
              {group.links.map((item) => <Link href={item.href} key={item.href} prefetch={false}>{item.label}</Link>)}
            </nav>
          </section>
        ))}
      </div>
    </footer>
  );
}
