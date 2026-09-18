import RacketSportsPage, { getRacketSportsMetadata } from "../racket-sports-page-template";
import { racketSportsPages } from "../racket-sports-pages";

const page = racketSportsPages["padel-brand-collection-development"];
export const metadata = getRacketSportsMetadata(page);
export default function PadelBrandCollectionDevelopmentPage() { return <RacketSportsPage page={page} />; }
