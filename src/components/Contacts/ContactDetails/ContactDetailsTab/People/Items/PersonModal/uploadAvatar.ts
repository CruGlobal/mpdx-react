import { TFunction } from 'i18next';

export const validateAvatar = ({
  file,
  t,
}: {
  file: File;
  t: TFunction;
}): { success: true } | { success: false; message: string } => {
  if (!file.type.startsWith('image/')) {
    return {
      success: false,
      message: t('Cannot upload avatar: file must be an image'),
    };
  }
  if (file.type.includes('avif')) {
    return {
      success: false,
      message: t(
        'Cannot upload avatar: Unfortunately we do not support AVIF files.',
      ),
    };
  }
  // The /api/upload-person-avatar lambda appears to truncate the source body at 2^20 bytes
  // Conservatively set the limit at 1MB, which is a little lower than 1MiB because of the
  // overhead of encoding multipart/form-data and the other fields in the POST body
  if (file.size > 1_000_000) {
    return {
      success: false,
      message: t('Cannot upload avatar: file size cannot exceed 1MB'),
    };
  }

  return { success: true };
};

export const uploadAvatar = async ({
  personId,
  file,
  t,
}: {
  personId: string;
  file: File;
  t: TFunction;
}): Promise<void> => {
  const validationResult = validateAvatar({ file, t });
  if (!validationResult.success) {
    throw new Error(validationResult.message);
  }

  const form = new FormData();
  form.append('personId', personId);
  form.append('avatar', file);

  const res = await fetch(`/api/upload-person-avatar`, {
    method: 'POST',
    body: form,
  }).catch(() => {
    throw new Error(t('Cannot upload avatar: server error'));
  });
  const data: { success: boolean } = await res.json();
  if (!data.success) {
    throw new Error(t('Cannot upload avatar: server error'));
  }
};
