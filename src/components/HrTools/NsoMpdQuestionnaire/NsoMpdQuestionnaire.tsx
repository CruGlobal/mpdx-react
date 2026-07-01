import React from 'react';
import { Box, CircularProgress } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { FinancialInformation } from './FinancialInformation/FinancialInformation';
import { MinistryInformation } from './MinistryInformation/MinistryInformation';
import { NsoInformation } from './NsoInformation/NsoInformation';
import { NsoMpdQuestionnaireStepEnum } from './NsoMpdQuestionnaireHelper';
import { PersonalInformation } from './PersonalInformation/PersonalInformation';
import { NoOpenQuestionnaire } from './Shared/NoOpenQuestionnaire';
import { useNsoMpdQuestionnaire } from './Shared/NsoMpdQuestionnaireContext';
import { Summary } from './Summary/Summary';

export const NsoMpdQuestionnaire: React.FC = () => {
  const { t } = useTranslation();
  const { currentStep, questionnaire, loading } = useNsoMpdQuestionnaire();

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" m={4}>
        <CircularProgress aria-label={t('Loading')} />
      </Box>
    );
  }

  if (!questionnaire) {
    return <NoOpenQuestionnaire />;
  }

  switch (currentStep.step) {
    case NsoMpdQuestionnaireStepEnum.PersonalInformation:
      return <PersonalInformation />;
    case NsoMpdQuestionnaireStepEnum.MinistryInformation:
      return <MinistryInformation />;
    case NsoMpdQuestionnaireStepEnum.FinancialInformation:
      return <FinancialInformation />;
    case NsoMpdQuestionnaireStepEnum.NsoInformation:
      return <NsoInformation />;
    case NsoMpdQuestionnaireStepEnum.Summary:
      return <Summary />;
  }
};
