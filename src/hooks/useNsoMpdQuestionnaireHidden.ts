import { useNewStaffQuestionnaireStatusQuery } from './NewStaffQuestionnaireStatus.generated';
import { useAccountListId } from './useAccountListId';
import { useIneligibleByGroup } from './useIneligibleByGroup';
import { useReportsDisabled } from './useReportsDisabled';

/** Whether to hide the NSO MPD Questionnaire menu item. */
export function useNsoMpdQuestionnaireHidden(): boolean {
  const { inNsGoalCalcIneligibleGroup, userLoading } = useIneligibleByGroup();
  const { reportsDisabled } = useReportsDisabled();
  const accountListId = useAccountListId();

  // The API returns a questionnaire only to households in a training with the questionnaire open,
  // whatever either spouse's staff group, so everyone asks.
  const { data, loading, error } = useNewStaffQuestionnaireStatusQuery({
    variables: { accountListId },
    skip: userLoading,
  });

  if (reportsDisabled || process.env.DISABLE_NS_GOAL_CALCULATOR === 'true') {
    return true;
  }
  // A failed query must not hide the path to paperwork new staff still owe,
  // nor offer it to everyone else
  if (error) {
    return inNsGoalCalcIneligibleGroup;
  }
  const questionnaire = data?.newStaffQuestionnaire;
  return loading || !questionnaire || questionnaire.completed;
}
