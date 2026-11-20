import { isUsStaffLike } from 'src/components/Shared/UserTypeAccess/UserTypeAccess';
import { useNewStaffQuestionnaireStatusQuery } from './NewStaffQuestionnaireStatus.generated';
import { useAccountListId } from './useAccountListId';
import { useIneligibleByGroup } from './useIneligibleByGroup';

/** Whether to hide the NSO MPD Questionnaire menu item. */
export function useNsoMpdQuestionnaireHidden(): boolean {
  const { inNsGoalCalcIneligibleGroup, userPending, userType } =
    useIneligibleByGroup();
  // Only the feature flags, not the user group prompt: new staff often reach NSO before answering it
  const featureEnabled =
    process.env.DISABLE_NEW_REPORTS !== 'true' &&
    process.env.DISABLE_NS_GOAL_CALCULATOR !== 'true';
  // HR Tools exist only for Cru US and hybrid staff
  const canSeeHrTools = isUsStaffLike(userType);
  const accountListId = useAccountListId();

  // The API returns a questionnaire only to households in a training with the questionnaire open,
  // whatever either spouse's staff group, so everyone asks.
  const { data, error } = useNewStaffQuestionnaireStatusQuery({
    variables: { accountListId },
    skip: userPending || !featureEnabled || !canSeeHrTools,
  });

  if (!featureEnabled || !canSeeHrTools) {
    return true;
  }
  // A failed query must not hide the path to paperwork new staff still owe,
  // nor offer it to everyone else
  if (error) {
    return inNsGoalCalcIneligibleGroup;
  }
  // A submitted questionnaire stays listed so the household can read it.
  // Cached data keeps the item steady through a cache-and-network refetch
  return !data?.newStaffQuestionnaire;
}
