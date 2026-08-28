import { TextField, TextFieldProps } from '@mui/material';
import * as yup from 'yup';
import { useAutoSave } from 'src/components/Shared/Autosave/useAutosave';
import { SalaryRequestUpdateInput } from 'src/graphql/types.generated';
import { useSalaryCalculator } from '../SalaryCalculatorContext/SalaryCalculatorContext';
import { useSaveField } from './useSaveField';

export interface AutosaveTextFieldProps
  extends Omit<
    TextFieldProps<'outlined'>,
    // Only allow overriding error and disabled props managed by useAutoSave
    | Exclude<keyof ReturnType<typeof useAutoSave>, 'disabled' | 'error'>
    | 'variant'
  > {
  fieldName: Exclude<keyof SalaryRequestUpdateInput, 'manuallySplitCap'>;
  schema: yup.Schema;

  /**
   * Save on every keystroke instead of on blur. Defaults to true for select
   * boxes; opt-in for text inputs where immediate feedback is required.
   */
  saveOnChange?: boolean;
}

export const AutosaveTextField: React.FC<AutosaveTextFieldProps> = ({
  fieldName,
  schema,
  error,
  disabled,
  saveOnChange,
  ...props
}) => {
  const saveField = useSaveField();
  const { calculation } = useSalaryCalculator();

  const fieldProps = useAutoSave({
    value: calculation?.[fieldName],
    saveValue: (value) => saveField({ [fieldName]: value }),
    fieldName,
    schema,
    saveOnChange: saveOnChange ?? !!props.select,
    disabled: !!disabled || !calculation,
  });

  return (
    <TextField
      size="small"
      fullWidth
      {...fieldProps}
      {...props}
      error={!!error || !!fieldProps.error}
    />
  );
};
