import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useIneligibleByGroup } from './useIneligibleByGroup';
import { NavItems } from './useReportNavItems';
import { useRequiredSession } from './useRequiredSession';

export function useHrToolsNavItems(): {
  items: NavItems[];
  loading: boolean;
} {
  const { t } = useTranslation();
  const {
    inAsrIneligibleGroup,
    inSalaryCalcIneligibleGroup,
    inMhaIneligibleGroup,
    inMpdGoalCalcIneligibleGroup,
    inNsGoalCalcIneligibleGroup,
    inPdsGoalCalcIneligibleGroup,
    hasNoStaffAccount,
    userLoading,
  } = useIneligibleByGroup();
  const { developer } = useRequiredSession();

  const items = useMemo(() => {
    if (userLoading) {
      return [];
    }

    return [
      {
        id: 'salaryCalculator',
        title: t('Salary Calculation Form'),
        hideItem: inSalaryCalcIneligibleGroup,
      },
      {
        id: 'staffSavingFund',
        title: t('Savings Fund Transfer'),
        hideItem: hasNoStaffAccount,
      },
      {
        id: 'nsGoalCalculator',
        title: t('New Staff Goal Calculator'),
        hideItem:
          process.env.DISABLE_NS_GOAL_CALCULATOR === 'true' ||
          inNsGoalCalcIneligibleGroup,
      },
      {
        id: 'goalCalculator',
        title: t('MPD Goal Calculator'),
        hideItem: inMpdGoalCalcIneligibleGroup,
      },
      {
        id: 'mhaCalculator',
        title: t('MHA Calculation Tool'),
        hideItem: inMhaIneligibleGroup,
      },
      {
        id: 'additionalSalaryRequest',
        title: t('Additional Salary Request'),
        hideItem: inAsrIneligibleGroup,
      },
      {
        id: 'pdsGoalCalculator',
        title: t('Paid with Designation Support Goal Calculator'),
        hideItem: inPdsGoalCalcIneligibleGroup,
      },
      {
        id: 'partnerReminders',
        title: t('Ministry Partner Reminders'),
        hideItem: hasNoStaffAccount,
      },
      // When not in production, developers bypass all eligibility gating so they can reach all pages
    ].filter(
      (item) =>
        (process.env.DEVELOPMENT_ENV === 'true' && developer) || !item.hideItem,
    );
  }, [
    t,
    inAsrIneligibleGroup,
    inSalaryCalcIneligibleGroup,
    inMhaIneligibleGroup,
    inMpdGoalCalcIneligibleGroup,
    inNsGoalCalcIneligibleGroup,
    inPdsGoalCalcIneligibleGroup,
    userLoading,
    hasNoStaffAccount,
    developer,
  ]);

  return { items, loading: userLoading };
}
