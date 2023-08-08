import { NextApiRequest, NextApiResponse } from 'next';
import { getToken } from 'next-auth/jwt';
import { cookieDefaultInfo, nextAuthSessionCookie } from './utils/cookies';
import { returnRedirectUrl } from './handoff.page';

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
    const handoffRedirectUrl = await returnRedirectUrl(req);
    res.redirect(handoffRedirectUrl);
  } catch (err) {
    res.redirect(redirectUrl);
  }
};

export default mpdxWebHandoff;
