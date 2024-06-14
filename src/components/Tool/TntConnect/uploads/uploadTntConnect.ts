import { TFunction } from 'react-i18next';

export const validateTnt = ({
  file,
  t,
}: {
  file: File;
  t: TFunction;
}): { success: true } | { success: false; message: string } => {
  if (!file.type.includes('xml')) {
    return {
      success: false,
      message: t('Cannot upload file: file must be a xml file'),
    };
  }
  // The /api lambda appears to truncate the source body at 2^20 bytes
  // Conservatively set the limit at 1MB, which is a little lower than 1MiB because of the
  // overhead of encoding multipart/form-data and the other fields in the POST body
  if (file.size > 1_000_000) {
    return {
      success: false,
      message: t('Cannot upload file: file size cannot exceed 1MB'),
    };
  }

  return { success: true };
};

export const uploadTnt = async ({
  selectedTags,
  override,
  file,
  t,
  accountListId,
}: {
  selectedTags: string[];
  override: string;
  file: File;
  t: TFunction;
  accountListId: string;
}): Promise<void> => {
  const validationResult = validateTnt({ file, t });
  if (!validationResult.success) {
    throw new Error(validationResult.message);
  }

  const form = new FormData();
  form.append('override', override);
  form.append('tag_list', selectedTags.join(','));
  form.append('file', file);
  form.append('accountListId', accountListId);

  const res = await fetch(`/api/uploads/upload-tnt-connect-import`, {
    method: 'POST',
    body: form,
  }).catch((err) => {
    throw new Error(t('Cannot upload file: server error') + err);
  });
  const data: { success: boolean } = await res.json();
  if (!data.success) {
    throw new Error(t('Cannot upload file: server not successful') + data);
  }
};
