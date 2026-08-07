declare global {
  interface Window {
    DD_RUM: {
      setUser: (user: Record<string, unknown>) => void;
      clearUser: () => void;
    };
  }
}

export const isDatadogConfigured = (): boolean => {
  if (typeof window === 'undefined') {
    return false;
  }
  return !!(
    process.env.DATADOG_CONFIGURED === 'true' &&
    window.DD_RUM?.hasOwnProperty('setUser')
  );
};

export interface SetDatadogUserProps {
  userId: string;
  name: string;
  email: string;
  accountListId: string | null;
  language: string;
}

export const accountListIdsStorageKey = 'accountListIds';

export const setDatadogUser = ({
  userId,
  name,
  email,
  accountListId,
  language,
}: SetDatadogUserProps): void => {
  if (!isDatadogConfigured()) {
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
    language,
  });
};

export const clearDatadogUser = (): void => {
  if (!isDatadogConfigured()) {
    return;
  }
  window.DD_RUM.clearUser();
  window.localStorage.removeItem(accountListIdsStorageKey);
};
