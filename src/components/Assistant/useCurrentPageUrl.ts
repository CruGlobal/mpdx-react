import { useRouter } from 'next/router';

// location.href misses client-side route changes, so build the URL from the router
export const useCurrentPageUrl = (): string => {
  const { asPath } = useRouter();
  return typeof window === 'undefined'
    ? asPath
    : new URL(asPath, window.location.origin).toString();
};
