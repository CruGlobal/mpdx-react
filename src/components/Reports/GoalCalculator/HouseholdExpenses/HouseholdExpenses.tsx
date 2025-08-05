import HomeIcon from '@mui/icons-material/Home';
import { Link, Typography, styled } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { InformationStep } from '../CalculatorSettings/Steps/InformationStep/InformationStep';
import {
  GoalCalculatorCategoryEnum,
  GoalCalculatorStep,
  GoalCalculatorStepEnum,
} from '../GoalCalculatorHelper';

const InstructionsWrapper = styled('div')(({ theme }) => ({
  '.MuiTypography-root': {
    marginBottom: theme.spacing(1),
  },
}));

export const useHouseholdExpenses = (): GoalCalculatorStep => {
  const { t } = useTranslation();
  return {
    id: GoalCalculatorStepEnum.HouseholdExpenses,
    title: t('Household Expenses'),
    instructions: (
      <InstructionsWrapper>
        <Typography variant="h6">{t('Enter your monthly budget')}</Typography>
        <Typography variant="body2">
          {t(
            'You may choose to skip entering your budget below if you know the net cash you need each month.',
          )}
        </Typography>
        <Typography variant="body2">
          {t('For additional guidance, check out')}{' '}
          <Link href="https://www.ramseysolutions.com/budgeting/useful-forms">
            {t('these resources from Ramsey Solutions')}
          </Link>
          .
        </Typography>
      </InstructionsWrapper>
    ),
    icon: <HomeIcon />,
    categories: [
      {
        id: GoalCalculatorCategoryEnum.Giving,
        title: t('Giving'),
        component: <InformationStep />,
      },
      {
        id: GoalCalculatorCategoryEnum.Saving,
        title: t('Saving'),
        component: <InformationStep />,
      },
      {
        id: GoalCalculatorCategoryEnum.Housing,
        title: t('Housing'),
        component: <InformationStep />,
      },
      {
        id: GoalCalculatorCategoryEnum.Utilities,
        title: t('Utilities'),
        component: <InformationStep />,
      },
      {
        id: GoalCalculatorCategoryEnum.Insurance,
        title: t('Insurance'),
        component: <InformationStep />,
      },
      {
        id: GoalCalculatorCategoryEnum.Debt,
        title: t('Debt'),
        component: <InformationStep />,
      },
      {
        id: GoalCalculatorCategoryEnum.Food,
        title: t('Food'),
        component: <InformationStep />,
      },
      {
        id: GoalCalculatorCategoryEnum.Clothing,
        title: t('Clothing'),
        component: <InformationStep />,
      },
      {
        id: GoalCalculatorCategoryEnum.Transportation,
        title: t('Transportation'),
        component: <InformationStep />,
      },
      {
        id: GoalCalculatorCategoryEnum.Medical,
        title: t('Medical'),
        component: <InformationStep />,
      },
      {
        id: GoalCalculatorCategoryEnum.Recreational,
        title: t('Recreational'),
        component: <InformationStep />,
      },
      {
        id: GoalCalculatorCategoryEnum.Personal,
        title: t('Personal'),
        component: <InformationStep />,
      },
    ],
  };
};
