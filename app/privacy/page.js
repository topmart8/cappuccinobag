import Link from "next/link";

export const metadata = {
  title: "Privacy and Analytics | Cappuccino Bag",
  description: "How Cappuccino Bag uses necessary storage and optional website analytics.",
  alternates: { canonical: "/privacy/" },
};

export default function PrivacyPage() {
  return (
    <main className="privacy-page">
      <Link href="/">← Cappuccino Bag</Link>
      <h1>Privacy and analytics</h1>
      <p>Last updated: July 31, 2026</p>
      <h2>Information you send</h2>
      <p>
        When you submit an inquiry, we use the contact and project information you provide to
        respond, prepare follow-up and manage the request in our customer system. We do not send
        names, email addresses, phone numbers, WhatsApp numbers, addresses, company contact
        persons or message text to website analytics providers.
      </p>
      <h2>Necessary storage</h2>
      <p>
        Necessary first-party storage supports your cookie preference and preserves non-sensitive
        campaign attribution so an inquiry can be connected to its original and current visit.
        This does not prevent you from using the website when analytics is declined.
      </p>
      <h2>Optional analytics</h2>
      <p>
        With your permission, we may load Google Analytics 4, Microsoft Clarity, Vercel Web
        Analytics and Vercel Speed Insights. These tools help us understand aggregate traffic,
        page performance, navigation and inquiry conversion. Clarity recording is configured to
        mask forms. Analytics is disabled by default until you choose to accept it.
      </p>
      <h2>Your choice</h2>
      <p>
        Select “Necessary only” or “Accept analytics” in the cookie panel. You can reopen
        “Cookie settings” at any time and change the choice. Declining analytics does not block
        access to site content or inquiry forms.
      </p>
      <h2>Contact</h2>
      <p>
        Questions about this notice can be sent to
        {" "}<a href="mailto:info@cappuccinobag.net">info@cappuccinobag.net</a>.
      </p>
    </main>
  );
}
