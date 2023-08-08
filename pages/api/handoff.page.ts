import { NextApiRequest, NextApiResponse } from 'next';
import { getToken } from 'next-auth/jwt';
import { ssrClient } from 'src/lib/client';
import {
  GetDefaultAccountQuery,
  GetDefaultAccountQueryVariables,
  GetDefaultAccountDocument,
} from './getDefaultAccount.generated';

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET env var is not set');
}

export const returnRedirectUrl = async (req: NextApiRequest) => {
  try {
    const jwtToken = (await getToken({
      req,
      secret: process.env.JWT_SECRET as string,
    })) as { apiToken: string; userID: string } | null;

    const path = req.query.path ?? '';

    if (jwtToken && req.query.auth !== 'true') {
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
        defaultAccountID =
          user?.defaultAccountList || accountLists?.nodes[0]?.id;
      }
      const userId = req.query.userId || jwtToken.userID;

      const url = new URL(
        process.env.NODE_ENV === 'production'
          ? `https://${process.env.REWRITE_DOMAIN}/handoff`
          : `https://stage.${process.env.REWRITE_DOMAIN}/handoff`,
      );

      url.searchParams.append('accessToken', jwtToken.apiToken);
      url.searchParams.append('accountListId', defaultAccountID.toString());
      url.searchParams.append('userId', userId.toString());
      url.searchParams.append('path', path.toString());
      return url.href;
    } else if (jwtToken && req.query.auth === 'true') {
      const url = new URL(
        process.env.NODE_ENV === 'production'
          ? `https://auth.${process.env.REWRITE_DOMAIN}/${path
              .toString()
              .replace(/^\/+/, '')}`
          : `https://auth.stage.${process.env.REWRITE_DOMAIN}/${path
              .toString()
              .replace(/^\/+/, '')}`,
      );
      url.searchParams.append('access_token', jwtToken.apiToken);
      return url.href;
    } else {
      throw new Error('Something went wrong. jwtToken or auth are undefined');
    }
  } catch (error) {
    throw new Error((error as Error).message);
  }
};

const handoff = async (
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<void> => {
  try {
    const redirectUrl = await returnRedirectUrl(req);
    res.redirect(redirectUrl);
  } catch (err) {
    res.redirect('/');
  }
};

export default handoff;
