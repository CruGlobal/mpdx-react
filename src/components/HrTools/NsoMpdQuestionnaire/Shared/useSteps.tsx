import { useMemo } from 'react';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import ChurchIcon from '@mui/icons-material/Church';
import HotelIcon from '@mui/icons-material/Hotel';
import PersonIcon from '@mui/icons-material/Person';
import RequestQuoteIcon from '@mui/icons-material/RequestQuote';
import { useTranslation } from 'react-i18next';
import { NsoMpdQuestionnaireStepEnum } from '../NsoMpdQuestionnaireHelper';

export interface NsoMpdQuestionnaireStep {
  step: NsoMpdQuestionnaireStepEnum;
  title: string;
  icon: JSX.Element;
}

export const useSteps = (): NsoMpdQuestionnaireStep[] => {
  const { t } = useTranslation();

  const steps = useMemo(
    () => [
      {
        step: NsoMpdQuestionnaireStepEnum.StepOne,
        title: t('Questionnaire Step 1'),
        icon: <PersonIcon />,
      },
      {
        step: NsoMpdQuestionnaireStepEnum.StepTwo,
        title: t('Questionnaire Step 2'),
        icon: <ChurchIcon />,
      },
      {
        step: NsoMpdQuestionnaireStepEnum.StepThree,
        title: t('Questionnaire Step 3'),
        icon: <AccountBalanceIcon />,
      },
      {
        step: NsoMpdQuestionnaireStepEnum.StepFour,
        title: t('Questionnaire Step 4'),
        icon: <HotelIcon />,
      },
      {
        step: NsoMpdQuestionnaireStepEnum.StepFive,
        title: t('Summary'),
        icon: <RequestQuoteIcon />,
      },
    ],
    [t],
  );

  return steps;
};
