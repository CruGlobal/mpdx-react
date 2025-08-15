import ChurchIcon from '@mui/icons-material/Church';
import { Link } from '@mui/material';
import { Trans, useTranslation } from 'react-i18next';
import { InformationStep } from '../CalculatorSettings/Steps/InformationStep/InformationStep';
import {
  GoalCalculatorCategoryEnum,
  GoalCalculatorStep,
  GoalCalculatorStepEnum,
} from '../GoalCalculatorHelper';
import { MileageStep } from './Steps/MileageStep/MileageStep';
import { MileageStepRightPanelComponent } from './Steps/MileageStep/MileageStepRightPanelComponent/MileageStepRightPanelComponent';

export const useMinistryExpenses = (): GoalCalculatorStep => {
  const { t } = useTranslation();
  return {
    id: GoalCalculatorStepEnum.MinistryExpenses,
    title: t('Ministry Expenses'),
    instructions: (
      <Trans t={t}>
        Enter amounts for the following categories of reimbursable and ministry
        expenses. The{' '}
        <Link href="https://staffweb.cru.org/mpd-donations/my-donations/mpga.html">
          MPGA tool on StaffWeb
        </Link>{' '}
        can show you your averages in some of these categories. If you did not
        take full reimbursements for the entire year, or if your reimbursements
        were abnormally high (e.g. you had a surgery or bought a new computer),
        or low (e.g. no summer mission), you will want to adjust the averages
        from the MPGA to reflect an average year. Click the link above, go to
        the Income/Expenses tab, and look under the Ministry Expenses section.
      </Trans>
    ),
    icon: <ChurchIcon />,
    categories: [
      {
        id: GoalCalculatorCategoryEnum.Mileage,
        title: t('Mileage'),
        component: <MileageStep />,
        rightPanelComponent: <MileageStepRightPanelComponent />,
      },
      {
        id: GoalCalculatorCategoryEnum.Medical,
        title: t('Medical'),
        component: <InformationStep />,
      },
      {
        id: GoalCalculatorCategoryEnum.MPD,
        title: t('MPD'),
        component: <InformationStep />,
      },
      {
        id: GoalCalculatorCategoryEnum.Transfers,
        title: t('Transfers'),
        component: <InformationStep />,
      },
      {
        id: GoalCalculatorCategoryEnum.Technology,
        title: t('Technology'),
        component: <InformationStep />,
      },
      {
        id: GoalCalculatorCategoryEnum.SummerMissions,
        title: t('Summer Missions'),
        component: <InformationStep />,
      },
      {
        id: GoalCalculatorCategoryEnum.Other,
        title: t('Other'),
        component: <InformationStep />,
      },
    ],
  };
};
