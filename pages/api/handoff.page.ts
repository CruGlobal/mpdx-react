import { NextApiRequest, NextApiResponse } from 'next';
import { getToken } from 'next-auth/jwt';

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET env var is not set');
}

const handoff = async (
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<void> => {
  const jwtToken = (await getToken({
    req,
    secret: process.env.JWT_SECRET as string,
  })) as { apiToken: string } | null;
  if (
    jwtToken &&
    req.query.accountListId &&
    req.query.userId &&
    req.query.path &&
    req.query.auth !== 'true'
  ) {
    const url = new URL(
      `https://${
        process.env.SITE_URL === 'https://next.mpdx.org' ? '' : 'stage.'
      }mpdx.org/handoff`,
    );

    url.searchParams.append('accessToken', jwtToken.apiToken);
    url.searchParams.append(
      'accountListId',
      req.query.accountListId.toString(),
    );
    url.searchParams.append('userId', req.query.userId.toString());
    url.searchParams.append('path', req.query.path.toString());
    res.redirect(url.href);
  } else if (jwtToken && req.query.path && req.query.auth === 'true') {
    const url = new URL(
      `https://auth.${
        process.env.SITE_URL === 'https://next.mpdx.org' ? '' : 'stage.'
      }mpdx.org/${req.query.path.toString().replace(/^\/+/, '')}`,
    );

    url.searchParams.append('access_token', jwtToken.apiToken);
    res.redirect(url.href);
  } else {
    res.status(422);
  }
};

export default handoff;
