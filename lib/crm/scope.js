export function applyOwnerScope(path, actor) {
  if (!actor || actor.role === "admin" || !actor.user) return path;
  const separator = path.includes("?") ? "&" : "?";
  return `${path}${separator}owner=eq.${encodeURIComponent(actor.user)}`;
}
