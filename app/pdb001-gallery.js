"use client";

import Image from "next/image";
import { useState } from "react";

const colours = [
  {
    label: "Charcoal Grey",
    swatch: "#424446",
    src: "/images/padel/PDB001/hero-colors/PDB001-charcoal-grey-main.webp",
    alt: "Charcoal grey PDB001 lightweight padel work tote backpack digital colour reference",
  },
  {
    label: "Sand Beige + Dusty Blue",
    swatch: "#d7c6a7",
    src: "/images/padel/PDB001/hero-colors/PDB001-sand-beige-blue-main.webp",
    alt: "Sand beige and dusty blue PDB001 padel laptop tote digital colour reference",
  },
  {
    label: "Sage Green + Cream",
    swatch: "#9aa18a",
    src: "/images/padel/PDB001/hero-colors/PDB001-sage-green-cream-main.webp",
    alt: "Sage green and cream PDB001 office-to-court padel bag digital colour reference",
  },
  {
    label: "Dusty Rose + Burgundy",
    swatch: "#b9888b",
    src: "/images/padel/PDB001/hero-colors/PDB001-dusty-rose-burgundy-main.webp",
    alt: "Dusty rose and burgundy PDB001 convertible padel tote digital colour reference",
  },
  {
    label: "Lavender + Soft Grey",
    swatch: "#aaa2b3",
    src: "/images/padel/PDB001/hero-colors/PDB001-lavender-grey-main.webp",
    alt: "Lavender and soft grey PDB001 multi-pocket padel backpack digital colour reference",
  },
  {
    label: "Sky Blue + Navy",
    swatch: "#7fa7bd",
    src: "/images/padel/PDB001/hero-colors/PDB001-sky-blue-navy-main.webp",
    alt: "Sky blue and navy PDB001 work and racket tote digital colour reference",
  },
];

export default function Pdb001Gallery() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selected = colours[selectedIndex];

  return (
    <div className="pdb001-colour-gallery">
      <figure className="pdb001-colour-image">
        <Image
          key={selected.src}
          src={selected.src}
          width={1200}
          height={1200}
          sizes="(max-width: 900px) calc(100vw - 28px), 52vw"
          alt={selected.alt}
          priority
        />
        <figcaption>Digital colour reference · {selected.label}</figcaption>
      </figure>
      <div className="pdb001-colour-picker" aria-label="Digital colour references">
        {colours.map((colour, index) => (
          <button
            key={colour.label}
            type="button"
            className={index === selectedIndex ? "is-active" : ""}
            onClick={() => setSelectedIndex(index)}
            aria-pressed={index === selectedIndex}
            aria-label={`Show ${colour.label}`}
          >
            <span style={{ backgroundColor: colour.swatch }} aria-hidden="true" />
            {colour.label}
          </button>
        ))}
      </div>
      <p className="pdb001-colour-disclosure">
        Colour images are digital references. Final colour, texture and trim are
        subject to material swatch and sample approval.
      </p>
    </div>
  );
}
