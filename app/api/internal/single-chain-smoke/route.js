import { NextResponse } from "next/server";
import { runSingleChainSmoke } from "../../../../automation/smoke/single-chain-smoke.js";

export const dynamic = "force-dynamic";

export async function GET() {
  if (
    process.env.VERCEL_ENV !== "preview"
    || process.env.VERCEL_GIT_COMMIT_REF !== "feature/cappuccino-seo-automation"
  ) {
    return NextResponse.json({ error: "Not available." }, { status: 404 });
  }

  try {
    return NextResponse.json(await runSingleChainSmoke());
  } catch (error) {
    return NextResponse.json({
      error: error.message,
      ...(error.smokeResult ? { smoke_result: error.smokeResult } : {}),
    }, { status: 500 });
  }
}
