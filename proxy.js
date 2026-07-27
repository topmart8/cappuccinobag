import { NextResponse } from "next/server";

export function proxy(request) {
  const user = process.env.CRM_ADMIN_USER;
  const password = process.env.CRM_ADMIN_PASSWORD;
  if (!user || !password) {
    return new NextResponse("CRM access is not configured.", { status: 503 });
  }
  const authorization = request.headers.get("authorization") || "";
  if (authorization.startsWith("Basic ")) {
    try {
      const [providedUser, providedPassword] = atob(authorization.slice(6)).split(":");
      if (providedUser === user && providedPassword === password) return NextResponse.next();
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
