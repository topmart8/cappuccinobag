export const primaryNavigation = [
  { label: "Padel Bags", href: "/racket-sports/padel-bags" },
  { label: "Pickleball Bags", href: "/custom-pickleball-paddle-bags" },
  { label: "Tennis Bags", href: "/custom-tennis-bag-manufacturer" },
  { label: "Outdoor & Hiking", href: "/custom-outdoor-sports-bag-manufacturer" },
  { label: "Travel Bags", href: "/custom-travel-backpacks-weekender-bags" },
];

export const moreCollectionsNavigation = [
  { label: "Running & Sports Bags", href: "/running-waist-packs" },
  { label: "Pet Travel Bags", href: "/pet-travel-bags" },
  { label: "RFID Wallets", href: "/rfid-wallet-passport-holder-manufacturer" },
  { label: "Sustainable Materials", href: "/recycled-material-bags" },
  { label: "Padel Accessories", href: "/padel-accessories" },
  { label: "Buyer Resources", href: "/resources" },
];

export const utilityNavigation = [
  { label: "Factory Proof", href: "/factory-trust-materials" },
  { label: "RFQ", href: "/inquiry" },
];

export const footerNavigation = [
  {
    title: "Core Sports Bags",
    links: [
      primaryNavigation[0],
      primaryNavigation[1],
      primaryNavigation[2],
      { label: "Padel Accessories", href: "/padel-accessories" },
    ],
  },
  {
    title: "Outdoor & Travel",
    links: [primaryNavigation[3], primaryNavigation[4]],
  },
  {
    title: "Emerging Collections",
    links: moreCollectionsNavigation.slice(0, 4),
  },
  {
    title: "Manufacturing & Proof",
    links: [
      { label: "Factory Proof", href: "/factory-trust-materials" },
      { label: "Sustainable Materials", href: "/recycled-material-bags" },
      { label: "Buyer Resources", href: "/resources" },
      { label: "Case Studies", href: "/case-studies" },
      { label: "Products Directory", href: "/products" },
    ],
  },
  {
    title: "Contact",
    links: [
      { label: "Request a Quote", href: "/inquiry" },
      { label: "Contact", href: "/contact" },
      { label: "Privacy", href: "/privacy" },
    ],
  },
];

export const allHeaderNavigation = [
  ...primaryNavigation,
  ...moreCollectionsNavigation,
  ...utilityNavigation,
];
