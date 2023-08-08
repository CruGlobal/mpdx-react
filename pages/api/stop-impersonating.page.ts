import { NextApiRequest, NextApiResponse } from 'next';
import { getToken } from 'next-auth/jwt';
import {
  cookieDefaultInfo,
  clearNextAuthSessionCookies,
} from './utils/cookies';
import { returnRedirectUrl } from './handoff.page';

const mpdxWebHandoff = async (
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<void> => {
  const redirectUrl = `${process.env.SITE_URL}/`;
  try {
    const jwtToken = (await getToken({
      req,
      secret: process.env.JWT_SECRET as string,
    })) as { impersonatorApiToken: string } | null;
    res.setHeader('Set-Cookie', [
      ...clearNextAuthSessionCookies,
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
