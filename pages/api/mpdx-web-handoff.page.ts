import { NextApiRequest, NextApiResponse } from 'next';
import { getToken } from 'next-auth/jwt';
import { taskFiltersTabs } from 'src/utils/tasks/taskFilterTabs';
import {
  clearNextAuthSessionCookies,
  cookieDefaultInfo,
} from './utils/cookies';

interface DefineRedirectUrlProps {
  accountListId: string;
  path: string;
  rest: any;
}

const defineRedirectUrl = ({
  accountListId,
  path,
  rest,
}: DefineRedirectUrlProps): string => {
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
    const jwtToken = await getToken({
      req,
      secret: process.env.JWT_SECRET as string,
    });

    const {
      path = '',
      accountListId = '',
      userId = '',
      token = '',
      impersonate = '',
      ...rest
    } = req.query;
    if (!path || !accountListId) {
      throw new Error('Path and accountListId are not defined.');
    }

    const isAccountConflict = !!(
      userId &&
      jwtToken &&
      userId !== jwtToken?.userID
    );

    const redirectUrl = defineRedirectUrl({
      accountListId: accountListId.toString(),
      path: path.toString(),
      rest,
    });

    const cookies: string[] = [];
    if (isAccountConflict) {
      // We can force the user to logout, but OKTA caches and will auto log the previous user in.
      // To solve this problem we store the JWT as a HTTP cookie which we use on login in [...nextauth].page.ts
      cookies.push(
        ...clearNextAuthSessionCookies,
        `mpdx-handoff.accountConflictUserId=${userId}; ${cookieDefaultInfo}`,
        `mpdx-handoff.redirect-url=${redirectUrl}; ${cookieDefaultInfo}`,
        `mpdx-handoff.token=${token}; ${cookieDefaultInfo}`,
      );
    }
    if (impersonate) {
      cookies.push(
        `mpdx-handoff.impersonate=${impersonate}; ${cookieDefaultInfo}`,
        `mpdx-handoff.redirect-url=${redirectUrl}; ${cookieDefaultInfo}`,
        `mpdx-handoff.token=${token}; ${cookieDefaultInfo}`,
      );
    }
    if (!jwtToken) {
      cookies.push(
        `mpdx-handoff.redirect-url=${redirectUrl}; ${cookieDefaultInfo}`,
        `mpdx-handoff.logged-in=true; path=/; domain=${process.env.REWRITE_DOMAIN}`,
      );
    }
    // Removes duplicates and set cookies
    if (cookies) res.setHeader('Set-Cookie', [...new Set(cookies)]);
    res.redirect(jwtToken ? redirectUrl : `${process.env.SITE_URL}/login`);
  } catch (err) {
    res.redirect(`${process.env.SITE_URL}/`);
  }
};

export default mpdxWebHandoff;
