import React from 'react';
import { Typography } from '@mui/material';
import { Trans, useTranslation } from 'react-i18next';
import { FourOhThreeBSection } from '../403bSection/403bSection';
import { MaxAllowableStep } from '../MaxAllowableSection/MaxAllowableSection';
import { PersonalInformationSection } from '../PersonalInformationSection/PersonalInformationSection';
import { RequestedSalarySection } from '../RequestedSalarySection/RequestedSalarySection';

export const YourInformationStep: React.FC = () => {
  const { t } = useTranslation();

  return (
    <>
      <Typography variant="h4">{t('Your Information')}</Typography>
      <Typography variant="body1">
        <Trans t={t}>
          Please review and update your information below. Click
          &quot;Continue&quot; to request your new salary.
        </Trans>
      </Typography>
      <PersonalInformationSection />
      <MaxAllowableStep />
      <FourOhThreeBSection />
      <RequestedSalarySection />
    </>
  );
};
