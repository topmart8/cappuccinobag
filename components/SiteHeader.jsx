import Link from "next/link";
import {
  moreCollectionsNavigation,
  primaryNavigation,
  utilityNavigation,
} from "../lib/site-navigation";

function NavLink({ item }) {
  return <Link href={item.href} prefetch={false}>{item.label}</Link>;
}

function MoreCollections({ mobile = false }) {
  return (
    <details className={mobile ? "nav-more nav-more-mobile" : "nav-more"}>
      <summary>More Collections</summary>
      <div className="nav-more-links">
        {moreCollectionsNavigation.map((item) => <NavLink item={item} key={item.href} />)}
      </div>
    </details>
  );
}

export default function SiteHeader() {
  return (
    <header className="site-header">
      <Link className="brand" href="/" aria-label="Cappuccino Bag home" prefetch={false}>
        <span className="brand-mark" aria-hidden="true" />
        <span>Cappuccino Bag</span>
      </Link>
      <nav className="desktop-nav" aria-label="Main navigation">
        {primaryNavigation.map((item) => <NavLink item={item} key={item.href} />)}
        <MoreCollections />
        {utilityNavigation.map((item) => <NavLink item={item} key={item.href} />)}
      </nav>
      <Link className="header-cta" href="/inquiry" prefetch={false}>Request a Quote</Link>
      <details className="mobile-menu">
        <summary aria-label="Open mobile navigation"><span /><span /></summary>
        <nav aria-label="Mobile navigation">
          {primaryNavigation.map((item) => <NavLink item={item} key={item.href} />)}
          <MoreCollections mobile />
          {utilityNavigation.map((item) => <NavLink item={item} key={item.href} />)}
        </nav>
      </details>
    </header>
  );
}
