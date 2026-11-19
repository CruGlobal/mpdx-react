import type { RouteMatchCallbackOptions } from 'serwist';

const isMpdxApiHost = (hostname: string): boolean =>
  hostname.startsWith('api.') && hostname.endsWith('.mpdx.org');

// Every /api route (auth, GraphQL, uploads and so on), the API hosts,
// /_next/data (carries the session's apiToken) and page HTML must never be
// cached because they contain donor and financial data.
export const isNetworkOnly = ({
  url,
  request,
}: Pick<RouteMatchCallbackOptions, 'url'> & {
  request: Pick<Request, 'mode'>;
}): boolean => {
  if (request.mode === 'navigate') {
    return true;
  }
  if (isMpdxApiHost(url.hostname)) {
    return true;
  }
  const { pathname } = url;
  return (
    pathname === '/api' ||
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/data/')
  );
};
