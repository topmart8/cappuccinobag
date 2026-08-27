import { NextResponse } from "next/server.js";
import { getCrmActor } from "../../../../../../lib/crm/auth";
import { createStorageSignedUrl, supabaseRequest } from "../../../../../../lib/crm/supabase";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function GET(request, { params }) {
  try {
    const actor = await getCrmActor();
    const { id } = await params;
    if (!UUID.test(id)) return NextResponse.json({ message: "Invalid inquiry." }, { status: 400 });
    const rows = await supabaseRequest(
      `inquiries?id=eq.${encodeURIComponent(id)}&select=id,site,owner,uploaded_files&limit=1`,
    );
    const inquiry = rows?.[0];
    if (!inquiry) return NextResponse.json({ message: "Inquiry not found." }, { status: 404 });
    if (actor.role !== "admin" && inquiry.owner && inquiry.owner !== actor.user) {
      return NextResponse.json({ message: "Forbidden." }, { status: 403 });
    }
    const files = Array.isArray(inquiry.uploaded_files) ? inquiry.uploaded_files : [];
    const index = Number(new URL(request.url).searchParams.get("file"));
    if (!Number.isInteger(index) || index < 0 || index >= files.length) {
      return NextResponse.json({ message: "Attachment not found." }, { status: 404 });
    }
    const file = files[index];
    const path = String(file?.path || "");
    if (!path.startsWith(`${inquiry.site}/`)) {
      return NextResponse.json({ message: "Invalid attachment path." }, { status: 422 });
    }
    const bucket = process.env.SUPABASE_STORAGE_BUCKET || "crm-attachments";
    const signedUrl = await createStorageSignedUrl(bucket, path, 300);
    return NextResponse.redirect(signedUrl, { status: 302 });
  } catch {
    return NextResponse.json(
      { message: "Secure attachment link could not be created." },
      { status: 502, headers: { "Cache-Control": "no-store" } },
    );
  }
}
