import React, {
  Dispatch,
  SetStateAction,
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';
import i18next from 'src/lib/i18n';
import { useGetUserQuery } from '../GetUser.generated';

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
  const { data } = useGetUserQuery();
  const [locale, setLocale] = useState('en-US');
  const [language, setLanguage] = useState('en');

  useEffect(() => {
    if (data) {
      setLanguage(data.user.preferences?.language ?? 'en');
      setLocale(data.user.preferences?.locale ?? 'en-US');
    }
  }, [data]);

  useEffect(() => {
    i18next.changeLanguage(language ?? 'en');
  }, [language]);

  return (
    <UserPreferenceContext.Provider value={{ locale, setLocale, setLanguage }}>
      {children}
    </UserPreferenceContext.Provider>
  );
};
