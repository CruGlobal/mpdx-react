import { NextApiRequest, NextApiResponse } from 'next';
import { getToken } from 'next-auth/jwt';
import { taskFiltersTabs } from '../../src/utils/tasks/taskFilterTabs';

interface defineRedirectUrlProps {
  accountListId: string;
  path: string;
  rest: any;
}
const defineRedirectUrl = ({
  accountListId,
  path,
  rest,
}: defineRedirectUrlProps): string => {
  let redirectUrl = `${process.env.SITE_URL}/accountLists/${accountListId}`;
  if (path) redirectUrl += path;
  if (rest) {
    for (const [key, value] of Object.entries(rest)) {
      if (typeof value !== 'string') continue;
      const contactsAndReportsRegex = new RegExp('/contacts|/reports');
      if (contactsAndReportsRegex.test(path) && key === 'contactId') {
        if (redirectUrl.includes('?')) {
          redirectUrl = [
            redirectUrl.split('?')[0],
            `/${value}`,
            `?${redirectUrl.split('?')[1]}`,
          ].join('');
        } else redirectUrl += `/${value}`;
        continue;
      } else if (path.includes('/tasks') && key === 'group') {
        const typeDetails = taskFiltersTabs.find(
          (item) => item.name.toLowerCase() === value.toLowerCase(),
        );
        if (typeDetails) {
          if (!redirectUrl.includes('?')) redirectUrl += '?';
          redirectUrl += `filters=${encodeURIComponent(
            JSON.stringify(typeDetails.activeFiltersOptions),
          )}`;
          continue;
        }
      }
      if (!redirectUrl.includes('?')) redirectUrl += '?';
      redirectUrl += `${key}=${value}&`;
    }
  }
  return redirectUrl;
};

const mpdxWebHandoff = async (
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<void> => {
  try {
    const jwtToken = (await getToken({
      req,
      secret: process.env.JWT_SECRET as string,
    })) as { apiToken: string } | null;

    const { path = '', accountListId = '', ...rest } = req.query;
    if (!path || !accountListId) {
      throw new Error('Path and accountListId are not defined.');
    }
    const redirectUrl = defineRedirectUrl({
      accountListId: accountListId.toString(),
      path: path.toString(),
      rest,
    });
    if (!jwtToken) {
      const expireDate = new Date();
      expireDate.setTime(expireDate.getTime() + 5 * 60 * 1000);
      res.setHeader('Set-Cookie', [
        `mpdx-handoff.redirect-url=${redirectUrl}; HttpOnly; path=/; Expires=${expireDate.toUTCString()}`,
        `mpdx-handoff.logged-in=true; path=/; domain=${process.env.REWRITE_DOMAIN}`,
      ]);
      res.redirect(`${process.env.SITE_URL}/login`);
      return;
    }
    res.redirect(redirectUrl);
  } catch (err) {
    res.redirect(`${process.env.SITE_URL}/`);
  }
};

export default mpdxWebHandoff;
