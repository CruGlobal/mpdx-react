declare global {
  interface Window {
    DD_RUM: {
      getUser: () => Record<string, string> | undefined;
      setUser: (user: Record<string, string>) => void;
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
    window.DD_RUM?.hasOwnProperty('getUser')
  );
};

export interface SetDataDogUserProps {
  userId: string;
  name: string;
  email: string;
  accountListId: string;
}

export const setDataDogUser = ({
  userId,
  name,
  email,
  accountListId,
}: SetDataDogUserProps): void => {
  if (!isDataDogConfigured()) {
    return;
  }
  if (
    window.DD_RUM.getUser()?.accountListId &&
    window.DD_RUM.getUser()?.accountListId === accountListId
  ) {
    return;
  }
  if (window.DD_RUM.getUser()?.accountListId !== accountListId) {
    clearDataDogUser();
  }
  window.DD_RUM.setUser({
    id: accountListId,
    name,
    email,
    userId: userId,
  });
};

export const clearDataDogUser = (): void => {
  if (!isDataDogConfigured()) {
    return;
  }
  window.DD_RUM.clearUser();
};
