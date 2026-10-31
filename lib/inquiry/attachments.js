import { createHash } from 'node:crypto';
import { storageUpload } from '../crm/supabase.js';

const allowed = new Set(['application/pdf', 'image/jpeg', 'image/png', 'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/zip', 'application/x-zip-compressed']);
function invalid(message, status = 422) { return Object.assign(new Error(message), { status }); }

export function validateInquiryAttachments(files) {
  if (files.length > 5) throw invalid('Upload no more than 5 files.');
  if (files.reduce((sum, file) => sum + file.size, 0) > 4_000_000) throw invalid('Attachments must total 4 MB or less.', 413);
  if (files.some(file => !allowed.has(file.type))) throw invalid('Unsupported attachment type.');
}

export async function uploadInquiryAttachments(files, { submissionId }, store = storageUpload) {
  validateInquiryAttachments(files);
  if (!/^[0-9a-f-]{36}$/i.test(submissionId)) throw invalid('Invalid submission identity.');
  const uploaded = [];
  for (const [index, file] of files.entries()) {
    const bytes = Buffer.from(await file.arrayBuffer());
    // Stable, immutable object names avoid overwrites or duplicate objects on
    // concurrent/retried identical submissions. A changed file has a new hash.
    const digest = createHash('sha256').update(file.type).update(bytes).digest('hex');
    const path = `cappuccinobag/${submissionId}/${index}-${digest}`;
    await store(process.env.SUPABASE_STORAGE_BUCKET || 'crm-attachments', path, file, { contentAddressed: true });
    uploaded.push({ name: file.name.slice(0, 180), type: file.type, size: file.size, path, scan_status: 'pending' });
  }
  return uploaded;
}
