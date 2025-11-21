import * as yup from 'yup';
import { useGoalCalculator } from 'src/components/Reports/GoalCalculator/Shared/GoalCalculatorContext';
import { useAutoSave } from 'src/components/Shared/Autosave/useAutosave';
import { GoalCalculationUpdateInput } from 'src/graphql/types.generated';
import { useSaveField } from './useSaveField';

interface UseAutoSaveOptions {
  fieldName: keyof GoalCalculationUpdateInput;
  schema: yup.Schema;
  saveOnChange?: boolean;
}

export const useGoalAutoSave = ({
  fieldName,
  ...options
}: UseAutoSaveOptions) => {
  const saveField = useSaveField();
  const {
    goalCalculationResult: { data },
  } = useGoalCalculator();

  return useAutoSave({
    value: data?.goalCalculation[fieldName],
    saveValue: (value) => saveField({ [fieldName]: value }),
    fieldName,
    disabled: !data,
    ...options,
  });
};
