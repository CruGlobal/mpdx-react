import React from 'react';
import {
  Autocomplete,
  AutocompleteProps,
  TextField,
  TextFieldProps,
} from '@mui/material';
import { useSalaryCalculator } from '../SalaryCalculatorContext/SalaryCalculatorContext';
import { useSaveField } from './useSaveField';

export interface AutosaveAutocompleteProps
  extends Omit<
    AutocompleteProps<string, false, false, false>,
    'renderInput' | 'onChange' | 'value'
  > {
  fieldName: string;
  label: string;
  textFieldProps?: Partial<TextFieldProps>;
  /** Option displayed when the field has no saved value, e.g. 'None'. */
  emptyValue?: string;
}

export const AutosaveAutocomplete: React.FC<AutosaveAutocompleteProps> = ({
  fieldName,
  label,
  options,
  textFieldProps,
  emptyValue,
  ...props
}) => {
  const saveField = useSaveField();
  const { calculation } = useSalaryCalculator();

  const value = calculation?.[fieldName] ?? emptyValue ?? null;

  return (
    <Autocomplete
      options={options}
      value={value}
      onChange={(_, newValue, reason) => {
        // Emptying the input fires onChange(null, 'clear') while the user may
        // still be typing a new value. Defer that save to blur so mid-edit
        // keystrokes don't mutate and reset the field.
        if (reason === 'clear') {
          return;
        }
        saveField({ [fieldName]: newValue });
      }}
      disabled={!calculation}
      size="small"
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          onBlur={(event) => {
            if (event.target.value === '') {
              saveField({ [fieldName]: null });
            }
          }}
          InputProps={{
            ...params.InputProps,
            ...textFieldProps?.InputProps,
          }}
          InputLabelProps={{
            ...params.InputLabelProps,
            ...textFieldProps?.InputLabelProps,
          }}
        />
      )}
      {...props}
    />
  );
};
