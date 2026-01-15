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
}

export const AutosaveAutocomplete: React.FC<AutosaveAutocompleteProps> = ({
  fieldName,
  label,
  options,
  textFieldProps,
  ...props
}) => {
  const saveField = useSaveField();
  const { calculation } = useSalaryCalculator();

  const value = calculation?.[fieldName] ?? null;

  return (
    <Autocomplete
      options={options}
      value={value}
      onChange={(_, newValue) => saveField({ [fieldName]: newValue })}
      disabled={!calculation}
      size="small"
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
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
