export const PROGRAMMES = [
  { id: "club", name: "Club shop collection", skus: ["S005", "S004", "S003"] },
  { id: "member", name: "Member & academy welcome kit", skus: ["S005", "S004"] },
  { id: "event", name: "Tournament & sponsor pack", skus: ["S004", "S003"] },
];

export const PROGRAMME_PRODUCTS = [
  { sku: "S005", name: "Thermal-lined racket sleeve", status: "Sample-photo reference", role: "Dedicated racket carry" },
  { sku: "S004", name: "Court essentials pouch", status: "Design concept", role: "Small-item storage" },
  { sku: "S003", name: "Separate shoe bag", status: "Design concept", role: "Footwear storage" },
  { sku: "PDB017", name: "Training utility backpack", status: "AI design concept", role: "Main bag / daily training" },
  { sku: "PDB016", name: "Match-day team duffel", status: "AI design concept", role: "Main bag / premium tier" },
];

export function initialProgrammeRows(id) {
  const programme = PROGRAMMES.find(p => p.id === id) || PROGRAMMES[0];
  return PROGRAMME_PRODUCTS.map(p => ({ ...p, selected: programme.skus.includes(p.sku), quantity: "300" }));
}

export function buildProgrammeBrief(id, rows) {
  const programme = PROGRAMMES.find(p => p.id === id) || PROGRAMMES[0];
  const chosen = rows.filter(p => p.selected);
  if (!chosen.length) return { valid: false, error: "Select at least one style to prepare your brief." };
  if (chosen.some(p => !/^\d+$/.test(String(p.quantity)) || !Number.isSafeInteger(Number(p.quantity)) || Number(p.quantity) < 300)) {
    return { valid: false, error: "Enter a whole-number quantity of at least 300 pieces for each selected style. Different styles cannot share one minimum." };
  }
  const lines = chosen.map(p => `${p.sku} ${p.name}: ${Number(p.quantity)} pieces`);
  const text = [programme.name, ...lines,
    "New custom MOQ: 300 pieces per style; colour splits and samples assessed separately.",
    "Please review materials, dimensions, artwork, packing list, budget, destination and required arrival date.",
    "Bags only. Playing equipment, prices and delivery commitments are not included."
  ].join("\n");
  const query = new URLSearchParams({ product: "Padel Bags", format: text });
  return { valid: true, text, href: `/inquiry?${query.toString()}`, styleCount: chosen.length, totalPieces: chosen.reduce((sum,p) => sum + Number(p.quantity), 0) };
}
