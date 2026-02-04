import { useTranslation } from 'react-i18next';

export const IneligiblePage: React.FC = () => {
  const { t } = useTranslation();

  return <h1>{t('Ineligible')}</h1>;
};
