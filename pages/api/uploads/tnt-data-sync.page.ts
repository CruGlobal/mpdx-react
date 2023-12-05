import { readFile } from 'fs/promises';
import { NextApiRequest, NextApiResponse } from 'next';
import formidable, { IncomingForm } from 'formidable';
import { getToken } from 'next-auth/jwt';
import fetch, { File, FormData } from 'node-fetch';

export const config = {
  api: {
    bodyParser: false,
    responseLimit: '100MB',
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

const importTntDataSyncFile = async (
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
    const apiToken = (jwt as { apiToken: string } | null)?.apiToken;
    if (!apiToken) {
      res.status(401).send('Unauthorized');
      return;
    }

    const {
      fields: { accountListId, organizationId },
      files: { tntDataSync },
    } = await parseBody(req);

    if (typeof accountListId !== 'string') {
      res.status(400).send('Missing accountListId');
      return;
    }
    if (typeof organizationId !== 'string') {
      res.status(400).send('Missing organizationId');
      return;
    }
    if (!tntDataSync || Array.isArray(tntDataSync)) {
      res.status(400).send('Missing tnt data sync file');
      return;
    }

    const file = new File(
      [await readFile(tntDataSync.filepath)],
      tntDataSync.originalFilename ?? 'tntDataSync',
    );

    const form = new FormData();
    form.append('data[type]', 'imports');
    form.append('data[attributes][file]', file);
    form.append(
      'data[relationships][source_account][data][id]',
      organizationId,
    );
    form.append(
      'data[relationships][source_account][data][type]',
      'organization_accounts',
    );

    const fetchRes = await fetch(
      `${process.env.REST_API_URL}account_lists/${accountListId}/imports/tnt_data_sync`,
      {
        method: 'POST',
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

export default importTntDataSyncFile;
