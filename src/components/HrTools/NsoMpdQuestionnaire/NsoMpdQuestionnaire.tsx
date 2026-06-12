import React from 'react';
import { FinancialInformation } from './FinancialInformation/FinancialInformation';
import { MinistryInformation } from './MinistryInformation/MinistryInformation';
import { NsoInformation } from './NsoInformation/NsoInformation';
import { NsoMpdQuestionnaireStepEnum } from './NsoMpdQuestionnaireHelper';
import { PersonalInformation } from './PersonalInformation/PersonalInformation';
import { useNsoMpdQuestionnaire } from './Shared/NsoMpdQuestionnaireContext';
import { Summary } from './Summary/Summary';

export const NsoMpdQuestionnaire: React.FC = () => {
  const { currentStep } = useNsoMpdQuestionnaire();

  switch (currentStep.step) {
    case NsoMpdQuestionnaireStepEnum.StepOne:
      return <PersonalInformation />;
    case NsoMpdQuestionnaireStepEnum.StepTwo:
      return <MinistryInformation />;
    case NsoMpdQuestionnaireStepEnum.StepThree:
      return <FinancialInformation />;
    case NsoMpdQuestionnaireStepEnum.StepFour:
      return <NsoInformation />;
    case NsoMpdQuestionnaireStepEnum.StepFive:
      return <Summary />;
  }
};
