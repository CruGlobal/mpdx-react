import { TextField, TextFieldProps } from '@mui/material';
import * as yup from 'yup';
import { useAutoSave } from 'src/components/Shared/Autosave/useAutosave';
import { SalaryRequestUpdateInput } from 'src/graphql/types.generated';
import { useSalaryCalculator } from '../SalaryCalculatorContext/SalaryCalculatorContext';
import { useSaveField } from './useSaveField';

export interface AutosaveTextFieldProps
  extends Omit<
    TextFieldProps<'outlined'>,
    // Don't allow overriding any props managed by useAutoSave
    keyof ReturnType<typeof useAutoSave> | 'variant'
  > {
  fieldName: Exclude<keyof SalaryRequestUpdateInput, 'manuallySplitCap'>;
  schema: yup.Schema;
  /** Additional error flag from the parent; OR'd with the field's own validation error */
  error?: boolean;

  /**
   * Save on every keystroke instead of on blur. Defaults to true for select
   * boxes; opt-in for text inputs where immediate feedback is required.
   */
  saveOnChange?: boolean;
}

export const AutosaveTextField: React.FC<AutosaveTextFieldProps> = ({
  fieldName,
  schema,
  error: externalError,
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
    disabled: !calculation,
  });

  return (
    <TextField
      size="small"
      fullWidth
      {...fieldProps}
      {...props}
      error={!!externalError || !!fieldProps.error}
    />
  );
};
