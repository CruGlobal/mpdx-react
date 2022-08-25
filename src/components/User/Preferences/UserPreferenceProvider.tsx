import React, { createContext, ReactNode, useContext } from 'react';
import { useGetUserQuery } from '../GetUser.generated';
import i18next from 'src/lib/i18n';

export type UserPreferenceType = {
  defaultCurrency?: string;
};

export const UserPreferenceContext = createContext<UserPreferenceType>({});

export const useUserPreferenceContext = (): UserPreferenceType =>
  useContext(UserPreferenceContext);

export const UserPreferenceProvider: React.FC<ReactNode> = ({ children }) => {
  const { data: user, loading } = useGetUserQuery();

  if (!loading) {
    i18next.changeLanguage(user?.user.preferences?.locale ?? 'en');
  }

  return (
    <UserPreferenceContext.Provider value={{}}>
      {!loading && children}
    </UserPreferenceContext.Provider>
  );
};
