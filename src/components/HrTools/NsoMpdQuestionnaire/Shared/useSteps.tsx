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
        step: NsoMpdQuestionnaireStepEnum.PersonalInformation,
        title: t('Questionnaire Step 1'),
        icon: <PersonIcon />,
      },
      {
        step: NsoMpdQuestionnaireStepEnum.MinistryInformation,
        title: t('Questionnaire Step 2'),
        icon: <ChurchIcon />,
      },
      {
        step: NsoMpdQuestionnaireStepEnum.FinancialInformation,
        title: t('Questionnaire Step 3'),
        icon: <AccountBalanceIcon />,
      },
      {
        step: NsoMpdQuestionnaireStepEnum.NsoInformation,
        title: t('Questionnaire Step 4'),
        icon: <HotelIcon />,
      },
      {
        step: NsoMpdQuestionnaireStepEnum.Summary,
        title: t('Summary'),
        icon: <RequestQuoteIcon />,
      },
    ],
    [t],
  );

  return steps;
};
