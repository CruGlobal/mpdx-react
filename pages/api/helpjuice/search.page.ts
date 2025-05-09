import { NextApiRequest, NextApiResponse } from 'next';
import fetch from 'node-fetch';

const proxySearchParent = async (
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<void> => {
  try {
    const searchTerm = req.query.query;

    const parentCategory = process.env.HELPJUICE_PARENT_CATEGORY
      ? `&parent_category=${process.env.HELPJUICE_PARENT_CATEGORY}`
      : '';
    const helpjuiceUrl = `${process.env.HELPJUICE_ORIGIN}/search?query=${searchTerm}${parentCategory}`;

    const response = await fetch(helpjuiceUrl);
    const responseJson = (await response.json()) as object;
    res.status(response.status).json(responseJson);
  } catch (err) {
    res.status(500).json({ success: false, error: err });
  }
};

export default proxySearchParent;
