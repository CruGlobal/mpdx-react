import { FocusEventHandler } from 'react';
import {
  Autocomplete,
  BaseTextFieldProps,
  CircularProgress,
  TextField,
  TextFieldProps,
} from '@mui/material';
import { map, unionBy } from 'lodash';
import { useDebouncedCallback } from 'src/hooks/useDebounce';
import { useGetDonorAccountsLazyQuery } from './DonorAccountAutocomplete.generated';

export interface DonorAccountAutocompleteProps {
  accountListId: string;
  onChange: (donorAccountId: string | null) => void;
  onBlur?: FocusEventHandler<HTMLDivElement>;
  value: string;
  preloadedDonors?: Array<{ id: string; name: string }>;
  autocompleteId?: string;
  labelId?: string;
  label?: string;
  size?: BaseTextFieldProps['size'];
  textFieldProps?: Partial<TextFieldProps>;
}

export const DonorAccountAutocomplete: React.FC<
  DonorAccountAutocompleteProps
> = ({
  accountListId,
  onChange,
  onBlur,
  value,
  preloadedDonors = [],
  autocompleteId,
  labelId,
  label,
  size,
  textFieldProps,
}) => {
  const [searchForDonorAccounts, { loading, data: donorAccountData }] =
    useGetDonorAccountsLazyQuery();

  const handleDonorAccountSearch = useDebouncedCallback(
    (searchTerm: string) =>
      searchForDonorAccounts({ variables: { accountListId, searchTerm } }),
    500,
  );

  // For the auto complete to be able to display the initially selected donor, it has to have an
  // option for that donor. Since the donor won't be available until after the get donor
  // accounts query returns, allow the parent to pass in already-loaded donors to augment the
  // server-loaded donor list.
  const donors = unionBy(
    donorAccountData?.accountListDonorAccounts ?? [],
    preloadedDonors,
    'id',
  );

  return (
    <Autocomplete
      id={autocompleteId}
      autoSelect
      autoHighlight
      loading={loading}
      options={map(donors, 'id')}
      getOptionLabel={(donorAccountId) =>
        donors.find((donor) => donor.id === donorAccountId)?.name ?? ''
      }
      renderInput={(params) => (
        <TextField
          {...params}
          {...textFieldProps}
          size={size}
          variant="outlined"
          label={label}
          onChange={(e) => handleDonorAccountSearch(e.target.value)}
          InputProps={{
            ...params.InputProps,
            'aria-labelledby': labelId,
            endAdornment: (
              <>
                {loading && <CircularProgress color="primary" size={20} />}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
          required
        />
      )}
      value={value}
      onChange={(_, donorAccountId) => onChange(donorAccountId)}
      onBlur={onBlur}
    />
  );
};
