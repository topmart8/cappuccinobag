import { createHmac, timingSafeEqual } from "node:crypto";

export function validMetaSignature(raw, signature, secret = process.env.META_APP_SECRET) {
  if (!secret || !signature?.startsWith("sha256=")) return false;
  const expected = createHmac("sha256", secret).update(raw).digest("hex");
  const provided = signature.slice(7);
  if (provided.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(provided), Buffer.from(expected));
}

