export const uploadAvatar = async ({
  personId,
  file,
}: {
  personId: string;
  file: File;
}): Promise<void> => {
  if (!file.type.startsWith('image/')) {
    throw new Error('Cannot upload avatar: file is not an image');
  }

  const form = new FormData();
  form.append('personId', personId);
  form.append('avatar', file);

  const res = await fetch(`/api/upload-person-avatar`, {
    method: 'POST',
    body: form,
  }).catch(() => {
    throw new Error('Cannot upload avatar: server error');
  });
  const data: { success: boolean } = await res.json();
  if (!data.success) {
    throw new Error('Cannot upload avatar: server error');
  }
};
