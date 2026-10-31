const paths = {
  concept: 'Concept development',
  'tech-pack': 'Tech Pack',
  clubs: 'Clubs / events procurement',
  reorder: 'Existing-customer reorder',
};

export const pdb001Colours = [
  ['charcoal-grey', 'Charcoal Grey'],
  ['sand-beige-blue', 'Sand Beige + Dusty Blue'],
  ['sage-green-cream', 'Sage Green + Cream'],
  ['dusty-rose-burgundy', 'Dusty Rose + Burgundy'],
  ['lavender-grey', 'Lavender + Soft Grey'],
  ['sky-blue-navy', 'Sky Blue + Navy'],
];

// Only catalog identifiers travel in the URL. Contact details and free text stay in the form.
export function briefEntryUrl({ path = 'concept', model, colour, category } = {}) {
  const params = new URLSearchParams();
  if (paths[path]) params.set('rfq', path);
  if (model === 'pdb001') {
    params.set('model', model);
    if (pdb001Colours.some(([key]) => key === colour)) params.set('colour', colour);
  }
  if (category === 'padel') params.set('category', category);
  return `/oem-odm-bag-manufacturer?${params}#project-brief`;
}

export function readBriefEntry(search) {
  const params = new URLSearchParams(search);
  const model = params.get('model') === 'pdb001';
  const colour = model && pdb001Colours.find(([key]) => key === params.get('colour'));
  return {
    brief_path: paths[params.get('rfq')] || '',
    product_needed: model || params.get('category') === 'padel' ? 'Padel Bags' : '',
    brief_product: model ? 'PDB001 Padel Work Tote Backpack' : '',
    brief_colour: colour ? `${colour[1]} — digital reference; swatch and sample approval required` : '',
  };
}

export function applyBriefEntry(form, search) {
  if (!form || form.dataset.entryApplied === 'true') return;
  const entry = readBriefEntry(search);
  for (const [name, value] of Object.entries(entry)) {
    if (!value) continue;
    const field = form.querySelector(`[name="${name}"]`);
    if (!field) continue;
    // Selects have defaults; free-text references may already contain the buyer's edits.
    if (field.tagName === 'SELECT' || !field.value) {
      field.value = value;
      field.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }
  form.dataset.entryApplied = 'true';
}
