import React, { createContext, useContext, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useGetUserQuery } from '../GetUser.generated';
import i18next from 'src/lib/i18n';

export type UserPreferenceType = {
  defaultCurrency?: string;
};

export const UserPreferenceContext = createContext<UserPreferenceType>({});

export const useUserPreferenceContext = (): UserPreferenceType =>
  useContext(UserPreferenceContext);

interface Props {
  children?: React.ReactNode;
}
export const UserPreferenceProvider: React.FC<Props> = ({ children }) => {
  const { data: session } = useSession();
  const { data: user, loading } = useGetUserQuery({ skip: !session });

  useEffect(() => {
    if (!loading) {
      i18next.changeLanguage(user?.user.preferences?.locale ?? 'en');
    }
  }, [loading]);

  return (
    <UserPreferenceContext.Provider value={{}}>
      {!loading && children}
    </UserPreferenceContext.Provider>
  );
};
