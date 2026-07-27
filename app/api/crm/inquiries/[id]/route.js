import { NextResponse } from "next/server";
import { createAiDraft } from "../../../../../lib/crm/ai";
import { normalizePhone, supabaseRequest } from "../../../../../lib/crm/supabase";
import { sendCloudMessage } from "../../../../../lib/crm/whatsapp";

async function resend(to, subject, body) {
  if (!process.env.RESEND_API_KEY || !process.env.INQUIRY_FROM_EMAIL) throw new Error("Email delivery is not configured.");
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: process.env.INQUIRY_FROM_EMAIL, to: [to], subject, text: body }),
  });
  if (!response.ok) throw new Error("Email delivery failed.");
}

export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const input = await request.json();
    const rows = await supabaseRequest(`inquiries?id=eq.${encodeURIComponent(id)}&select=*&limit=1`);
    const inquiry = rows?.[0];
    if (!inquiry) return NextResponse.json({ message: "Inquiry not found." }, { status: 404 });
    if (input.action === "save_draft") {
      await supabaseRequest(`inquiries?id=eq.${id}`, { method: "PATCH", body: { ai_reply_draft: String(input.draft || "").slice(0, 8000) } });
      return NextResponse.json({ message: "Draft saved." });
    }
    if (input.action === "reject") {
      await supabaseRequest(`inquiries?id=eq.${id}`, { method: "PATCH", body: { reply_status: "draft_rejected" } });
      return NextResponse.json({ message: "Draft rejected." });
    }
    if (input.action === "toggle_takeover") {
      const value = Boolean(input.value);
      await supabaseRequest(`inquiries?id=eq.${id}`, { method: "PATCH", body: { human_takeover: value, auto_reply_enabled: !value } });
      await supabaseRequest(`customers?id=eq.${inquiry.customer_id}`, { method: "PATCH", body: { human_takeover: value, auto_reply_enabled: !value } });
      return NextResponse.json({ message: value ? "Human takeover enabled." : "Automation released." });
    }
    if (input.action === "regenerate") {
      const draft = await createAiDraft(inquiry);
      await supabaseRequest(`inquiries?id=eq.${id}`, {
        method: "PATCH",
        body: {
          ai_reply_draft: draft.reply_body,
          ai_customer_summary: draft.customer_summary,
          ai_recommended_action: draft.recommended_action,
          ai_result: draft,
          human_takeover: draft.human_review_required,
          risk_level: draft.risk_level,
        },
      });
      return NextResponse.json({ message: "Draft regenerated.", draft: draft.reply_body });
    }
    if (input.action === "approve") {
      const draft = String(input.draft || inquiry.ai_reply_draft || "").trim();
      if (!draft) return NextResponse.json({ message: "Draft is empty." }, { status: 422 });
      if (inquiry.source_channel === "whatsapp") {
        const phone = normalizePhone(inquiry.whatsapp || inquiry.phone);
        if (!phone) throw new Error("Valid WhatsApp number is missing.");
        await sendCloudMessage(phone, draft);
      } else {
        if (!inquiry.email) throw new Error("Customer email is missing.");
        await resend(inquiry.email, `${inquiry.brand} inquiry ${inquiry.inquiry_number}`, draft);
      }
      await supabaseRequest(`inquiries?id=eq.${id}`, {
        method: "PATCH",
        body: { ai_reply_draft: draft, reply_status: "sent", human_takeover: false },
      });
      await supabaseRequest(`customers?id=eq.${inquiry.customer_id}`, {
        method: "PATCH",
        body: { last_business_message_at: new Date().toISOString() },
      });
      return NextResponse.json({ message: "Approved reply sent." });
    }
    return NextResponse.json({ message: "Unsupported action." }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ message: error.message || "CRM action failed." }, { status: 502 });
  }
}

