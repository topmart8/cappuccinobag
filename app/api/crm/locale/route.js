import { NextResponse } from "next/server";

export function GET(request) {
  const url = new URL(request.url);
  const locale = url.searchParams.get("lang") === "en" ? "en" : "zh";
  const next = url.searchParams.get("next")?.startsWith("/crm") ? url.searchParams.get("next") : "/crm";
  const response = NextResponse.redirect(new URL(next, request.url));
  response.cookies.set("crm_locale", locale, {
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    maxAge: 31536000,
    path: "/",
  });
  return response;
}
