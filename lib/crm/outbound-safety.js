const KNOWN_OUTBOUND_MODES = new Set(["manual", "draft_only", "safe_auto"]);

export const CUSTOMER_OUTBOUND_DEFAULT_MODE = "draft_only";

export function resolveCustomerOutboundPolicy(configuredMode) {
  const normalized = String(configuredMode || CUSTOMER_OUTBOUND_DEFAULT_MODE).trim().toLowerCase();
  const configured = KNOWN_OUTBOUND_MODES.has(normalized)
    ? normalized
    : CUSTOMER_OUTBOUND_DEFAULT_MODE;
  return {
    configured_mode: configured,
    effective_mode: CUSTOMER_OUTBOUND_DEFAULT_MODE,
    historical_safe_auto: configured === "safe_auto",
    unattended_send_allowed: false,
  };
}

export function requireHumanApprovedOutbound(context = {}) {
  if (context.humanApproved !== true) {
    throw new Error("Explicit human approval is required for customer outbound.");
  }
}
