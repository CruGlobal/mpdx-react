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

const uploadTntConnect = async (
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
      fields: { override, selectedTags, accountListId },
      files: { file },
    } = await parseBody(req);
    if (typeof override !== 'string') {
      res.status(400).send('Missing override');
      return;
    }
    if (!file || Array.isArray(file)) {
      res.status(400).send('Missing file');
      return;
    }

    const fileUpload = new File(
      [await readFile(file.filepath)],
      file.originalFilename ?? 'tntConnectUpload',
    );
    const form = new FormData();
    form.append('data[type]', 'imports');
    form.append('data[attributes][override]', override);
    form.append(
      'data[attributes][tag_list]',
      Array.isArray(selectedTags) ? selectedTags.join(',') : selectedTags,
    );
    form.append('data[attributes][file]', fileUpload);
    const fetchRes = await fetch(
      `${process.env.REST_API_URL}account_lists/${accountListId}/imports/tnt`,
      {
        method: 'POST',
        headers: {
          authorization: `Bearer ${apiToken}`,
        },
        body: form,
      },
    );
    res.status(fetchRes.status).json({ success: fetchRes.status === 201 });
  } catch (err) {
    res.status(500).json({ success: false, error: err });
  }
};

export default uploadTntConnect;
