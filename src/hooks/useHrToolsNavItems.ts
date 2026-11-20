import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useDeveloperBypass } from './useDeveloperBypass';
import { useIneligibleByGroup } from './useIneligibleByGroup';
import { useNsGoalCalculatorAccess } from './useNsGoalCalculatorAccess';
import { useNsoMpdQuestionnaireHidden } from './useNsoMpdQuestionnaireHidden';
import { NavItems } from './useReportNavItems';
import { useReportsDisabled } from './useReportsDisabled';
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
    inPdsGoalCalcIneligibleGroup,
    inMpdSupervisorIneligibleGroup,
    inStaffAccountIneligibleGroup,
    canViewNewStaffCohorts,
    hasNoStaffAccount,
    userLoading,
  } = useIneligibleByGroup();
  const developerBypass = useDeveloperBypass();
  const { reportsDisabled } = useReportsDisabled();
  const { canUseNsGoalCalculator } = useNsGoalCalculatorAccess();
  const { impersonating, isImpersonatorDeveloper } = useRequiredSession();
  // Non-developer impersonators must never see the supervisor report (MPDX-10066).
  // Applied outside the developerBypass filter because session.developer reflects
  // the impersonated user, not the impersonator.
  const blockedImpersonation = !!impersonating && !isImpersonatorDeveloper;

  const hideQuestionnaire = useNsoMpdQuestionnaireHidden();

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
        hideItem:
          reportsDisabled || hasNoStaffAccount || inStaffAccountIneligibleGroup,
      },
      {
        id: 'nsGoalCalculator',
        title: t('New Staff Goal Calculator'),
        hideItem: !canUseNsGoalCalculator,
      },
      {
        id: 'nsoMpdQuestionnaire',
        title: t('NSO MPD Questionnaire'),
        hideItem: hideQuestionnaire,
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
          !canViewNewStaffCohorts,
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
        hideItem: reportsDisabled || hasNoStaffAccount,
      },
      {
        id: 'mpdSupervisorReport',
        title: t('MPD Supervisor Report'),
        hideItem: reportsDisabled || inMpdSupervisorIneligibleGroup,
      },
    ]
      .filter((item) => developerBypass || !item.hideItem)
      .filter(
        (item) => !(item.id === 'mpdSupervisorReport' && blockedImpersonation),
      );
  }, [
    t,
    inAsrIneligibleGroup,
    inSalaryCalcIneligibleGroup,
    inMhaIneligibleGroup,
    inMpdGoalCalcIneligibleGroup,
    inPdsGoalCalcIneligibleGroup,
    inMpdSupervisorIneligibleGroup,
    inStaffAccountIneligibleGroup,
    canViewNewStaffCohorts,
    hideQuestionnaire,
    userLoading,
    hasNoStaffAccount,
    developerBypass,
    reportsDisabled,
    blockedImpersonation,
  ]);

  return { items, loading: userLoading };
}
