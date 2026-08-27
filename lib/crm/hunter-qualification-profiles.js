const SHARED_COMPONENTS = Object.freeze([
  "customer_intelligence",
  "lead_score",
  "qualification_engine",
  "crm",
  "tasks",
  "next_best_action",
  "human_approval",
  "company_policy",
]);

function profile(config) {
  return Object.freeze({
    ...config,
    shared_components: SHARED_COMPONENTS,
    mode: "qualification_profile_only",
  });
}

export const HUNTER_QUALIFICATION_PROFILES = Object.freeze({
  HUNTER_01: profile({
    profile_id: "HUNTER_01",
    label: "Hunter-01",
    focus: "Outdoor / Travel / Sports",
    icp: Object.freeze([
      "Outdoor, travel or sports brands",
      "Retailers and distributors developing private-label bags",
      "OEM/ODM buyers with repeat-program potential",
    ]),
    product_weights: Object.freeze({ TRAVEL: 1, RACKET_SPORTS: 0.9, TEAM_SPORTS: 0.9 }),
    qualification_questions: Object.freeze([
      "product_family", "estimated_quantity", "OEM_or_ODM", "target_market", "development_stage",
    ]),
    buying_signals: Object.freeze(["clear_product_brief", "repeat_program", "retail_channel", "sample_interest"]),
    negative_signals: Object.freeze(["personal_purchase", "price_only", "no_validated_business_need"]),
    taxonomy_preferences: Object.freeze(["TRAVEL", "RACKET_SPORTS", "TEAM_SPORTS"]),
    scoring_weights: Object.freeze({ product_fit: 1, repeat_potential: 1, buying_intent: 1 }),
    recommended_playbooks: Object.freeze(["MEN_TRAVEL", "PAD", "BASE"]),
    recommended_owner: "outdoor_travel_sports_sales",
  }),
  PADEL_02: profile({
    profile_id: "PADEL_02",
    label: "Padel-02",
    focus: "Padel / Pickleball / Tennis",
    icp: Object.freeze([
      "Racket-sport brands and specialist retailers",
      "Clubs, academies and distributors with branded-bag demand",
      "Private-label padel, pickleball or tennis programs",
    ]),
    product_weights: Object.freeze({ RACKET_SPORTS: 1 }),
    qualification_questions: Object.freeze([
      "racket_type", "racket_capacity", "shoe_compartment", "estimated_quantity", "customization_need",
    ]),
    buying_signals: Object.freeze(["club_or_retail_channel", "team_branding", "sample_interest", "repeat_program"]),
    negative_signals: Object.freeze(["single_personal_bag", "no_quantity", "price_only"]),
    taxonomy_preferences: Object.freeze(["RACKET_SPORTS"]),
    scoring_weights: Object.freeze({ product_fit: 1.2, buying_intent: 1, repeat_potential: 0.9 }),
    recommended_playbooks: Object.freeze(["PAD"]),
    recommended_owner: "racket_sports_sales",
  }),
  ECO_03: profile({
    profile_id: "ECO_03",
    label: "Eco-03",
    focus: "Recycled / Vegan / Apple leather / sustainable materials",
    icp: Object.freeze([
      "Brands with an explicit sustainable-material brief",
      "Retail or corporate programs requiring traceable material claims",
      "OEM/ODM projects that accept human compliance review",
    ]),
    product_weights: Object.freeze({ LEATHER: 1, TRAVEL: 0.8, RACKET_SPORTS: 0.7 }),
    qualification_questions: Object.freeze([
      "material_interest", "compliance_requirement", "target_market", "estimated_quantity", "development_stage",
    ]),
    buying_signals: Object.freeze(["verified_material_brief", "compliance_review_ready", "repeat_program"]),
    negative_signals: Object.freeze(["unverified_green_claim", "automatic_compliance_request", "price_only"]),
    taxonomy_preferences: Object.freeze(["LEATHER", "TRAVEL", "RACKET_SPORTS"]),
    scoring_weights: Object.freeze({ product_fit: 1, evidence_quality: 1.2, risk_adjustment: 1.2 }),
    recommended_playbooks: Object.freeze(["LEAW", "MEN_TRAVEL", "PAD"]),
    recommended_owner: "sustainable_materials_sales",
  }),
  HOTEL_04: profile({
    profile_id: "HOTEL_04",
    label: "Hotel-04",
    focus: "Hotels / Resorts / Hospitality / corporate gifting",
    icp: Object.freeze([
      "Hotel and resort groups",
      "Hospitality procurement and corporate-gifting buyers",
      "Multi-property branded programs with repeat potential",
    ]),
    product_weights: Object.freeze({ TRAVEL: 1, LEATHER: 0.9 }),
    qualification_questions: Object.freeze([
      "company_name", "customer_type", "estimated_quantity", "customization_need", "timeline",
    ]),
    buying_signals: Object.freeze(["multi_property_program", "corporate_gifting", "repeat_program", "clear_timeline"]),
    negative_signals: Object.freeze(["personal_purchase", "unverified_hotel_identity", "price_only"]),
    taxonomy_preferences: Object.freeze(["TRAVEL", "LEATHER"]),
    scoring_weights: Object.freeze({ brand_channel_strength: 1.1, repeat_potential: 1.1, evidence_quality: 1 }),
    recommended_playbooks: Object.freeze(["MEN_TRAVEL", "LEAW"]),
    recommended_owner: "hospitality_corporate_sales",
  }),
});

export function getHunterQualificationProfile(profileId) {
  return HUNTER_QUALIFICATION_PROFILES[profileId] || null;
}
