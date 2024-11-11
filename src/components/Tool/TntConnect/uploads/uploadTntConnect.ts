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

  return { success: true };
};

export const uploadTnt = async ({
  apiToken,
  selectedTags,
  override,
  file,
  t,
  accountListId,
}: {
  apiToken: string;
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
  form.append('data[type]', 'imports');
  form.append('data[attributes][override]', override);
  form.append('data[attributes][tag_list]', selectedTags.join(','));
  form.append('data[attributes][file]', file);

  const res = await fetch(
    `${process.env.REST_API_URL}account_lists/${accountListId}/imports/tnt`,
    {
      method: 'POST',
      headers: {
        authorization: `Bearer ${apiToken}`,
      },
      body: form,
    },
  ).catch(() => {
    throw new Error(t('Cannot upload file: network error'));
  });
  if (!res.ok) {
    throw new Error(t('Cannot upload file: server not successful'));
  }
};
