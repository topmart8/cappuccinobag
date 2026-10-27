/* Additive message adapter: submission, attribution and retry handling stay in script.js. */
(() => {
  const form = document.querySelector('[data-development-brief]');
  if (!form || form.dataset.briefReady) return;
  form.dataset.briefReady = 'true';
  const fields = [
    ['brief_path', 'RFQ path'], ['brief_design', 'Design status'],
    ['brief_positioning', 'Brand positioning'], ['brief_launch', 'Target launch date'],
    ['brief_reference', 'Prior order / sample reference'],
    ['brief_event_mix', 'Club / event format and packaging mix'],
  ];
  const pathField = form.querySelector('[name="brief_path"]');
  const help = form.querySelector('[data-path-help]');
  const routing = {
    'Concept development': 'Start with your intended customer, reference direction and open questions. No drawings are required.',
    'Tech Pack': 'Share the specification version and optional files. Flag dimensions, materials or construction details that still need approval.',
    'Clubs / events procurement': 'Describe recipient groups, quantity per style, gift or team-bag combinations, packaging and required delivery date. Manufacturing and supplier coordination only.',
    'Existing-customer reorder': 'Provide a prior order or approved sample reference if available. We will recheck specification, materials, quantity and timing before confirmation.',
  };
  const updatePath = () => {
    if (!pathField || !help) return;
    help.textContent = routing[pathField.value] || routing['Concept development'];
    form.querySelectorAll('[data-rfq-path]').forEach((group) => {
      const visible = group.dataset.rfqPath === pathField.value;
      group.hidden = !visible;
      group.querySelectorAll('input, textarea').forEach((field) => { field.disabled = !visible; });
    });
  };
  pathField?.addEventListener('change', updatePath);
  form.addEventListener('reset', () => { setTimeout(updatePath, 0); });
  updatePath();
  form.addEventListener('formdata', ({ formData }) => {
    const brief = fields.map(([key, label]) => `${label}: ${formData.get(key) || 'To discuss'}`);
    brief.push(`Target cost: ${formData.get('target_price') || 'To discuss'}`);
    brief.push('Approval: inquiry only; design approval and sample fee authorization are separate.');
    brief.push(`Project details: ${formData.get('message') || 'To discuss'}`);
    formData.set('message', brief.join('\n'));
    fields.forEach(([key]) => formData.delete(key));
  });
  // Keep submission disabled until the existing handler has attached; never use native GET fallback.
  const enable = () => {
    if (form.dataset.inquiryInitialized !== 'true') return false;
    const button = form.querySelector('button[type="submit"]');
    button.disabled = false;
    button.textContent = 'Send My Project';
    return true;
  };
  if (!enable()) {
    const observer = new MutationObserver(() => { if (enable()) observer.disconnect(); });
    observer.observe(form, { attributes: true, attributeFilter: ['data-inquiry-initialized'] });
  }
})();
