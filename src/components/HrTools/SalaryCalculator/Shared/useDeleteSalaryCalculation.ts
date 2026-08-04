import { LandingSalaryCalculationsDocument } from '../Landing/NewSalaryCalculationLanding/LandingSalaryCalculations.generated';
import { useDeleteSalaryCalculationMutation } from './DeleteSalaryCalculation.generated';

interface UseDeleteSalaryCalculationReturn {
  deleteSalaryCalculation: (calculationId: string) => Promise<void>;
  deleting: boolean;
}

export const useDeleteSalaryCalculation =
  (): UseDeleteSalaryCalculationReturn => {
    const [deleteSalaryCalculationMutation, { loading: deleting }] =
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
        awaitRefetchQueries: true,
      });
    };

    return { deleteSalaryCalculation, deleting };
  };
