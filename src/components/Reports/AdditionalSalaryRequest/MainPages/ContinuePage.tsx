import { useTranslation } from 'react-i18next';

export const ContinuePage: React.FC = () => {
  const { t } = useTranslation();

  return <h1>{t('Continue')}</h1>;
};
