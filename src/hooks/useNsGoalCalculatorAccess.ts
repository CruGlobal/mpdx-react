import { useIneligibleByGroup } from './useIneligibleByGroup';
import { useReportsDisabled } from './useReportsDisabled';

/** One gate for every New Staff Goal Calculator entry point, so the menu and the dashboard card agree. */
export function useNsGoalCalculatorAccess(): {
  canUseNsGoalCalculator: boolean;
  /** The feature is on for this user, whatever their staff group; the NSO MPD Questionnaire reads this. */
  featureEnabled: boolean;
  loading: boolean;
} {
  const { inNsGoalCalcIneligibleGroup, userLoading } = useIneligibleByGroup();
  const { reportsDisabled } = useReportsDisabled();
  const featureEnabled =
    !reportsDisabled && process.env.DISABLE_NS_GOAL_CALCULATOR !== 'true';

  return {
    canUseNsGoalCalculator: featureEnabled && !inNsGoalCalcIneligibleGroup,
    featureEnabled,
    loading: userLoading,
  };
}
