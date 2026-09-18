import RacketSportsPage, { getRacketSportsMetadata } from "../racket-sports-page-template";
import { racketSportsPages } from "../racket-sports-pages";

const page = racketSportsPages["custom-padel-racket-sleeves"];
export const metadata = getRacketSportsMetadata(page);
export default function CustomPadelRacketSleevesPage() { return <RacketSportsPage page={page} />; }
