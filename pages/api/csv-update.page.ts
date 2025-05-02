import { NextApiRequest, NextApiResponse } from 'next';
import formidable, { IncomingForm } from 'formidable';
import { getToken } from 'next-auth/jwt';
import fetch from 'node-fetch';
import createPatch from 'src/lib/createPatch';
import { camelToSnakeObject } from 'src/lib/snakeToCamel';

export const config = {
  api: {
    bodyParser: false,
  },
};

//TODO: Extract this out to a service of some sort to share between these kinds of files
const parseBody = async (
  req: NextApiRequest,
): Promise<{ fields: formidable.Fields }> => {
  return new Promise((resolve, reject) => {
    const form = new IncomingForm();
    form.parse(req, (err, fields) => {
      if (err) {
        reject(err);
      } else {
        resolve({ fields });
      }
    });
  });
};

const buildRequestBody = (csvFileId, initialData, patchedData): string => {
  const patch = createPatch(
    camelToSnakeObject(JSON.parse(initialData)),
    camelToSnakeObject(JSON.parse(patchedData)),
  );

  const body = {
    data: {
      type: 'imports',
      id: csvFileId,
      attributes: {
        overwrite: true,
      },
      relationships: {},
    },
  };
  if (patch['file_headers_mappings']) {
    body.data.attributes['file_headers_mappings'] = patch.file_headers_mappings;
  }
  if (patch['file_constants_mappings']) {
    body.data.attributes['file_constants_mappings'] =
      patch.file_constants_mappings;
  }
  if (patch['sample_contacts']) {
    body.data.relationships['sample_contacts'] = {
      data: patch.sample_contacts,
    };
  }
  if (patch.tag_list) {
    body.data.attributes['tag_list'] = patch.tag_list;
  }
  body.data.attributes['in_preview'] = patch.in_preview;

  return JSON.stringify(body);
};

const updateCsvData = async (
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

    const { fields } = await parseBody(req);
    const accountListId = fields.accountListId?.[0];
    const csvFileId = fields.csvFileId?.[0];
    const initialData = fields.initialData?.[0];
    const patchedData = fields.patchedData?.[0];
    const include = fields.include?.[0];
    if (typeof accountListId !== 'string') {
      res.status(400).send('Missing accountListId');
      return;
    }
    if (typeof csvFileId !== 'string') {
      res.status(400).send('Missing csvFileId');
      return;
    }
    if (typeof initialData !== 'string') {
      res.status(400).send('Missing initialData');
      return;
    }
    if (typeof patchedData !== 'string') {
      res.status(400).send('Missing patchedData');
      return;
    }

    const response = await fetch(
      `${
        process.env.REST_API_URL
      }account_lists/${accountListId}/imports/csv/${csvFileId}${
        include ? '?include=' + include : ''
      }`,
      {
        headers: {
          authorization: `Bearer ${apiToken}`,
          'Content-Type': 'application/vnd.api+json',
        },
        method: 'PUT',
        body: buildRequestBody(csvFileId, initialData, patchedData),
      },
    );
    const responseJson = (await response.json()) as object;
    res
      .status(response.status)
      .json({ ...responseJson, success: response.status === 200 });
  } catch (err) {
    res.status(500).json({ success: false, error: err });
  }
};

export default updateCsvData;
