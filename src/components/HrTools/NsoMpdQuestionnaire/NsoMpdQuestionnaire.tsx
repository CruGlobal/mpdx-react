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
