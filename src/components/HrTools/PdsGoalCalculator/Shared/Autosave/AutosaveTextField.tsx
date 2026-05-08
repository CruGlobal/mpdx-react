import React, { useState } from 'react';
import { TextField, TextFieldProps } from '@mui/material';
import * as yup from 'yup';
import { DesignationSupportCalculationUpdateInput } from 'src/graphql/types.generated';
import { usePdsGoalAutoSave } from './usePdsGoalAutoSave';

export interface AutosaveTextFieldProps
  extends Omit<
    TextFieldProps<'outlined'>,
    'value' | 'onChange' | 'onBlur' | 'variant'
  > {
  fieldName: keyof DesignationSupportCalculationUpdateInput;
  schema: yup.Schema;
}

export const AutosaveTextField: React.FC<AutosaveTextFieldProps> = ({
  fieldName,
  schema,
  ...props
}) => {
  const fieldProps = usePdsGoalAutoSave({
    fieldName,
    schema,
    saveOnChange: props.select,
  });
  const [touched, setTouched] = useState(false);

  const showValidationError = Boolean(
    fieldProps.error && (touched || fieldProps.value !== ''),
  );

  return (
    <TextField
      fullWidth
      size="small"
      variant="outlined"
      {...fieldProps}
      {...props}
      onChange={(event) => {
        setTouched(true);
        fieldProps.onChange?.(event as React.ChangeEvent<HTMLInputElement>);
      }}
      onBlur={() => {
        setTouched(true);
        fieldProps.onBlur?.();
      }}
      disabled={fieldProps.disabled || props.disabled}
      error={showValidationError || undefined}
      helperText={
        showValidationError ? fieldProps.helperText : props.helperText
      }
    />
  );
};
