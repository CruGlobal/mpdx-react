import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserTypeEnum } from 'src/graphql/types.generated';
import i18next from 'src/lib/i18n';
import { useGetUserQuery } from '../GetUser.generated';

export type UserPreferenceType = {
  defaultCurrency?: string;
  locale: string;
  userType?: UserTypeEnum;
  loading?: boolean;
};

export const UserPreferenceContext = createContext<UserPreferenceType>({
  locale: 'en-US',
  userType: undefined,
});

export const useUserPreferenceContext = (): UserPreferenceType =>
  useContext(UserPreferenceContext);

interface Props {
  children?: React.ReactNode;
}
export const UserPreferenceProvider: React.FC<Props> = ({ children }) => {
  const { data, loading } = useGetUserQuery();
  const [locale, setLocale] = useState('en-US');
  const userType = data?.user.userType;

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
        userType,
        loading,
      }}
    >
      {children}
    </UserPreferenceContext.Provider>
  );
};
