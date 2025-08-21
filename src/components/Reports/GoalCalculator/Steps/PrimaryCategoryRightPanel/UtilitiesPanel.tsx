import React from 'react';
import { Alert } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { RightPanel } from './RightPanel';

export const UtilitiesPanel: React.FC = () => {
  const { t } = useTranslation();

  return (
    <RightPanel title={t('Utilities')}>
      <Alert severity="warning">
        {t(
          'For mobile phone and internet expenses, only include the portion not reimbursed as a ministry expense.',
        )}
      </Alert>
    </RightPanel>
  );
};
