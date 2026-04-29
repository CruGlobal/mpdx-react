import { useRouter } from 'next/router';
import { getQueryParam } from 'src/lib/queryParam';

export const useAppealId = (): string | undefined => {
  const router = useRouter();

  if (!router.isReady) {
    return undefined;
  }

  return getQueryParam(router.query, 'appealId');
};
