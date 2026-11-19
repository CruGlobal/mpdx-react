import { useIneligibleByGroup } from './useIneligibleByGroup';
import { useReportsDisabled } from './useReportsDisabled';

/** One gate for every New Staff Goal Calculator entry point, so the menu and the dashboard card agree. */
export function useNsGoalCalculatorAccess(): {
  canUseNsGoalCalculator: boolean;
  loading: boolean;
} {
  const { inNsGoalCalcIneligibleGroup, userLoading } = useIneligibleByGroup();
  const { reportsDisabled } = useReportsDisabled();

  return {
    canUseNsGoalCalculator:
      !reportsDisabled &&
      process.env.DISABLE_NS_GOAL_CALCULATOR !== 'true' &&
      !inNsGoalCalcIneligibleGroup,
    loading: userLoading,
  };
}
