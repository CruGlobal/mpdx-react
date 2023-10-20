import React, {
  createContext,
  Dispatch,
  SetStateAction,
  useContext,
  useEffect,
  useState,
} from 'react';
import { useSession } from 'next-auth/react';
import { useGetUserQuery } from '../GetUser.generated';
import i18next from 'src/lib/i18n';

export type UserPreferenceType = {
  defaultCurrency?: string;
  locale: string;
  setLocale: Dispatch<SetStateAction<string>>;
  setLanguage: Dispatch<SetStateAction<string>>;
};

export const UserPreferenceContext = createContext<UserPreferenceType>({
  locale: 'en-US',
  setLocale: () => '',
  setLanguage: () => '',
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
  const [language, setLanguage] = useState('en');

  useEffect(() => {
    if (user) {
      setLanguage(user.user.preferences?.language ?? 'en');
      setLocale(user.user.preferences?.locale ?? 'en-US');
    }
  }, [user]);

  useEffect(() => {
    //console.log('useEffect, language', language);
    //console.log('resolvedLanguage', i18next.resolvedLanguage);
    i18next.changeLanguage(language ?? 'en');
    //console.log('resolvedLanguage later', i18next.resolvedLanguage);
  }, [language]);

  return (
    <UserPreferenceContext.Provider value={{ locale, setLocale, setLanguage }}>
      {!loading && children}
    </UserPreferenceContext.Provider>
  );
};
