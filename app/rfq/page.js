import { permanentRedirect } from "next/navigation";

export const metadata = {
  title: "Request a Quote | Cappuccino Bag",
  description: "Submit a Cappuccino Bag OEM/ODM product brief, reference image or tech pack.",
  robots: { index: true, follow: true },
};

export default function RfqPage() {
  permanentRedirect("/inquiry/");
}

