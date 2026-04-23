import { LandingSalaryCalculationsDocument } from '../Landing/NewSalaryCalculationLanding/LandingSalaryCalculations.generated';
import { useDeleteSalaryCalculationMutation } from './DeleteSalaryCalculation.generated';

interface UseDeleteSalaryCalculationReturn {
  deleteSalaryCalculation: (calculationId: string) => Promise<void>;
}

export const useDeleteSalaryCalculation =
  (): UseDeleteSalaryCalculationReturn => {
    const [deleteSalaryCalculationMutation] =
      useDeleteSalaryCalculationMutation();

    const deleteSalaryCalculation = async (
      calculationId: string,
    ): Promise<void> => {
      await deleteSalaryCalculationMutation({
        variables: {
          input: {
            id: calculationId,
          },
        },
        refetchQueries: [LandingSalaryCalculationsDocument],
      });
    };

    return { deleteSalaryCalculation };
  };
