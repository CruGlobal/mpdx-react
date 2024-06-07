import React, { createContext, useContext, useEffect, useState } from 'react';
import i18next from 'src/lib/i18n';
import { useGetUserQuery } from '../GetUser.generated';

export type UserPreferenceType = {
  defaultCurrency?: string;
  locale: string;
  userId: string;
};

export const UserPreferenceContext = createContext<UserPreferenceType>({
  locale: 'en-US',
  userId: '',
});

export const useUserPreferenceContext = (): UserPreferenceType =>
  useContext(UserPreferenceContext);

interface Props {
  children?: React.ReactNode;
}
export const UserPreferenceProvider: React.FC<Props> = ({ children }) => {
  const { data } = useGetUserQuery();
  const [locale, setLocale] = useState('en-US');

  useEffect(() => {
    if (data) {
      i18next.changeLanguage(data.user.preferences?.language ?? 'en');
      setLocale(data.user.preferences?.locale ?? 'en-US');
    }
  }, [data]);

  return (
    <UserPreferenceContext.Provider
      value={{
        locale,
        userId: data?.user.id ?? '',
      }}
    >
      {children}
    </UserPreferenceContext.Provider>
  );
};
