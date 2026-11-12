"use client";

import Image from "next/image";
import { useState } from "react";
import styles from "./PadelImageGallery.module.css";

const viewNames = {
  hero: "Main view",
  interior: "Interior",
  detail: "Details",
  rear: "Back view",
  side: "Side view",
  lifestyle: "On court",
  strap: "Strap",
  packing: "Packing",
  front: "Front view",
};

export function getImageView(image) {
  const view = image.src.split("/").pop().replace(/\.[^.]+$/, "").split("-").pop();
  return { ...image, view, label: viewNames[view] || image.caption || "Product view" };
}

export default function PadelImageGallery({ images, model, layout = "hybrid" }) {
  const rank = { hero: 0, interior: 1, detail: 2 };
  const views = images.map(getImageView).sort((a, b) => (rank[a.view] ?? 3) - (rank[b.view] ?? 3));
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selected = views[selectedIndex];

  function move(offset) {
    setSelectedIndex((current) => (current + offset + views.length) % views.length);
  }

  return (
    <div className={`${styles.gallery} ${layout === "padel" ? styles.padelLayout : styles.hybridLayout}`} aria-label={`${model} product photos`}>
      <figure className={styles.viewer}>
        <Image
          src={selected.src}
          alt={selected.alt}
          width={selected.width || 1250}
          height={selected.height || 1250}
          sizes="(max-width: 980px) calc(100vw - 28px), 52vw"
          priority={selectedIndex === 0}
          loading={selectedIndex === 0 ? undefined : "eager"}
        />
        <div className={styles.controls}>
          <button type="button" aria-label="Previous product image" onClick={() => move(-1)}>←</button>
          <span>{selectedIndex + 1} / {views.length}</span>
          <button type="button" aria-label="Next product image" onClick={() => move(1)}>→</button>
        </div>
      </figure>
      <div className={styles.heading}>
        <strong>Interior &amp; details</strong>
        <span>Tap a photo to view</span>
      </div>
      <div className={styles.thumbnails} aria-label="Choose a product view">
        {views.map((image, index) => (
          <button
            type="button"
            key={image.src}
            aria-label={`Show ${image.label.toLowerCase()}`}
            aria-pressed={selectedIndex === index}
            onClick={() => setSelectedIndex(index)}
          >
            <Image src={image.src} alt="" width={120} height={120} sizes="(max-width: 600px) 30vw, 12vw" loading="eager" />
            <span>{image.label}</span>
          </button>
        ))}
      </div>
      <p className={styles.caption} aria-live="polite">{selected.caption || selected.alt}</p>
      <div className={styles.links}>
        <a href="#product-details-gallery">See all photos below ↓</a>
        <a href={selected.src} target="_blank" rel="noreferrer">Open full-size photo ↗</a>
      </div>
    </div>
  );
}
