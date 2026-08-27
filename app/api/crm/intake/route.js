import { POST as sharedCrmPost } from "../../shared-crm/inquiries/route.js";

export const runtime = "nodejs";

export async function POST(request) {
  return sharedCrmPost(request);
}
