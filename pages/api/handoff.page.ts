import { NextApiRequest, NextApiResponse } from 'next';
import { getToken } from 'next-auth/jwt';
import { ssrClient } from 'src/lib/client';
import {
  GetDefaultAccountQuery,
  GetDefaultAccountQueryVariables,
  GetDefaultAccountDocument,
} from './getDefaultAccount.generated';
import { reportError } from './utils/RollBar';

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
  })) as { apiToken: string; userID: string } | null;
  if (jwtToken && req.query.path && req.query.auth !== 'true') {
    const client = await ssrClient(jwtToken.apiToken);
    const response = await client.query<
      GetDefaultAccountQuery,
      GetDefaultAccountQueryVariables
    >({
      query: GetDefaultAccountDocument,
    });
    let defaultAccountID = req.query?.accountListId;
    if (!defaultAccountID) {
      const {
        data: { user, accountLists },
      } = response;
      defaultAccountID = user?.defaultAccountList || accountLists?.nodes[0]?.id;
    }
    const userId = req.query.userId || jwtToken.userID;
    const url = new URL(
      `https://${
        process.env.SITE_URL === 'https://next.mpdx.org' ? '' : 'stage.'
      }mpdx.org/handoff`,
    );

    url.searchParams.append('accessToken', jwtToken.apiToken);
    url.searchParams.append('accountListId', defaultAccountID.toString());
    url.searchParams.append('userId', userId.toString());
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
    reportError('Invalid jwtToken token or incorrect url queries.');
    res.status(422);
  }
};

export default handoff;
