import { NextApiRequest, NextApiResponse } from 'next';
import { clearNextAuthSessionCookies } from './utils/cookies';

const stopImpersonating = async (
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<void> => {
  res.setHeader('Set-Cookie', clearNextAuthSessionCookies);
  res.redirect('/');
};

export default stopImpersonating;
