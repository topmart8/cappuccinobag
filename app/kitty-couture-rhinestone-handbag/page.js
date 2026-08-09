import { CaseStudyPage, getCaseStudyMetadata } from "../case-studies/CaseStudyPage";

const slug = "kitty-couture-rhinestone-handbag";

export const metadata = getCaseStudyMetadata(slug);

export default function Page() {
  return <CaseStudyPage slug={slug} />;
}
