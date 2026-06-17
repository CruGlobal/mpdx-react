import React from 'react';
import { Box, Divider } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { StepPage } from '../Shared/StepPage';
import { SubStep } from '../Shared/SubStepList';
import { ContactInformation } from './ContactInformation';
import { Settings } from './Settings';
import { StaffInformation } from './StaffInformation';

export const PersonalInformation: React.FC = () => {
  const { t } = useTranslation();

  const subSteps: SubStep[] = [
    { id: 'staff-information', title: t('Staff Information') },
    { id: 'contact-information', title: t('Contact Information') },
  ];

  return (
    <StepPage subSteps={subSteps}>
      <Box mx={4} my={2}>
        <Settings />
        <Divider sx={{ mx: -4, my: 4 }} />
        <StaffInformation />
        <Divider sx={{ mx: -4, my: 4 }} />
        <ContactInformation />
      </Box>
    </StepPage>
  );
};
