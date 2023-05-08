import { useTranslation } from 'react-i18next';

export const useLanguage = (): string => {
  const { i18n } = useTranslation();
  return i18n.language || 'en-US';
};
