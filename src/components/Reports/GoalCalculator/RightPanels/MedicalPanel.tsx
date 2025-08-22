import React from 'react';
import { Alert } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { RightPanel } from './RightPanel';

export const MedicalPanel: React.FC = () => {
  const { t } = useTranslation();

  return (
    <RightPanel title={t('Medical Expenses')}>
      <Alert severity="warning">
        {t(
          'Only include medical expenses that are not reimbursable through your staff account.',
        )}
      </Alert>
    </RightPanel>
  );
};
