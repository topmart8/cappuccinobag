/* Additive message adapter: submission, attribution and retry handling stay in script.js. */
(() => {
  const form = document.querySelector('[data-development-brief]');
  if (!form || form.dataset.briefReady) return;
  form.dataset.briefReady = 'true';
  const fields = [
    ['brief_path', 'RFQ path'], ['brief_design', 'Design status'],
    ['brief_positioning', 'Brand positioning'], ['brief_launch', 'Target launch date'],
    ['brief_reference', 'Prior order / sample reference'],
  ];
  form.addEventListener('formdata', ({ formData }) => {
    const brief = fields.map(([key, label]) => `${label}: ${formData.get(key) || 'To discuss'}`);
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
