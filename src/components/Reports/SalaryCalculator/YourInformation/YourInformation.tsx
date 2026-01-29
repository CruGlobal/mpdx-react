import React from 'react';
import { Typography } from '@mui/material';
import { Trans, useTranslation } from 'react-i18next';
import { FourOhThreeBSection } from '../403bSection/403bSection';
import { MaxAllowableStep } from './MaxAllowableSection/MaxAllowableSection';
import { MhaRequestSection } from './MhaRequestSection/MhaRequestSection';
import { useMhaRequestData } from './MhaRequestSection/useMhaRequestData';
import { PersonalInformationSection } from './PersonalInformationSection/PersonalInformationSection';

export const YourInformationStep: React.FC = () => {
  const { t } = useTranslation();
  const { showMhaSection } = useMhaRequestData();

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
      {showMhaSection && <MhaRequestSection />}
    </>
  );
};
