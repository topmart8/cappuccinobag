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

export function renderWorkshopGallery({ priority = false } = {}) {
  return `<div class="workshop-gallery" aria-label="Three real Cappuccino Bag workshop photographs">${photos.map((photo, index) => {
    const portrait = photo.height > photo.width;
    const src = `/images/workshop/${photo.file}.webp`;
    const widths = portrait ? [480] : [640, 960];
    const srcset = [...widths.map((width) => `/images/workshop/${photo.file}-${width}.webp ${width}w`), `${src} ${photo.width}w`].join(", ");
    const sizes = portrait
      ? "(max-width: 620px) calc(100vw - 28px), (min-width: 1216px) 466px, calc(40vw - 21px)"
      : "(max-width: 620px) calc(100vw - 28px), (min-width: 1216px) 698px, calc(60vw - 31px)";
    const loading = priority && index === 0 ? 'loading="eager" fetchpriority="high"' : 'loading="lazy"';
    return `<figure class="workshop-photo workshop-photo--${photo.file}"><a class="workshop-photo-link" href="${src}" target="_blank" rel="noopener" aria-label="Open full ${photo.label.toLowerCase()} photograph in a new tab"><img src="${src}" srcset="${srcset}" sizes="${sizes}" alt="${photo.alt}" width="${photo.width}" height="${photo.height}" ${loading} decoding="async"></a><figcaption><span class="workshop-signature"><span class="brand-mark" aria-hidden="true"></span><span>Cappuccino Bag</span></span><span>${photo.label}</span></figcaption></figure>`;
  }).join("")}</div><p class="workshop-photo-note">Inside our production workshop · Actual photographs · Select a photo to view full size.</p>`;
}
