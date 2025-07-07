import React from 'react';
import {
  Autocomplete,
  AutocompleteProps,
  TextField,
  TextFieldProps,
} from '@mui/material';
import { useAccountListOptionsQuery } from './AccountListOptions.generated';

interface AccountListAutocompleteProps
  extends Partial<
    AutocompleteProps<string | undefined | null, false, boolean, false>
  > {
  accountListId: string;
  textFieldProps?: Partial<TextFieldProps>;
}

export const AccountListAutocomplete: React.FC<
  AccountListAutocompleteProps
> = ({ textFieldProps, accountListId, ...props }) => {
  const { data: accountListOptions, loading: accountListOptionsLoading } =
    useAccountListOptionsQuery({
      variables: {
        accountListId: accountListId ?? '',
      },
    });
  return (
    <Autocomplete
      fullWidth
      autoHighlight
      disableClearable={false}
      {...props}
      loading={accountListOptionsLoading}
      options={
        accountListOptions.accountLists?.nodes.map((account) => account.id) ||
        []
      }
      getOptionLabel={(id: string): string =>
        accountListOptions.accountLists?.nodes?.find(
          (account) => account.id === id,
        )?.name ?? ''
      }
      renderInput={(params) => <TextField {...params} {...textFieldProps} />}
    />
  );
};
