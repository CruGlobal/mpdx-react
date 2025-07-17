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
  textFieldProps?: Partial<TextFieldProps>;
}

export const AccountListAutocomplete: React.FC<
  AccountListAutocompleteProps
> = ({ textFieldProps, ...props }) => {
  const { data: accountListOptions, loading: accountListOptionsLoading } =
    useAccountListOptionsQuery();

  const options =
    accountListOptions?.accountLists?.nodes?.map((account) => account.id) || [];

  return (
    <Autocomplete
      fullWidth
      autoHighlight
      disableClearable={false}
      {...props}
      key={accountListOptionsLoading ? 'loading' : 'loaded'} // Force re-render when loading state changes
      loading={accountListOptionsLoading}
      options={options}
      getOptionLabel={(option: string | null | undefined): string => {
        if (!option) {
          return '';
        }
        if (!accountListOptions?.accountLists?.nodes) {
          return ''; // Return empty string while loading to avoid showing IDs
        }
        const account = accountListOptions.accountLists.nodes.find(
          (account) => account.id === option,
        );
        return account?.name ?? '';
      }}
      renderInput={(params) => <TextField {...params} {...textFieldProps} />}
    />
  );
};
