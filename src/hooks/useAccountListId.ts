import { useRouter } from 'next/router';

export const useAccountListId = (): string | undefined => {
  const { query, isReady } = useRouter();

  if (!isReady) {
    return undefined;
  }

  const { accountListId } = query;

  if (Array.isArray(accountListId)) {
    throw new Error('accountListId should not be an array');
  }

  return accountListId;
};
