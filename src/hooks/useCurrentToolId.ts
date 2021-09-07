import { useRouter } from 'next/router';

export const useCurrentToolId = (): string | undefined => {
  const router = useRouter();

  if (!router.pathname) {
    return undefined;
  }

  const pathsplit = router.pathname.split('/');

  return pathsplit[pathsplit.length - 2] === 'tools'
    ? pathsplit[pathsplit.length - 1]
    : '';
};
