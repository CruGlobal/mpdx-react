import React from 'react';
import { Box, Divider } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { NsoMpdQuestionnaireStepEnum } from '../NsoMpdQuestionnaireHelper';
import { useNsoMpdQuestionnaire } from '../Shared/NsoMpdQuestionnaireContext';
import { StepPage } from '../Shared/StepPage';
import { SubStep } from '../Shared/SubStepList';
import { isStepComplete } from '../Shared/stepCompletion';
import { ContactInformation } from './ContactInformation';
import { Settings } from './Settings';
import { StaffInformation } from './StaffInformation';

export const PersonalInformation: React.FC = () => {
  const { t } = useTranslation();
  const { questionnaire } = useNsoMpdQuestionnaire();

  const subSteps: SubStep[] = [
    // Staff Information is a read-only review card with nothing to fill in.
    { id: 'staff-information', title: t('Staff Information'), complete: true },
    {
      id: 'contact-information',
      title: t('Contact Information'),
      complete: isStepComplete(
        NsoMpdQuestionnaireStepEnum.PersonalInformation,
        questionnaire,
      ),
    },
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
