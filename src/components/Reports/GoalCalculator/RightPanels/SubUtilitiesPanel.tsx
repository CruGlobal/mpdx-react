import React from 'react';
import { Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { RightPanel } from './RightPanel';

export const SubUtilitiesPanel: React.FC = () => {
  const { t } = useTranslation();

  return (
    <RightPanel title={t('Internet and Mobile Expenses')}>
      <Typography>
        {t('Only the portion not reimbursed as ministry expense.')}
      </Typography>
    </RightPanel>
  );
};
