import Link from "next/link";
import { getPadelArticleNavigation } from "./padel-buyer-reading";

export function PadelArticleNavigation({ slug, existingHrefs = [] }) {
  const navigation = getPadelArticleNavigation(slug);
  if (!navigation) return null;
  const [href, label] = navigation.topic;
  const resources = navigation.resources.filter(([path]) => !existingHrefs.includes(path));
  return (
    <nav aria-label="Padel article topic and related reading" className="padel-article-reading">
      <h2>Explore this buying topic</h2>
      <p>Topic: <Link href={href}>{label}</Link></p>
      <ul>{[...resources, ...navigation.recommendations].map(([path, text]) => <li key={path}><Link href={path}>{text}</Link></li>)}</ul>
    </nav>
  );
}
