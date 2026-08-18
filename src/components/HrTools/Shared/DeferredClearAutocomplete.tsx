import React from 'react';
import { Autocomplete, TextField, TextFieldProps } from '@mui/material';

export interface DeferredClearAutocompleteProps {
  options: string[];
  /** The saved value, or a fallback option to display (e.g. 'None'). */
  value: string | null;
  /**
   * Called with the new value when an option is selected, and with `null`
   * when the emptied input loses focus.
   */
  onSave: (newValue: string | null) => void;
  label: string;
  helperText?: React.ReactNode;
  disabled?: boolean;
  getOptionLabel?: (option: string) => string;
  textFieldProps?: Partial<TextFieldProps>;
}

/**
 * Controlled single-value Autocomplete that saves selections immediately but
 * defers clear-saves until the field loses focus. Note that clearing the
 * input and blurring saves `null`, so only use this component for fields
 * where the server accepts a `null` value.
 */
export const DeferredClearAutocomplete: React.FC<
  DeferredClearAutocompleteProps
> = ({
  options,
  value,
  onSave,
  label,
  helperText,
  disabled,
  getOptionLabel,
  textFieldProps,
}) => (
  <Autocomplete
    options={options}
    getOptionLabel={getOptionLabel}
    value={value}
    onChange={(_, newValue: string | null, reason) => {
      // Emptying the input fires onChange(null, 'clear') while the user may
      // still be typing a new value. Defer that save to blur so mid-edit
      // keystrokes don't mutate and reset the field.
      if (reason === 'clear') {
        return;
      }
      onSave(newValue);
    }}
    disabled={disabled}
    size="small"
    renderInput={(params) => (
      <TextField
        {...params}
        label={label}
        helperText={helperText}
        onBlur={(event) => {
          if (event.target.value === '') {
            onSave(null);
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
  />
);
