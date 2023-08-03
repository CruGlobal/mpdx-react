import { NextApiRequest, NextApiResponse } from 'next';
import { getToken } from 'next-auth/jwt';
import { cookieDefaultInfo, nextAuthSessionCookie } from './utils/cookies';

const redirectUrl = `${process.env.SITE_URL}/`;
const mpdxWebHandoff = async (
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<void> => {
  try {
    const jwtToken = (await getToken({
      req,
      secret: process.env.JWT_SECRET as string,
    })) as { impersonatorApiToken: string } | null;
    res.setHeader('Set-Cookie', [
      nextAuthSessionCookie,
      `mpdx-handoff.redirect-url=${redirectUrl}; ${cookieDefaultInfo}`,
      `mpdx-handoff.token=${jwtToken?.impersonatorApiToken}; ${cookieDefaultInfo}`,
    ]);
    res.status(200).send({
      status: 'success',
    });
  } catch (err) {
    res.status(201).send({
      status: 'failed',
    });
  }
};

export default mpdxWebHandoff;
