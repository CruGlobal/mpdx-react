import React from 'react';
import {
  Autocomplete,
  AutocompleteProps,
  TextField,
  TextFieldProps,
} from '@mui/material';
import { AccountList } from 'src/graphql/types.generated';

export type AccountListOption = Pick<AccountList, 'id' | 'name'>;

interface AccountListAutocompleteProps
  extends Partial<AutocompleteProps<AccountListOption, false, boolean, false>> {
  textFieldProps?: Partial<TextFieldProps>;
  options: AccountListOption[];
}

export const AccountListAutocomplete: React.FC<
  AccountListAutocompleteProps
> = ({ textFieldProps, ...props }) => {
  return (
    <Autocomplete
      fullWidth
      autoHighlight
      {...props}
      getOptionLabel={(account: AccountListOption): string =>
        account?.name ?? ''
      }
      renderInput={(params) => <TextField {...params} {...textFieldProps} />}
    />
  );
};
