import { NextApiRequest, NextApiResponse } from 'next';
import { getToken } from 'next-auth/jwt';

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET env var is not set');
}

const getTokenForFrontend = async (
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<void> => {
  try {
    const jwtToken = (await getToken({
      req,
      secret: process.env.JWT_SECRET as string,
    })) as { apiToken: string; userID: string } | null;

    if (!jwtToken?.apiToken) {
      throw new Error('Unable to fetch token.');
    }
    res.status(200).send({
      apiToken: jwtToken.apiToken,
    });
  } catch {
    res.status(201).send({
      apiToken: '',
    });
  }
};

export default getTokenForFrontend;
