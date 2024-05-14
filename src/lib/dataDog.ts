declare global {
  interface Window {
    DD_RUM: {
      setUser: (user: Record<string, unknown>) => void;
      clearUser: () => void;
    };
  }
}

export const isDataDogConfigured = (): boolean => {
  if (typeof window === 'undefined') {
    return false;
  }
  return !!(
    process.env.DATADOG_CONFIGURED === 'true' &&
    window.DD_RUM?.hasOwnProperty('setUser')
  );
};

export interface SetDataDogUserProps {
  userId: string;
  name: string;
  email: string;
  accountListId: string | null;
}

export const accountListIdsStorageKey = 'accountListIds';

export const setDataDogUser = ({
  userId,
  name,
  email,
  accountListId,
}: SetDataDogUserProps): void => {
  if (!isDataDogConfigured()) {
    return;
  }
  const rawAccountListIds = window.localStorage.getItem(
    accountListIdsStorageKey,
  );
  const accountListIds = rawAccountListIds ? rawAccountListIds.split(',') : [];
  if (accountListId && !accountListIds.includes(accountListId)) {
    accountListIds.push(accountListId);
    window.localStorage.setItem(
      accountListIdsStorageKey,
      accountListIds.join(','),
    );
  }
  window.DD_RUM.setUser({
    id: userId,
    name,
    email,
    accountListIds,
  });
};

export const clearDataDogUser = (): void => {
  if (!isDataDogConfigured()) {
    return;
  }
  window.DD_RUM.clearUser();
  window.localStorage.removeItem(accountListIdsStorageKey);
};
