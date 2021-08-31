import { useRouter } from 'next/router';

export const useAppealId = (): string | undefined => {
  const { query, isReady } = useRouter();

  if (!isReady) {
    return undefined;
  }

  const { appealId } = query;

  if (Array.isArray(appealId)) {
    throw new Error('accountListId should not be an array');
  }

  return appealId;
};
