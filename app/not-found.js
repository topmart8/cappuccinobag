import Link from "next/link";

export const metadata = {
  title: "Page Not Found | Cappuccino Bag",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <main className="not-found-page">
      <p>404</p>
      <h1>We could not find that page.</h1>
      <p>The product or resource may have moved. Continue with the main collections or send an RFQ.</p>
      <div>
        <Link href="/">Return home</Link>
        <Link href="/inquiry/">Request a quote</Link>
      </div>
    </main>
  );
}
