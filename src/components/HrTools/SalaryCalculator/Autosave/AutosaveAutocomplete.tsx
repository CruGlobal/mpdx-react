import React from 'react';
import { TextFieldProps } from '@mui/material';
import { DeferredClearAutocomplete } from 'src/components/HrTools/Shared/DeferredClearAutocomplete';
import { useSalaryCalculator } from '../SalaryCalculatorContext/SalaryCalculatorContext';
import { useSaveField } from './useSaveField';

export interface AutosaveAutocompleteProps {
  fieldName: string;
  label: string;
  options: string[];
  textFieldProps?: Partial<TextFieldProps>;
  /** Option displayed when the field has no saved value, e.g. 'None'. */
  emptyValue?: string;
}

/**
 * Autocomplete that autosaves its value via `useSaveField`. Note that
 * clearing the input and blurring saves `null` for `fieldName`, so only use
 * this component for fields where the server accepts a `null` value.
 */
export const AutosaveAutocomplete: React.FC<AutosaveAutocompleteProps> = ({
  fieldName,
  label,
  options,
  textFieldProps,
  emptyValue,
}) => {
  const saveField = useSaveField();
  const { calculation } = useSalaryCalculator();

  const value = calculation?.[fieldName] ?? emptyValue ?? null;

  return (
    <DeferredClearAutocomplete
      options={options}
      value={value}
      onSave={(newValue) => saveField({ [fieldName]: newValue })}
      disabled={!calculation}
      label={label}
      textFieldProps={textFieldProps}
    />
  );
};
