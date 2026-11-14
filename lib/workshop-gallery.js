// Owner-supplied workshop photography. Branding is outside the photograph.
const photos = [
  {
    file: "sewing-production",
    width: 1920,
    height: 864,
    label: "Sewing production",
    alt: "Cappuccino Bag workshop with operators sewing bag components at industrial sewing machines and blue parts bins",
  },
  {
    file: "panel-preparation",
    width: 1920,
    height: 864,
    label: "Panel preparation",
    alt: "Cappuccino Bag production floor with stacked fabric panels, worktables and sewing stations",
  },
  {
    file: "production-aisle",
    width: 900,
    height: 1200,
    label: "Workshop aisle",
    alt: "View down the Cappuccino Bag workshop aisle between sewing stations and blue component bins",
  },
];

export function renderWorkshopGallery() {
  return `<div class="workshop-gallery" aria-label="Three real Cappuccino Bag workshop photographs">${photos.map((photo) => `<figure class="workshop-photo workshop-photo--${photo.file}"><a class="workshop-photo-link" href="/images/workshop/${photo.file}.webp" target="_blank" rel="noopener" aria-label="Open full ${photo.label.toLowerCase()} photograph in a new tab"><img src="/images/workshop/${photo.file}.webp" alt="${photo.alt}" width="${photo.width}" height="${photo.height}" loading="lazy" decoding="async"></a><figcaption><span class="workshop-signature"><span class="brand-mark" aria-hidden="true"></span><span>Cappuccino Bag</span></span><span>${photo.label}</span></figcaption></figure>`).join("")}</div><p class="workshop-photo-note">Inside our production workshop · Actual photographs · Select a photo to view full size.</p>`;
}
