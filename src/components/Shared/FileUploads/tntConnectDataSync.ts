import { TFunction } from 'i18next';

export const validateFile = ({
  file,
  t,
}: {
  file: File;
  t: TFunction;
}): { success: true } | { success: false; message: string } => {
  if (!file.name.endsWith('.tntmpd') || !file.name.endsWith('.tntdatasync')) {
    return {
      success: false,
      message: t(
        'Cannot upload file: file must be an .tntmpd or .tntdatasync file.',
      ),
    };
  }
  // TODO: NEED TO THINK THROUGH HOW WE'RE GOING TO UPLOAD 100MB FILE
  // The /api/upload-tnt-connect-data-sync lambda appears to truncate the source body at 2^20 bytes
  // Conservatively set the limit at 1MB (1,000,000 bytes), which is a little lower than 1MiB (1,048,576 bytes) because of the
  // overhead of encoding multipart/form-data and the other fields in the POST body
  if (file.size > 100_000_000) {
    return {
      success: false,
      message: t('Cannot upload file: file size cannot exceed 100MB'),
    };
  }

  return { success: true };
};

export const uploadFile = async ({
  organizationId,
  file,
  t,
}: {
  organizationId: string;
  file: File;
  t: TFunction;
}): Promise<void> => {
  const validationResult = validateFile({ file, t });
  if (!validationResult.success) {
    throw new Error(validationResult.message);
  }

  const form = new FormData();
  form.append('organizationId', organizationId);
  form.append('importFile', file);

  // TODO: endpoint isn't implemented yet
  const res = await fetch('/api/upload-tnt-connect-data-sync', {
    method: 'POST',
    body: form,
  }).catch(() => {
    throw new Error(t('Cannot upload file: server error'));
  });
  const data: { success: boolean } = await res.json();
  if (!data.success) {
    throw new Error(t('Cannot upload file: server error'));
  }
};
