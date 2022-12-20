import { useRouter } from 'next/router';
import { getRouterQueryParam } from 'src/utils/routerQueryParam';

export const useAppealId = (): string | undefined => {
  const router = useRouter();

  if (!router.isReady) {
    return undefined;
  }

  return getRouterQueryParam(router, 'appealId');
};
