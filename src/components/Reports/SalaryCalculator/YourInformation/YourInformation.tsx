import React from 'react';
import { Typography } from '@mui/material';
import { Stack } from '@mui/system';
import { Trans, useTranslation } from 'react-i18next';
import { FourOhThreeBSection } from '../403bSection/403bSection';
import { PersonalInformationSection } from '../PersonalInformationSection/PersonalInformationSection';
import { RequestedSalarySection } from '../RequestedSalarySection/RequestedSalarySection';

export const YourInformationStep: React.FC = () => {
  const { t } = useTranslation();

  return (
    <Stack gap={4} padding={4}>
      <Typography variant="h4">{t('Your Information')}</Typography>
      <Typography variant="body1">
        <Trans t={t}>
          Please review and update your information below. Click
          &quot;Continue&quot; to request your new salary.
        </Trans>
      </Typography>
      <PersonalInformationSection />
      <FourOhThreeBSection />
      <RequestedSalarySection />
    </Stack>
  );
};
