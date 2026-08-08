import NextLink from "next/link";
import SiteFooter from "../components/SiteFooter";
import SiteHeader from "../components/SiteHeader";

function Link(props) {
  return <NextLink {...props} prefetch={false} />;
}

export function PadelHeader() {
  return <SiteHeader />;
}

export function PadelFooter() {
  return <SiteFooter />;
}
