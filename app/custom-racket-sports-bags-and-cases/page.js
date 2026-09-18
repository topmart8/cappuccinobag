import RacketSportsPage, { getRacketSportsMetadata } from "../racket-sports-page-template";
import { racketSportsPages } from "../racket-sports-pages";

const page = racketSportsPages["custom-racket-sports-bags-and-cases"];
export const metadata = getRacketSportsMetadata(page);
export default function CustomRacketSportsBagsAndCasesPage() { return <RacketSportsPage page={page} />; }
