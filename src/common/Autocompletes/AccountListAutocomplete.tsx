import React from 'react';
import {
  Autocomplete,
  AutocompleteProps,
  TextField,
  TextFieldProps,
} from '@mui/material';
import { AccountListOptionsQuery } from 'pages/setup/Account.generated';
// import { AccountList } from 'src/graphql/types.generated';

export type AccountListOption =
  AccountListOptionsQuery['accountLists']['nodes'][number];

interface AccountListAutocompleteProps
  extends Partial<AutocompleteProps<AccountListOption, false, boolean, false>> {
  textFieldProps?: Partial<TextFieldProps>;
  options: AccountListOption[];
}

export const AccountListAutocomplete: React.FC<
  AccountListAutocompleteProps
> = ({ textFieldProps, options, ...props }) => {
  return (
    <Autocomplete
      fullWidth
      autoHighlight
      {...props}
      options={options || []}
      getOptionLabel={(account: AccountListOption): string =>
        account?.name ?? ''
      }
      renderInput={(params) => <TextField {...params} {...textFieldProps} />}
    />
  );
};
