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
  return (
    <Autocomplete
      fullWidth
      autoHighlight
      disableClearable={false}
      {...props}
      loading={accountListOptionsLoading}
      options={
        accountListOptions?.accountLists?.nodes.map((account) => account.id) ||
        []
      }
      getOptionLabel={(option: string | null | undefined): string =>
        option
          ? accountListOptions?.accountLists?.nodes?.find(
              (account) => account.id === option,
            )?.name ?? ''
          : ''
      }
      renderInput={(params) => <TextField {...params} {...textFieldProps} />}
    />
  );
};
