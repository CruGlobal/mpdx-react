import React, { createContext, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useGetUserQuery } from '../GetUser.generated';

export type UserPreferenceType = {
  defaultCurrency?: string;
  locale: string;
};

export const UserPreferenceContext = createContext<UserPreferenceType>({
  locale: 'en-US',
});

export const useUserPreferenceContext = (): UserPreferenceType =>
  useContext(UserPreferenceContext);

interface Props {
  children?: React.ReactNode;
}
export const UserPreferenceProvider: React.FC<Props> = ({ children }) => {
  const { i18n } = useTranslation();
  const { data } = useGetUserQuery();
  const [locale, setLocale] = useState('en-US');

  useEffect(() => {
    if (data) {
      i18n.changeLanguage(data.user.preferences?.language ?? 'en');
      setLocale(data.user.preferences?.locale ?? 'en-US');
    }
  }, [data, i18n]);

  return (
    <UserPreferenceContext.Provider
      value={{
        locale,
      }}
    >
      {children}
    </UserPreferenceContext.Provider>
  );
};
