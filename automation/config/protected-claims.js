import { PUBLIC_EMAIL } from "./cappuccinobag.config.js";

export const confirmedCapabilities = Object.freeze([
  "OEM", "ODM", "Product Development", "Sampling", "Material Sourcing",
  "Bag Production", "Logo Customization", "Packaging Customization",
  "Quality Inspection", "Padel Bags", "Pickleball Bags", "Tennis Bags",
  "Running Bags", "Hiking Bags", "Outdoor Bags", "Travel Bags", "RFID Wallets",
  "Passport Holders", "Recycled Material Options", "Smart Eco Product Development",
]);

export const humanConfirmationRequired = Object.freeze([
  "specific MOQ", "unit price", "prototype cost", "sample lead time",
  "production lead time", "certification", "material certificate", "capacity",
  "employee count", "machine count", "factory area", "customer name",
  "brand name", "patent", "payment terms", "compensation", "exclusivity",
  "freight cost",
]);

export const safeClaims = Object.freeze({
  publicEmail: PUBLIC_EMAIL,
  moq: "MOQ depends on the selected material, product construction, logo process and order requirements.",
  prototypeCost: "Prototype cost is confirmed after reviewing the design, materials and construction details.",
  sampleLeadTime: "Sample lead time is confirmed after the design and materials are approved.",
  productionLeadTime: "Production lead time is confirmed after sample approval, order quantity and material availability are finalized.",
  certification: "Certification availability should be confirmed according to the selected material and supplier batch.",
  waterResistance: "Water resistance depends on the selected fabric, coating, zipper and construction method.",
});
