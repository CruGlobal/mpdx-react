declare global {
  interface Window {
    DD_RUM: {
      setUser: (user: Record<string, unknown>) => void;
      clearUser: () => void;
    };
  }
}

export const isDataDogConfigured = (): boolean => {
  if (typeof window === 'undefined') return false;
  return !!(
    process.env.DATADOG_CONFIGURED === 'true' &&
    window.DD_RUM?.hasOwnProperty('setUser')
  );
};

export interface SetDataDogUserProps {
  userId: string;
  name: string;
  email: string;
  accountListId: string;
  language: string;
}

export const setDataDogUser = ({
  userId,
  name,
  email,
  accountListId,
  language,
}: SetDataDogUserProps): void => {
  if (!isDataDogConfigured()) return;
  const rawAccountListIds = window.sessionStorage.getItem('accountListIds');
  const accountListIds = rawAccountListIds ? rawAccountListIds.split(',') : [];
  if (accountListId && !accountListIds.includes(accountListId)) {
    accountListIds.push(accountListId);
    window.sessionStorage.setItem('accountListIds', accountListIds.join(','));
  }
  window.DD_RUM.setUser({
    id: userId,
    name,
    email,
    accountListIds,
    language,
  });
};

export const clearDataDogUser = (): void => {
  if (!isDataDogConfigured()) return;
  window.DD_RUM.clearUser();
};
