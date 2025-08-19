import ChurchIcon from '@mui/icons-material/Church';
import { Link } from '@mui/material';
import { Trans, useTranslation } from 'react-i18next';
import {
  GoalCalculatorCategoryEnum,
  GoalCalculatorStep,
  GoalCalculatorStepEnum,
} from '../GoalCalculatorHelper';
import { MileageCategory } from './Categories/MileageCategory/MileageCategory';
import { MileageCategoryRightPanelComponent } from './Categories/MileageCategory/MileageCategoryRightPanelComponent/MileageCategoryRightPanelComponent';

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
        id: GoalCalculatorCategoryEnum.MinistryMileage,
        title: t('Ministry Mileage'),
        component: <MileageCategory />,
        rightPanelComponent: <MileageCategoryRightPanelComponent />,
      },
      {
        id: GoalCalculatorCategoryEnum.MedicalMileage,
        title: t('Medical Mileage'),
      },
      {
        id: GoalCalculatorCategoryEnum.MedicalExpenses,
        title: t('Medical Expenses'),
      },
      {
        id: GoalCalculatorCategoryEnum.MinistryPartnerDevelopment,
        title: t('Ministry Partner Development'),
      },
      {
        id: GoalCalculatorCategoryEnum.Communications,
        title: t('Communications'),
      },
      {
        id: GoalCalculatorCategoryEnum.Entertainment,
        title: t('Entertainment'),
      },
      {
        id: GoalCalculatorCategoryEnum.StaffDevelopment,
        title: t('Staff Development'),
      },
      {
        id: GoalCalculatorCategoryEnum.Supplies,
        title: t('Supplies'),
      },
      {
        id: GoalCalculatorCategoryEnum.Technology,
        title: t('Technology'),
      },
      {
        id: GoalCalculatorCategoryEnum.Travel,
        title: t('Travel'),
      },
      {
        id: GoalCalculatorCategoryEnum.Transfers,
        title: t('Transfers'),
      },
      {
        id: GoalCalculatorCategoryEnum.Technology,
        title: t('Technology'),
      },
      {
        id: GoalCalculatorCategoryEnum.Travel,
        title: t('Travel'),
      },
      {
        id: GoalCalculatorCategoryEnum.Transfers,
        title: t('Transfers'),
      },
      {
        id: GoalCalculatorCategoryEnum.OtherMinistry,
        title: t('Other'),
      },
    ],
  };
};
