import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useDeveloperBypass } from './useDeveloperBypass';
import { useIneligibleByGroup } from './useIneligibleByGroup';
import { NavItems } from './useReportNavItems';
import { useReportsDisabled } from './useReportsDisabled';

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
  const developerBypass = useDeveloperBypass();
  // Partner Reminders is live in production; every other HR Tool is still disabled
  const { reportsDisabled } = useReportsDisabled();

  const items = useMemo(() => {
    if (userLoading) {
      return [];
    }

    return [
      {
        id: 'salaryCalculator',
        title: t('Salary Calculation Form'),
        hideItem: reportsDisabled || inSalaryCalcIneligibleGroup,
      },
      {
        id: 'staffSavingFund',
        title: t('Savings Fund Transfer'),
        hideItem: reportsDisabled || hasNoStaffAccount,
      },
      {
        id: 'nsGoalCalculator',
        title: t('New Staff Goal Calculator'),
        hideItem:
          reportsDisabled ||
          process.env.DISABLE_NS_GOAL_CALCULATOR === 'true' ||
          inNsGoalCalcIneligibleGroup,
      },
      {
        id: 'nsoMpdQuestionnaire',
        title: t('NSO MPD Questionnaire'),
        hideItem:
          reportsDisabled ||
          process.env.DISABLE_NS_GOAL_CALCULATOR === 'true' ||
          inNsGoalCalcIneligibleGroup,
      },
      {
        id: 'goalCalculator',
        title: t('MPD Goal Calculator'),
        hideItem: reportsDisabled || inMpdGoalCalcIneligibleGroup,
      },
      {
        id: 'mpdGoalAdmin',
        title: t('MPD Goal Calculator Admin Table'),
        hideItem:
          reportsDisabled ||
          process.env.DISABLE_MPD_GOAL_ADMIN === 'true' ||
          inMpdGoalCalcIneligibleGroup,
      },
      {
        id: 'mhaCalculator',
        title: t('MHA Calculation Tool'),
        hideItem: reportsDisabled || inMhaIneligibleGroup,
      },
      {
        id: 'additionalSalaryRequest',
        title: t('Additional Salary Request'),
        hideItem: reportsDisabled || inAsrIneligibleGroup,
      },
      {
        id: 'pdsGoalCalculator',
        title: t('Paid with Designation Support Goal Calculator'),
        hideItem: reportsDisabled || inPdsGoalCalcIneligibleGroup,
      },
      {
        id: 'partnerReminders',
        title: t('Ministry Partner Reminders'),
        // TODO (MPDX-9822): Once HCM goes live, add has no staff account gate back
        hideItem: false,
      },
      {
        id: 'mpdSupervisorReport',
        title: t('MPD Supervisor Report'),
        hideItem: reportsDisabled || hasNoStaffAccount,
      },
    ].filter((item) => developerBypass || !item.hideItem);
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
    developerBypass,
    reportsDisabled,
  ]);

  return { items, loading: userLoading };
}
