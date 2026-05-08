import { renderHook } from '@testing-library/react-hooks';
import { DesignationSupportFormType } from 'src/graphql/types.generated';
import { PdsGoalCalculatorStepEnum } from '../PdsGoalCalculatorHelper';
import { useSteps } from './useSteps';

describe('useSteps', () => {
  it('returns four steps when formType is Detailed', () => {
    const { result } = renderHook(() =>
      useSteps(DesignationSupportFormType.Detailed),
    );
    expect(result.current.map((step) => step.step)).toEqual([
      PdsGoalCalculatorStepEnum.Setup,
      PdsGoalCalculatorStepEnum.ReimbursableExpenses,
      PdsGoalCalculatorStepEnum.SupportItem,
      PdsGoalCalculatorStepEnum.SummaryReport,
    ]);
  });

  it('omits the Reimbursable Expenses step when formType is Simple', () => {
    const { result } = renderHook(() =>
      useSteps(DesignationSupportFormType.Simple),
    );
    expect(result.current.map((step) => step.step)).toEqual([
      PdsGoalCalculatorStepEnum.Setup,
      PdsGoalCalculatorStepEnum.SupportItem,
      PdsGoalCalculatorStepEnum.SummaryReport,
    ]);
  });

  it('returns four steps (Detailed behavior) when formType is null/undefined', () => {
    const { result } = renderHook(() => useSteps(null));
    expect(result.current.map((step) => step.step)).toEqual([
      PdsGoalCalculatorStepEnum.Setup,
      PdsGoalCalculatorStepEnum.ReimbursableExpenses,
      PdsGoalCalculatorStepEnum.SupportItem,
      PdsGoalCalculatorStepEnum.SummaryReport,
    ]);
  });
});
