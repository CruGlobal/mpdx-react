import React from 'react';
import { Alert } from '@mui/material';
import { Trans, useTranslation } from 'react-i18next';
import { RightPanel } from './RightPanel';

export const UsStaffConferencePanel: React.FC = () => {
  const { t } = useTranslation();

  return (
    <RightPanel title={t('U.S. Staff Conference')}>
      <Alert severity="info">
        <Trans i18nKey="usStaffConferenceInfo">
          What are your total expenses for the last staff conference? Divide
          that by 36 to get your monthly needs. We encourage you to set up a
          regular monthly deposit for this amount from your staff account to
          your Conference.
        </Trans>
      </Alert>
    </RightPanel>
  );
};
