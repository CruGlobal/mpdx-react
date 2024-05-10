declare global {
  interface Window {
    DD_RUM: {
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
    window.DD_RUM?.hasOwnProperty('setUser')
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
  window.DD_RUM.setUser({
    id: accountListId,
    name,
    email,
    userId,
  });
};

export const clearDataDogUser = (): void => {
  if (!isDataDogConfigured()) {
    return;
  }
  window.DD_RUM.clearUser();
};
