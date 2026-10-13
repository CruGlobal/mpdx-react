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
    AutocompleteProps<string, false, boolean, false>,
    // disableClearable is owned by the component: it is derived from
    // emptyValue, and letting a caller re-enable clearing would restore the
    // mid-typing null save this component exists to prevent
    'renderInput' | 'onChange' | 'value' | 'disableClearable'
  > {
  fieldName: string;
  label: string;
  textFieldProps?: Partial<TextFieldProps>;
  /**
   * Option displayed when the field has no saved value, e.g. 'None'. Must be
   * one of the options. When set, the field is not clearable — selecting the
   * empty-value option takes the place of clearing.
   */
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
      // With an emptyValue option there is nothing to clear to, and disabling
      // clearing also stops MUI from firing a mid-typing null save when the
      // input is emptied
      disableClearable={emptyValue !== undefined}
      value={value}
      // saveField's mutation failures are already surfaced to the user and
      // reported to Datadog by the global Apollo error link. Catch the
      // rejection here anyway so it doesn't also become an unhandled promise
      // rejection, which RUM would otherwise attach to this selection as a
      // frustration signal (error_click) on top of the error already shown.
      onChange={(_, newValue) =>
        saveField({ [fieldName]: newValue }).catch(() => {})
      }
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
