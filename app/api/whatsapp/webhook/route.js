import { NextResponse } from "next/server";
import { validMetaSignature } from "../../../../lib/crm/metaSignature";
import { processWhatsAppPayload } from "../../../../lib/crm/whatsapp";

export const runtime = "nodejs";

export async function GET(request) {
  const url = new URL(request.url);
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");
  if (mode === "subscribe" && token && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    return new Response(challenge || "", { status: 200 });
  }
  return NextResponse.json({ message: "Webhook verification failed." }, { status: 403 });
}

export async function POST(request) {
  const raw = await request.text();
  if (!validMetaSignature(raw, request.headers.get("x-hub-signature-256"))) {
    return NextResponse.json({ message: "Invalid webhook signature." }, { status: 401 });
  }
  let payload;
  try {
    payload = JSON.parse(raw);
  } catch {
    return NextResponse.json({ message: "Invalid webhook payload." }, { status: 400 });
  }
  if (payload.object !== "whatsapp_business_account") {
    return NextResponse.json({ message: "Unsupported webhook object." }, { status: 400 });
  }
  try {
    await processWhatsAppPayload(payload, raw);
    return NextResponse.json({ received: true });
  } catch {
    return NextResponse.json({ message: "Webhook processing failed." }, { status: 500 });
  }
}
