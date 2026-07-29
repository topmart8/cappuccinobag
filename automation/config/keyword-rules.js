export const commercialTerms = Object.freeze([
  "manufacturer", "factory", "supplier", "custom", "oem", "odm",
  "private label", "wholesale", "bulk", "moq", "prototype", "sample",
  "custom logo", "china manufacturer", "contract manufacturing",
]);

export const excludedTerms = Object.freeze([
  "free pattern", "sewing tutorial", "how to sew", "repair", "jobs",
  "career", "second hand", "used bag", "download template", "amazon discount",
]);

export const categoryRules = Object.freeze([
  ["Padel", /\bpadel\b/i],
  ["Pickleball", /\bpickleball\b/i],
  ["Tennis", /\btennis\b/i],
  ["Racket Sports", /\b(racket|racquet)\b/i],
  ["Running", /\b(running|marathon|trail)\b/i],
  ["Waist Packs", /\b(waist pack|belt bag|running belt)\b/i],
  ["Hiking", /\b(hiking|mountaineering|daypack)\b/i],
  ["Outdoor", /\b(outdoor|adventure|water resistant|waterproof)\b/i],
  ["Travel", /\b(travel|weekender|luggage)\b/i],
  ["Duffle Bags", /\b(duffel|duffle)\b/i],
  ["Backpacks", /\b(backpack|daypack)\b/i],
  ["RFID Wallets", /\b(rfid|wallet|card holder|cardholder)\b/i],
  ["Passport Holders", /\bpassport holder\b/i],
  ["Smart Eco", /\b(smart|gps|eco)\b/i],
  ["Recycled Materials", /\b(recycled|sustainable material)\b/i],
  ["Factory Proof", /\b(factory proof|quality control|audit)\b/i],
  ["OEM / ODM", /\b(oem|odm|private label|contract manufacturing)\b/i],
]);

export const singularRules = Object.freeze([
  [/\bbags\b/g, "bag"], [/\bbackpacks\b/g, "backpack"],
  [/\bwallets\b/g, "wallet"], [/\bholders\b/g, "holder"],
  [/\bmanufacturers\b/g, "manufacturer"], [/\bsuppliers\b/g, "supplier"],
]);
