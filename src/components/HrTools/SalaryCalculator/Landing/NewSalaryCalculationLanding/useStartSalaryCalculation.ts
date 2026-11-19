import { useUpdateSalaryCalculationMutation } from '../../Autosave/SalaryCalculation.generated';
import { useGoalSalary } from '../../Shared/useGoalSalary';
import { LandingData } from '../useLandingData';
import { useCreateSalaryCalculationMutation } from './LandingSalaryCalculations.generated';

/**
 * Create a new salary calculation. Its requested salaries start at the MPD Goal's salary, when the
 * staff member has a goal for this year, instead of the last approved salary.
 */
export const useStartSalaryCalculation = (
  self: LandingData['self'],
  spouse: LandingData['spouse'],
) => {
  const { getGoalSalaries, loading: goalLoading } = useGoalSalary(self, spouse);
  const [createSalaryCalculation, { loading: creating }] =
    useCreateSalaryCalculationMutation();
  const [updateSalaryCalculation, { loading: updating }] =
    useUpdateSalaryCalculationMutation();

  const startCalculation = async (): Promise<string | undefined> => {
    const { data } = await createSalaryCalculation({
      variables: {
        input: { attributes: {} },
      },
    });
    const calculation = data?.createSalaryRequest?.salaryRequest;
    if (!calculation) {
      return undefined;
    }

    const goalSalaries = getGoalSalaries(
      calculation.calculations,
      calculation.spouseCalculations,
    );
    if (goalSalaries) {
      const { salary, spouseSalary } = goalSalaries;
      await updateSalaryCalculation({
        variables: {
          input: {
            attributes: {
              id: calculation.id,
              ...(salary !== null && { salary }),
              ...(spouseSalary !== null && { spouseSalary }),
            },
          },
        },
        // The new calculation keeps its prefilled salary if this fails, which is still usable
      }).catch(() => {});
    }
    return calculation.id;
  };

  return {
    startCalculation,
    // Wait for the goal so a quick click still starts from the goal's salary
    loading: goalLoading,
    starting: creating || updating,
  };
};
