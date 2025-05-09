import { NextApiRequest, NextApiResponse } from 'next';
import fetch from 'node-fetch';

const buildUrlPath = (originalPath?: string | string[]) => {
  if (!originalPath) {
    return originalPath;
  }
  return Array.isArray(originalPath)
    ? originalPath.join('/')
    : originalPath.split(',').join('/');
};

const proxyCatchAll = async (
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<void> => {
  try {
    const { path, ...allQueryParams } = req.query;
    delete allQueryParams.path;

    const helpjuiceUrl = new URL(
      `${process.env.HELPJUICE_ORIGIN}/${buildUrlPath(path)}`,
    );

    Object.entries(allQueryParams).forEach(([key, value]) => {
      const queryParamValue = Array.isArray(value) ? value.join(',') : value;
      helpjuiceUrl.searchParams.append(key, queryParamValue ?? '');
    });

    const response = await fetch(helpjuiceUrl);
    const responseJson = (await response.json()) as object;
    res.status(response.status).json(responseJson);
  } catch (err) {
    res.status(500).json({ success: false, error: err });
  }
};

export default proxyCatchAll;
