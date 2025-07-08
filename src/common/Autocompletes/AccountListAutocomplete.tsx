import React from 'react';
import {
  Autocomplete,
  AutocompleteProps,
  TextField,
  TextFieldProps,
} from '@mui/material';
import { AccountListOptionsQuery } from 'pages/setup/Account.generated';
// import { AccountList } from 'src/graphql/types.generated';

export type AccountList =
  AccountListOptionsQuery['accountLists']['nodes'][number];

interface AccountListAutocompleteProps
  extends Partial<AutocompleteProps<AccountList, false, boolean, false>> {
  textFieldProps?: Partial<TextFieldProps>;
  options: AccountList[];
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
      getOptionLabel={(account: AccountList): string => account?.name ?? ''}
      renderInput={(params) => <TextField {...params} {...textFieldProps} />}
    />
  );
};
