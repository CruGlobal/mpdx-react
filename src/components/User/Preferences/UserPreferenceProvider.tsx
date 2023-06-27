import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useGetUserQuery } from '../GetUser.generated';
import i18next from 'src/lib/i18n';

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
  const { data: session } = useSession();
  const { data: user, loading } = useGetUserQuery({ skip: !session });
  const [locale, setLocale] = useState('en-US');

  useEffect(() => {
    if (user) {
      i18next.changeLanguage(user.user.preferences?.language ?? 'en');
      setLocale(user.user.preferences?.locale ?? 'en-US');
    }
  }, [user]);

  return (
    <UserPreferenceContext.Provider value={{ locale }}>
      {!loading && children}
    </UserPreferenceContext.Provider>
  );
};
