export const golfPath = "/golf-bags";
export const golfImage = "/images/golf-bags/golf-collection-concept.webp";

export function golfInquiryHref(format = "Golf bags and accessories collection") {
  return `/inquiry?${new URLSearchParams({ product: "Golf Bags", format })}`;
}

export const golfProducts = [
  {
    id: "shoe-bags",
    name: "Golf Shoe Bag",
    use: "For club shops & golf brands",
    description: "A compact carry format for footwear between home, locker room and course.",
    options: ["Shoe-size-specific dimensions", "Ventilation and wipe-clean lining options", "Grab handle and custom logo placement"],
    brief: "Share the largest shoe size and your preferred opening style.",
  },
  {
    id: "weekenders",
    name: "Golf Weekender Bag",
    use: "For golf travel & resort collections",
    description: "A coordinated weekend carry concept with a separate lower shoe compartment.",
    options: ["Separate footwear storage", "Carry handles and removable shoulder strap", "Custom pocket layout and trim"],
    brief: "Share target dimensions, packing needs and planned carrying load.",
  },
  {
    id: "valuables-pouches",
    name: "Golf Valuables Pouch",
    use: "For branded accessories & gift programs",
    description: "A small zipped pouch concept for personal items inside a larger golf or travel bag.",
    options: ["Lining and padding choices", "Custom zipper pulls and branding", "Coordinated colors and packaging"],
    brief: "Share the items to be carried and your branding reference.",
  },
  {
    id: "accessories-cases",
    name: "Golf Glove & Accessories Case",
    use: "For organized everyday golf carry",
    description: "A flat organizer direction for gloves and small golf accessories, developed around your contents.",
    options: ["Dividers, mesh pockets or elastic loops", "Glove compartment layout", "Custom exterior material and closure"],
    brief: "Share glove dimensions and an accessory list to check the layout.",
  },
];

export const golfFaqs = [
  ["Are these bags available from stock?", "These are design concepts for custom OEM/ODM development, not stock products or photographs of approved physical samples. Materials, dimensions, construction and performance are confirmed through project review and physical sampling."],
  ["What is the minimum order quantity?", "The minimum for a new custom bulk order is 300 pieces per style. Different styles cannot be combined to reach 300 pieces. Color splits, special materials and custom components may require higher quantities. Sample orders are assessed separately."],
  ["Can the products carry our brand or club logo?", "Logo placement, application method, colors, lining, trim and packaging can be reviewed against your artwork and product brief. The selected materials and branding method are confirmed on the approved sample."],
  ["What should we send for a quotation?", "Send the product format, quantity per style and color, target dimensions, material direction, logo artwork, destination and delivery window. Pricing, sample fees and lead times are confirmed for your specific project."],
];
