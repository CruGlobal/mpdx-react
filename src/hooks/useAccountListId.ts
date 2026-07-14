import { useRouter } from 'next/router';
import { getQueryParam } from 'src/lib/queryParam';

/**
 * Read the accountListId from the route. Returns null until the router is
 * ready or when the current route has no accountListId param (e.g. the account
 * list chooser or the setup flow). Only use this on pages that may render
 * without an accountListId; everywhere else prefer useAccountListId.
 */
export const useOptionalAccountListId = (): string | null => {
  const router = useRouter();

  if (!router.isReady) {
    return null;
  }

  return getQueryParam(router.query, 'accountListId') ?? null;
};

/**
 * Read the accountListId from the route, throwing if it is missing. Use this on
 * pages nested under an [accountListId] route (all of which use
 * getServerSideProps, so the router is ready on the first render and the param
 * is always present). On pages that may render without an accountListId, use
 * useOptionalAccountListId instead.
 */
export const useAccountListId = (): string => {
  const accountListId = useOptionalAccountListId();

  if (!accountListId) {
    throw new Error(
      'useAccountListId was called on a route without an accountListId param. Use useOptionalAccountListId for pages that can render without one.',
    );
  }

  return accountListId;
};
