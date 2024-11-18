import { readFile } from 'fs/promises';
import { NextApiRequest, NextApiResponse } from 'next';
import formidable, { IncomingForm } from 'formidable';
import { getToken } from 'next-auth/jwt';
import fetch, { File, FormData } from 'node-fetch';

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
  try {
    if (req.method !== 'POST') {
      res.status(405).send('Method Not Found');
      return;
    }

    const jwt = await getToken({
      req,
      secret: process.env.JWT_SECRET,
    });
    const apiToken = jwt?.apiToken;
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

    const pictureId = crypto.randomUUID();
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
  } catch (err) {
    res.status(500).json({ success: false, error: err });
  }
};

export default uploadPersonAvatar;
