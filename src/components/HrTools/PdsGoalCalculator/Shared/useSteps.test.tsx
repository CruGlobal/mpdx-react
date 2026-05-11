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

  const formTypes: DesignationSupportFormType[] = [
    DesignationSupportFormType.Detailed,
    DesignationSupportFormType.Simple,
  ];

  const orderedKeysForFormType: Record<
    DesignationSupportFormType,
    PdsGoalCalculatorStepEnum[]
  > = {
    [DesignationSupportFormType.Detailed]: [
      PdsGoalCalculatorStepEnum.Setup,
      PdsGoalCalculatorStepEnum.ReimbursableExpenses,
      PdsGoalCalculatorStepEnum.SupportItem,
      PdsGoalCalculatorStepEnum.SummaryReport,
    ],
    [DesignationSupportFormType.Simple]: [
      PdsGoalCalculatorStepEnum.Setup,
      PdsGoalCalculatorStepEnum.SupportItem,
      PdsGoalCalculatorStepEnum.SummaryReport,
    ],
  };

  it.each(formTypes)(
    'returned step keys match orderedKeysForFormType for %s',
    (formType) => {
      const { result } = renderHook(() => useSteps(formType));
      expect(result.current.map((step) => step.step)).toEqual(
        orderedKeysForFormType[formType],
      );
    },
  );

  it.each(formTypes)(
    'starts with the Setup step for formType %s',
    (formType) => {
      const { result } = renderHook(() => useSteps(formType));
      expect(result.current[0].step).toBe(PdsGoalCalculatorStepEnum.Setup);
    },
  );

  it.each(formTypes)(
    'ends with the Summary Report step for formType %s',
    (formType) => {
      const { result } = renderHook(() => useSteps(formType));
      expect(result.current[result.current.length - 1].step).toBe(
        PdsGoalCalculatorStepEnum.SummaryReport,
      );
    },
  );

  it.each(formTypes)(
    'returns a non-empty steps array for formType %s',
    (formType) => {
      const { result } = renderHook(() => useSteps(formType));
      expect(result.current.length).toBeGreaterThan(0);
    },
  );
});
