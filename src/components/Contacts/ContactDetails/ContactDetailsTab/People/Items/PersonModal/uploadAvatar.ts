import { v4 as uuidv4 } from 'uuid';

export const uploadAvatar = async ({
  token,
  personId,
  file,
}: {
  token: string;
  personId: string;
  file: File;
}): Promise<string> => {
  const pictureId = uuidv4();

  const form = new FormData();
  form.append('data[id]', personId);
  form.append('data[type]', 'people');
  form.append('data[attributes][overwrite]', 'true');
  form.append('data[relationships][pictures][data][][id]', pictureId);
  form.append('data[relationships][pictures][data][][type]', 'pictures');
  form.append('included[][id]', pictureId);
  form.append('included[][type]', 'pictures');
  form.append('included[][attributes][image]', file);
  form.append('included[][attributes][primary]', 'true');

  const res = await fetch(
    `${process.env.REST_API_URL}contacts/people/${personId}`,
    {
      method: 'PUT',
      headers: {
        authorization: `Bearer ${token}`,
      },
      body: form,
    },
  );
  const data = await res.json();
  const avatarUrl: string | undefined = data?.data?.attributes?.avatar;
  if (!avatarUrl) {
    throw new Error('Could not find avatar in response');
  }
  return avatarUrl;
};
