begin;

update storage.buckets
set public = false,
    file_size_limit = 8388608,
    allowed_mime_types = array[
      'image/jpeg', 'image/png', 'image/webp', 'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/postscript', 'application/illustrator', 'application/octet-stream',
      'application/dxf', 'image/vnd.dxf', 'image/vnd.adobe.photoshop',
      'application/x-photoshop', 'application/zip', 'application/x-zip-compressed'
    ]
where id = 'crm-attachments';

commit;
