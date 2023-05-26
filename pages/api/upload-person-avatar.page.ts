import { readFile } from 'fs/promises';
import fetch, { File, FormData } from 'node-fetch';
import formidable, { IncomingForm } from 'formidable';
import { NextApiRequest, NextApiResponse } from 'next';
import { getToken } from 'next-auth/jwt';
import { v4 as uuidv4 } from 'uuid';

export const config = {
  api: {
    bodyParser: false,
  },
};

const parseBody = async (
  req: NextApiRequest,
): Promise<{ fields: formidable.Fields; files: formidable.Files }> => {
  return new Promise((resolve, reject) => {
    const form = new IncomingForm();
    form.parse(req, (err, fields, files) => {
      if (err) {
        reject(err);
      } else {
        resolve({ fields, files });
      }
    });
  });
};

const uploadPersonAvatar = async (
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<void> => {
  if (req.method !== 'POST') {
    res.status(405).send('Method Not Found');
    return;
  }

  const jwt = await getToken({
    req,
    secret: process.env.JWT_SECRET,
  });
  const apiToken = (jwt as { apiToken: string } | null)?.apiToken;
  if (!apiToken) {
    res.status(401).send('Unauthorized');
    return;
  }

  const {
    fields: { personId },
    files: { avatar },
  } = await parseBody(req);
  if (typeof personId !== 'string') {
    res.status(400).send('Missing personId');
    return;
  }
  if (!avatar || Array.isArray(avatar)) {
    res.status(400).send('Missing avatar');
    return;
  }

  const pictureId = uuidv4();
  const file = new File(
    [await readFile(avatar.filepath)],
    avatar.originalFilename ?? 'avatar',
  );

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

  const fetchRes = await fetch(
    `${process.env.REST_API_URL}contacts/people/${personId}`,
    {
      method: 'PUT',
      headers: {
        authorization: `Bearer ${apiToken}`,
      },
      body: form,
    },
  );
  res.status(fetchRes.status).json({ success: fetchRes.status === 200 });
};

export default uploadPersonAvatar;
