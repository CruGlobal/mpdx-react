import { NextApiRequest, NextApiResponse } from 'next';

const proxyPopularQuestions = async (
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<void> => {
  try {
    const categoryId = process.env.HELPJUICE_CATEGORY_ID
      ? `?category_id=${process.env.HELPJUICE_CATEGORY_ID}`
      : '';
    const helpjuiceUrl = `${process.env.HELPJUICE_ORIGIN}/api/questions/popular${categoryId}`;

    const response = await fetch(helpjuiceUrl);
    const responseJson = (await response.json()) as object;
    res.status(response.status).json(responseJson);
  } catch (err) {
    res.status(500).json({ success: false, error: err });
  }
};

export default proxyPopularQuestions;
