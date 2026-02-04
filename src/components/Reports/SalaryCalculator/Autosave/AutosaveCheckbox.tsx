import { Checkbox, CheckboxProps } from '@mui/material';
import { useAutosaveCheckbox } from 'src/components/Shared/Autosave/useAutosaveCheckbox';
import { SalaryRequestUpdateInput } from 'src/graphql/types.generated';
import { useSalaryCalculator } from '../SalaryCalculatorContext/SalaryCalculatorContext';
import { useSaveField } from './useSaveField';

export interface AutosaveCheckboxProps
  extends Omit<CheckboxProps, keyof ReturnType<typeof useAutosaveCheckbox>> {
  fieldName: keyof SalaryRequestUpdateInput;
}

export const AutosaveCheckbox: React.FC<AutosaveCheckboxProps> = ({
  fieldName,
  ...props
}) => {
  const saveField = useSaveField();
  const { calculation } = useSalaryCalculator();

  const checkboxProps = useAutosaveCheckbox({
    value: Boolean(calculation?.[fieldName]),
    saveValue: (value) => saveField({ [fieldName]: value }),
  });

  return <Checkbox {...checkboxProps} {...props} disabled={!calculation} />;
};
