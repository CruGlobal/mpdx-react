import { useTranslation } from 'react-i18next';

export const OverviewPage: React.FC = () => {
  const { t } = useTranslation();

  return <h1>{t('Overview')}</h1>;
};
