import { NextApiRequest, NextApiResponse } from 'next';
import { getToken } from 'next-auth/jwt';
import makeSsrClient from 'src/lib/apollo/ssrClient';
import {
  GetDefaultAccountDocument,
  GetDefaultAccountQuery,
  GetDefaultAccountQueryVariables,
} from './getDefaultAccount.generated';

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET env var is not set');
}

export const returnRedirectUrl = async (req: NextApiRequest) => {
  const jwtToken = await getToken({
    req,
    secret: process.env.JWT_SECRET as string,
  });

  const path = req.query.path ?? '';

  if (jwtToken?.apiToken && jwtToken?.userID && req.query.auth !== 'true') {
    const ssrClient = makeSsrClient(jwtToken.apiToken);
    const response = await ssrClient.query<
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

    const url = new URL(`https://${process.env.REWRITE_DOMAIN}/handoff`);

    url.searchParams.append('accessToken', jwtToken.apiToken);
    url.searchParams.append('accountListId', defaultAccountID.toString());
    url.searchParams.append('userId', userId.toString());
    url.searchParams.append('path', path.toString());
    return url.href;
  } else if (jwtToken?.apiToken && req.query.auth === 'true') {
    const url = new URL(
      `https://auth.${process.env.REWRITE_DOMAIN}/${path
        .toString()
        .replace(/^\/+/, '')}`,
    );
    url.searchParams.append('access_token', jwtToken.apiToken);
    return url.href;
  } else {
    throw new Error('Something went wrong. jwtToken or auth are undefined');
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
