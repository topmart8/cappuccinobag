export const prohibitedClaimPatterns = Object.freeze([
  /\blowest price\b/i,
  /\bguaranteed lowest price\b/i,
  /\b100%\s+(waterproof|sustainable|recyclable)\b/i,
  /\bzero defects?\b/i,
  /\bguaranteed delivery\b/i,
  /\bofficial supplier\b/i,
  /\bexclusive manufacturer\b/i,
  /\btrusted by\s+[A-Z][\w&.-]+/i,
  /\bcertified material\b/i,
  /\b(?:MOQ|minimum order quantity)\s*(?:is|:)?\s*\d+/i,
  /\b(?:sample|production) lead time\s*(?:is|:)?\s*\d+/i,
  /\b(?:annual|monthly) capacity\s*(?:is|:)?\s*[\d,]+/i,
  /\b(?:factory area|employees?|machines?)\s*(?:is|:)?\s*[\d,]+/i,
]);

export const prohibitedSensitivePatterns = Object.freeze([
  /\b(bank account|iban|swift code|payment terms?|contract|compensation)\b/i,
  /\b(api[_ -]?key|service[_ -]?role[_ -]?key|github token|password)\b/i,
]);

export function findProhibitedClaims(text = "") {
  return prohibitedClaimPatterns
    .filter((pattern) => pattern.test(String(text)))
    .map((pattern) => pattern.source);
}
