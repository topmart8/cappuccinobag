import { NextResponse } from "next/server";

export function proxy(request) {
  // The canonical ingest route performs its own constant-time bearer-secret check.
  if (new URL(request.url).pathname === "/api/crm/intake") {
    return NextResponse.next();
  }

  const accounts = [
    { user: process.env.CRM_ADMIN_USER, password: process.env.CRM_ADMIN_PASSWORD, role: "admin" },
    { user: process.env.CRM_SALES_USER, password: process.env.CRM_SALES_PASSWORD, role: "sales" },
  ].filter((account) => account.user && account.password);
  if (!accounts.length) {
    return new NextResponse("CRM access is not configured.", { status: 503 });
  }
  const authorization = request.headers.get("authorization") || "";
  if (authorization.startsWith("Basic ")) {
    try {
      const [providedUser, providedPassword] = atob(authorization.slice(6)).split(":");
      const account = accounts.find(
        (item) => item.user === providedUser && item.password === providedPassword,
      );
      if (account) {
        const requestHeaders = new Headers(request.headers);
        requestHeaders.set("x-crm-user", account.user);
        requestHeaders.set("x-crm-role", account.role);
        return NextResponse.next({ request: { headers: requestHeaders } });
      }
    } catch {}
  }
  return new NextResponse("Authentication required.", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Unified CRM", charset="UTF-8"' },
  });
}

export const config = {
  matcher: ["/crm/:path*", "/api/crm/:path*"],
};
