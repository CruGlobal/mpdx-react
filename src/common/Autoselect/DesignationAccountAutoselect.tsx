import { ReactElement } from 'react';
import {
  Autocomplete,
  AutocompleteProps,
  CircularProgress,
  MenuItem,
  Select,
  SelectProps,
  TextField,
  TextFieldProps,
} from '@mui/material';
import { useGetDesignationAccountsQuery } from 'src/components/EditDonationModal/EditDonationModal.generated';

type ComponentType = 'select' | 'autocomplete';

interface BaseProps {
  componentType: ComponentType;
  accountListId: string;
}

type DesignationAccount = any;
interface DesignationAccountAutocompleteProps
  extends BaseProps,
    Partial<AutocompleteProps<DesignationAccount, boolean, boolean, false>> {
  componentType: 'autocomplete';
  TextFieldProps?: Partial<TextFieldProps>;
}

type DesignationAccountSelectProps = BaseProps &
  Partial<SelectProps<DesignationAccount>> & {
    componentType: 'select';
  };

type DesignationAccountAutoselectProps =
  | DesignationAccountSelectProps
  | DesignationAccountAutocompleteProps;

export const DesignationAccountAutoselect = (
  props: DesignationAccountAutoselectProps,
): JSX.Element => {
  const { componentType, accountListId } = props;
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

  if (componentType === 'select') {
    const { ...selectProps } = props;
    return (
      <Select {...selectProps}>
        {designationAccounts?.map((account) => (
          <MenuItem key={account.id} value={account.id}>
            {account.name || account.designationNumber}
          </MenuItem>
        ))}
      </Select>
    );
  } else if (componentType === 'autocomplete') {
    const { TextFieldProps, ...autocompleteProps } =
      props as DesignationAccountAutocompleteProps;
    return (
      <Autocomplete
        {...autocompleteProps}
        autoSelect
        autoHighlight
        options={designationAccounts?.map(({ id }) => id) ?? []}
        getOptionLabel={(accountId): string => {
          const account = designationAccounts?.find(
            ({ id }) => id === accountId,
          );
          return account ? `${account?.name} (${account.id})` : '';
        }}
        renderInput={(params): ReactElement => (
          <TextField
            {...params}
            {...TextFieldProps}
            size="small"
            variant="outlined"
            InputProps={{
              ...params.InputProps,
              'aria-labelledby': 'designation-account-label',
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
  } else {
    return <div></div>;
  }
};
