import { ReactElement } from 'react';
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
  TextFieldProps?: Partial<TextFieldProps>;
  inputProps?: Partial<React.InputHTMLAttributes<HTMLInputElement>>;
}

export const DesignationAccountAutocomplete = ({
  accountListId,
  TextFieldProps,
  inputProps,
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
      {...props}
      autoSelect
      autoHighlight
      options={designationAccounts?.map(({ id }) => id) ?? []}
      getOptionLabel={(accountId): string => {
        const account = designationAccounts?.find(({ id }) => id === accountId);
        return account ? `${account?.name} (${account.id})` : '';
      }}
      renderInput={(params): ReactElement => (
        <TextField
          {...params}
          {...TextFieldProps}
          InputProps={{
            ...params.InputProps,
            inputProps: {
              ...params.inputProps,
              ...inputProps,
            },
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
    />
  );
};
