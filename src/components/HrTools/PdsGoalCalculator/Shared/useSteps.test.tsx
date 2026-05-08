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

  it('marks the active step and prior steps as complete', () => {
    const { result } = renderHook(() =>
      useSteps(
        DesignationSupportFormType.Detailed,
        PdsGoalCalculatorStepEnum.SupportItem,
      ),
    );
    expect(
      result.current.map((step) => step.sections.every((s) => s.complete)),
    ).toEqual([true, true, true, false]);
  });

  it('leaves all sections incomplete when no active step is provided', () => {
    const { result } = renderHook(() =>
      useSteps(DesignationSupportFormType.Detailed),
    );
    expect(
      result.current.flatMap((step) => step.sections.map((s) => s.complete)),
    ).toEqual([false, false, false, false, false, false]);
  });
});
