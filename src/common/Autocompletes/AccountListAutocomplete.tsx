import React from 'react';
import {
  Autocomplete,
  AutocompleteProps,
  TextField,
  TextFieldProps,
} from '@mui/material';

interface AccountListAutocompleteProps
  extends Partial<AutocompleteProps<any, false, boolean, false>> {
  textFieldProps?: Partial<TextFieldProps>;
  options: any[];
}

export const AccountListAutocomplete: React.FC<
  AccountListAutocompleteProps
> = ({ textFieldProps, options, ...props }) => {
  return (
    <Autocomplete
      fullWidth
      autoHighlight
      {...props}
      options={options.map((account) => account.id) || []}
      getOptionLabel={(id: any): string =>
        options.find((account) => account.id === id)?.name ?? ''
      }
      renderInput={(params) => <TextField {...params} {...textFieldProps} />}
    />
  );
};
