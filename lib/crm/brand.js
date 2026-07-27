export const BRANDS = {
  cappuccinobag: {
    site: "cappuccinobag",
    brand: "Cappuccino Bag",
    code: "CAP",
    signature: "Best regards,\nCappuccino Bag Team\ninfo@cappuccinobag.net",
    knowledge: [
      "sports racket bags and padel, pickleball and tennis bags",
      "running waist packs and outdoor products",
      "travel bags, RFID wallets and passport holders",
      "Smart Eco products and factory OEM/ODM development",
      "materials, logo methods, sampling, Factory Proof and the RFQ page",
    ],
    categories: [
      "Padel Bags", "Pickleball Bags", "Tennis Bags", "Running Waist Packs",
      "Hiking Bags", "Outdoor Bags", "Travel Bags", "RFID Wallets",
      "Passport Holders", "Smart Eco Bags", "OEM/ODM Development", "Other",
    ],
  },
  novlane: {
    site: "novlane",
    brand: "Novlane",
    code: "NOV",
    signature: "Best regards,\nNovlane Team\ninfo@cappuccinobag.net",
    knowledge: [
      "material-innovation women's handbags and OEM/ODM",
      "Tartan Collection, vegan leather, Alcantara and apple leather",
      "recycled, TPU and digitally printed materials",
      "wallets, cardholders and passport holders",
      "material development, custom logos, packaging and sampling",
    ],
    categories: [
      "Women’s Handbags", "Crossbody Bags", "Tote Bags", "Shoulder Bags",
      "Wallets", "Cardholders", "Passport Holders", "Tartan Collection",
      "Vegan Leather Bags", "Alcantara Products", "Apple Leather Products",
      "Recycled Material Bags", "Printed Material Products", "Custom OEM/ODM", "Other",
    ],
  },
};

export const REVIEW_PATTERNS = [
  /\b(quote|quotation|price|discount|sample fee|mould fee|mold fee|pi|proforma)\b/i,
  /\b(bank|account|payment|contract|exclusive|delivery date|shipping cost)\b/i,
  /\b(complaint|refund|compensation|legal|certificate original)\b/i,
  /报价|价格|降价|样品费|模具费|形式发票|银行|付款|合同|交期|运费|投诉|退款|赔偿|法律|认证原件/i,
];

export function getBrand(site) {
  const brand = BRANDS[site];
  if (!brand) throw new Error("Unsupported site.");
  return brand;
}

export function requiresHumanReview(text = "", leadScore = 0) {
  return leadScore >= 85 || REVIEW_PATTERNS.some((pattern) => pattern.test(text));
}

export function recognizeBrand(text = "", fallbackSite = "") {
  if (/\b(Cappuccino Bag|CAP-(PDL|OUT|TRV))\b/i.test(text)) return BRANDS.cappuccinobag;
  if (/\b(Novlane|NOV-(TAR|WAL|HBG))\b/i.test(text)) return BRANDS.novlane;
  if (/\b(padel|pickleball|tennis|running|hiking|outdoor)\b/i.test(text)) return BRANDS.cappuccinobag;
  if (/\b(tartan|handbag|vegan leather|alcantara|apple leather|cardholder)\b/i.test(text)) return BRANDS.novlane;
  return BRANDS[fallbackSite] || null;
}

