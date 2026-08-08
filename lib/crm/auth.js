import { headers } from "next/headers";
export { applyOwnerScope } from "./scope.js";

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
