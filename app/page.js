import Page from "./[[...slug]]/page";

export default function HomePage() {
    return <Page params={Promise.resolve({ slug: [] })} />;
}
