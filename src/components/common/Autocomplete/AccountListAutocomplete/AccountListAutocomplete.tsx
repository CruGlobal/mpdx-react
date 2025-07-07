import React from 'react';
import {
  Autocomplete,
  AutocompleteProps,
  TextField,
  TextFieldProps,
} from '@mui/material';

interface AccountListAutocompleteProps
  extends Partial<
    AutocompleteProps<string | undefined | null, false, boolean, false>
  > {
  textFieldProps?: Partial<TextFieldProps>;
}

export const AccountListAutocomplete: React.FC<
  AccountListAutocompleteProps
> = ({ options, textFieldProps, ...props }) => {
  return (
    <Autocomplete
      fullWidth
      autoHighlight
      {...props}
      options={options?.map((account) => account.id) || []}
      getOptionLabel={(id: string | null | undefined): string =>
        options?.find((account) => account.id === id)?.name ?? ''
      }
      renderInput={(params) => <TextField {...params} {...textFieldProps} />}
    />
  );
};
