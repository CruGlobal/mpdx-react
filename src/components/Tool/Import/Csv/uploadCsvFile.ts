import { TFunction } from 'react-i18next';

export const uploadFile = async ({
  accountListId,
  file,
  t,
}: {
  accountListId: string;
  file: File;
  t: TFunction;
}): Promise<object> => {
  const errorMessage = t(
    'Invalid CSV file - See help docs or send us a message with your CSV attached',
  );
  const form = new FormData();
  form.append('accountListId', accountListId);
  form.append('file', file);
  const response = await fetch('/api/uploads/csv-upload', {
    method: 'POST',
    body: form,
  }).catch(() => {
    throw new Error(errorMessage);
  });
  const data = await response.json();
  if (!data.success) {
    throw new Error(errorMessage);
  } else {
    return data.data;
  }
};

//TODO: Refactor to use the API
export const getMaxFileSize = (): number => {
  return 150;
};
