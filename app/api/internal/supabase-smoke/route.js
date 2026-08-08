import { NextResponse } from "next/server";
import { runSupabaseSmoke } from "../../../../automation/smoke/supabase-smoke";

export const dynamic = "force-dynamic";

export async function GET() {
  if (process.env.VERCEL_ENV !== "preview") {
    return NextResponse.json({ message: "Not found." }, { status: 404 });
  }
  try {
    const result = await runSupabaseSmoke();
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    return NextResponse.json({
      ...(error.smokeResult || {}),
      error: error.message || "Supabase smoke test failed.",
    }, { status: 500 });
  }
}
