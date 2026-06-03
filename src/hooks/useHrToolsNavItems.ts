import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { NavItems } from './useReportNavItems';
import { useUsStaffGroups } from './useUsStaffGroups';

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
    inPdsGoalCalcIneligibleGroup,
    hasNoHcmData,
    loading: hcmLoading,
  } = useUsStaffGroups();

  const items = useMemo(() => {
    if (hcmLoading) {
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
        hideItem: hasNoHcmData,
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
        hideItem: hasNoHcmData,
      },
    ].filter((item) => !item.hideItem);
  }, [
    t,
    inAsrIneligibleGroup,
    inSalaryCalcIneligibleGroup,
    inMhaIneligibleGroup,
    inMpdGoalCalcIneligibleGroup,
    inPdsGoalCalcIneligibleGroup,
    hasNoHcmData,
    hcmLoading,
  ]);

  return { items, loading: hcmLoading };
}
