import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNewStaffQuestionnaireStatusQuery } from './NewStaffQuestionnaireStatus.generated';
import { useAccountListId } from './useAccountListId';
import { useDeveloperBypass } from './useDeveloperBypass';
import { useIneligibleByGroup } from './useIneligibleByGroup';
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
    inNsGoalCalcIneligibleGroup,
    inPdsGoalCalcIneligibleGroup,
    inMpdSupervisorIneligibleGroup,
    canViewNewStaffCohorts,
    hasNoStaffAccount,
    userLoading,
  } = useIneligibleByGroup();
  const developerBypass = useDeveloperBypass();
  // Partner Reminders is live in production; every other HR Tool is still disabled
  const { reportsDisabled } = useReportsDisabled();
  const { impersonating, isImpersonatorDeveloper } = useRequiredSession();
  // Non-developer impersonators must never see the supervisor report (MPDX-10066).
  // Applied outside the developerBypass filter because session.developer reflects
  // the impersonated user, not the impersonator.
  const blockedImpersonation = !!impersonating && !isImpersonatorDeveloper;

  const accountListId = useAccountListId();

  // Only new staff are ever offered the questionnaire, so nobody else pays for this query.
  const {
    data: questionnaireData,
    loading: questionnaireLoading,
    error: questionnaireError,
  } = useNewStaffQuestionnaireStatusQuery({
    variables: { accountListId },
    skip: userLoading || inNsGoalCalcIneligibleGroup,
  });
  const questionnaire = questionnaireData?.newStaffQuestionnaire;
  const hasQuestionnaireToFillIn = !!questionnaire && !questionnaire.completed;
  // A failed query must not hide the path to paperwork new staff still owe
  const hideQuestionnaire = questionnaireError
    ? false
    : questionnaireLoading || !hasQuestionnaireToFillIn;

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
          inNsGoalCalcIneligibleGroup ||
          hideQuestionnaire,
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
        // TODO (MPDX-9822): Once HCM goes live, add has no staff account gate back
        hideItem: false,
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
    inNsGoalCalcIneligibleGroup,
    inPdsGoalCalcIneligibleGroup,
    inMpdSupervisorIneligibleGroup,
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
