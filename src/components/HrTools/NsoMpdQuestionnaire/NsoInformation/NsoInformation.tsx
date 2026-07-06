import React from 'react';
import { Box, Stack, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { NsoMpdQuestionnaireStepEnum } from '../NsoMpdQuestionnaireHelper';
import { useNsoMpdQuestionnaire } from '../Shared/NsoMpdQuestionnaireContext';
import { StepPage } from '../Shared/StepPage';
import { SubStep } from '../Shared/SubStepList';
import { isStepComplete } from '../Shared/stepCompletion';
import { NsoDetails } from './NsoDetails';

export const NsoInformation: React.FC = () => {
  const { t } = useTranslation();
  const { questionnaire } = useNsoMpdQuestionnaire();

  const subSteps: SubStep[] = [
    {
      id: 'nso-information',
      title: t('NSO Information'),
      complete: isStepComplete(
        NsoMpdQuestionnaireStepEnum.NsoInformation,
        questionnaire,
      ),
    },
  ];

  return (
    <StepPage subSteps={subSteps}>
      <Box mx={4} my={2}>
        <Stack spacing={2}>
          <Typography variant="h6">{t('NSO Information')}</Typography>
          <Typography variant="body1">
            {t(
              'Tell us about your lodging while attending New Staff Orientation.',
            )}
          </Typography>
          <NsoDetails />
        </Stack>
      </Box>
    </StepPage>
  );
};
