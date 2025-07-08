import { FocusEventHandler, ReactElement } from 'react';
import {
  Autocomplete,
  AutocompleteProps,
  CircularProgress,
  TextField,
  TextFieldProps,
} from '@mui/material';
import { useGetDesignationAccountsQuery } from 'src/components/EditDonationModal/EditDonationModal.generated';

interface DesignationAccountAutocompleteProps
  extends Partial<AutocompleteProps<string, boolean, boolean, false>> {
  accountListId: string;
  onBlur?: FocusEventHandler<HTMLDivElement>;
  textFieldProps?: Partial<TextFieldProps>;
}

export const DesignationAccountAutocomplete = ({
  accountListId,
  onBlur,
  textFieldProps,
  ...props
}: DesignationAccountAutocompleteProps) => {
  const { data: designationAccountsData, loading: designationAccountsLoading } =
    useGetDesignationAccountsQuery({
      variables: {
        accountListId,
      },
    });

  const designationAccounts =
    designationAccountsData?.designationAccounts?.flatMap(
      ({ designationAccounts }) => designationAccounts,
    );

  return (
    <Autocomplete
      autoSelect
      autoHighlight
      {...props}
      options={designationAccounts?.map(({ id }) => id) ?? []}
      getOptionLabel={(accountId): string => {
        const account = designationAccounts?.find(({ id }) => id === accountId);
        return account ? `${account?.name} (${account.id})` : '';
      }}
      renderInput={(params): ReactElement => (
        <TextField
          {...params}
          {...textFieldProps}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {designationAccountsLoading && (
                  <CircularProgress color="primary" size={20} />
                )}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
      onBlur={onBlur}
    />
  );
};
