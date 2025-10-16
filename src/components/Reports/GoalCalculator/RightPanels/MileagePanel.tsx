import React from 'react';
import { useTranslation } from 'react-i18next';
import { RightPanel } from './RightPanel';

export const MileagePanel: React.FC = () => {
  const { t } = useTranslation();

  return <RightPanel title={t('Mileage Expenses')} />;
};
