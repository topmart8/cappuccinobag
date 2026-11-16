"use client";

import { useState } from "react";
import Link from "next/link";
import { PROGRAMMES, initialProgrammeRows, buildProgrammeBrief } from "../lib/padel-programme-brief.mjs";
import styles from "./PadelProgrammeBuilder.module.css";

export default function PadelProgrammeBuilder() {
  const [programme, setProgramme] = useState("club");
  const [rows, setRows] = useState(() => initialProgrammeRows("club"));
  const brief = buildProgrammeBrief(programme, rows);
  const updateRow = (sku, changes) => setRows(current => current.map(p => p.sku === sku ? { ...p, ...changes } : p));
  const chooseProgramme = (id) => {
    setProgramme(id);
    const preset = initialProgrammeRows(id);
    setRows(current => preset.map(p => ({ ...p, quantity: current.find(r => r.sku === p.sku)?.quantity || "300" })));
  };

  return <section className={styles.builder} id="range-builder" aria-labelledby="programme-builder-title">
    <p className={styles.eyebrow}>Prepare your buying brief</p>
    <h2 id="programme-builder-title">Choose the range. Set each quantity.</h2>
    <p>Use a starting combination, then adjust the styles and quantities. This prepares an enquiry; it is not an order or a price quotation.</p>
    <div className={styles.programmeField}><label htmlFor="padel-programme">Your programme</label><select id="padel-programme" value={programme} onChange={event => chooseProgramme(event.target.value)}>{PROGRAMMES.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select></div>
    <fieldset className={styles.rows}><legend>Products and quantities</legend>{rows.map(p => <div className={`${styles.row} ${p.selected ? styles.selected : ""}`} key={p.sku}>
      <label className={styles.product}><input type="checkbox" checked={p.selected} onChange={event => updateRow(p.sku, { selected: event.target.checked })} /><span><strong>{p.sku} · {p.name}</strong><small>{p.role} · {p.status}</small></span></label>
      <div className={styles.quantity}><label htmlFor={`qty-${p.sku}`}>{p.sku} quantity (pieces)</label><input id={`qty-${p.sku}`} type="number" inputMode="numeric" min="300" step="1" disabled={!p.selected} value={p.quantity} aria-describedby="programme-summary" onChange={event => updateRow(p.sku, { quantity: event.target.value })} /></div>
    </div>)}</fieldset>
    <div className={styles.summary} id="programme-summary" role="status" aria-live="polite">{brief.valid ? <><strong>{brief.styleCount} styles · {brief.totalPieces.toLocaleString("en-GB")} individual items</strong><span>These are item quantities, not a number of assembled kits. Specify kit levels and packing separately.</span></> : <strong>{brief.error}</strong>}</div>
    <p className={styles.rule}>MOQ 300 pieces per style. Samples and colour splits are assessed separately. The PDF includes sample checks and the information needed for quotation.</p>
    <div className={styles.actions}>{brief.valid ? <Link className={styles.primary} href={brief.href} prefetch={false}>Continue to project enquiry →</Link> : <button className={styles.primary} type="button" disabled>Continue to project enquiry →</button>}<a className={styles.secondary} href="/downloads/cappuccino-padel-club-sample-brief.pdf" download>Download selection & sample brief (PDF)</a></div>
    <p className={styles.sample}>Need a sample first? <Link href="/inquiry?product=Padel%20Bags&format=Padel%20club%20programme%20sample%20evaluation">Request a sample assessment</Link>.</p>
    <noscript><p>The product selector needs JavaScript. You can use the PDF brief or <Link href="/inquiry?product=Padel%20Bags">send a Padel project enquiry</Link>.</p></noscript>
  </section>;
}
