import React from 'react';
import { Alert } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { RightPanel } from './RightPanel';

export const SubUtilitiesPanel: React.FC = () => {
  const { t } = useTranslation();

  return (
    <RightPanel title={t('Internet and Mobile Expenses')}>
      <Alert severity="warning">
        {t('Only the portion not reimbursed as ministry expense.')}
      </Alert>
    </RightPanel>
  );
};
