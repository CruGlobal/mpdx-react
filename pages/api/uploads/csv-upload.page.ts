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

//TODO: Extract this out to a service of some sort to share between these kinds of files
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

const uploadFile = async (
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<void> => {
  try {
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
      fields: { accountListId },
      files: { file },
    } = await parseBody(req);
    if (typeof accountListId !== 'string') {
      res.status(400).send('Missing accountListId');
      return;
    }
    if (!file || Array.isArray(file)) {
      res.status(400).send('Missing file');
      return;
    }

    const csvFile = new File(
      [await readFile(file.filepath)],
      file.originalFilename ?? 'csvFile',
    );

    const form = new FormData();
    form.append('data[type]', 'imports');
    form.append('data[attributes][file]', csvFile);

    const response = await fetch(
      `${process.env.REST_API_URL}account_lists/${accountListId}/imports/csv`,
      {
        headers: {
          authorization: `Bearer ${apiToken}`,
        },
        method: 'POST',
        body: form,
      },
    );
    const responseJson = (await response.json()) as object;
    res
      .status(response.status)
      .json({ ...responseJson, success: response.status === 201 });
  } catch (err) {
    res.status(500).json({ success: false, error: err });
  }
};

export default uploadFile;
