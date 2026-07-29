import { headers } from "next/headers";

export async function getCrmActor() {
  const requestHeaders = await headers();
  return {
    user: requestHeaders.get("x-crm-user") || "unconfigured",
    role: requestHeaders.get("x-crm-role") === "admin" ? "admin" : "sales",
  };
}

export function canManageTeam(actor) {
  return actor?.role === "admin";
}

export function applyOwnerScope(path, actor) {
  if (!actor || actor.role === "admin" || !actor.user) return path;
  const separator = path.includes("?") ? "&" : "?";
  return `${path}${separator}owner=eq.${encodeURIComponent(actor.user)}`;
}
