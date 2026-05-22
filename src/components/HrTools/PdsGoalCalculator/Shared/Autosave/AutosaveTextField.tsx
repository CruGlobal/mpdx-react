import React from 'react';
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
  const { busy, ...fieldProps } = usePdsGoalAutoSave({
    fieldName,
    schema,
    saveOnChange: props.select,
  });

  const showValidationError = Boolean(fieldProps.error);

  return (
    <TextField
      fullWidth
      size="small"
      variant="outlined"
      {...fieldProps}
      {...props}
      disabled={fieldProps.disabled || props.disabled}
      // Signal in-flight saves as "busy" rather than "unavailable" — the
      // disabled state above also covers !calculation and props.disabled,
      // which are not saves. Goes on the inner <input> so it travels with
      // the role=textbox/combobox/spinbutton element.
      inputProps={{
        ...props.inputProps,
        'aria-busy': busy || undefined,
      }}
      error={showValidationError || undefined}
      helperText={
        showValidationError ? fieldProps.helperText : props.helperText
      }
    />
  );
};
