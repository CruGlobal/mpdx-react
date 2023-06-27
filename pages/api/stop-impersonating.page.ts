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
    res.redirect(`${process.env.SITE_URL}/login`);
  } catch (err) {
    res.redirect(redirectUrl);
  }
};

export default mpdxWebHandoff;
