import { ChangeEventHandler, useCallback, useMemo, useState } from 'react';
import {
  Autocomplete,
  AutocompleteProps,
  CircularProgress,
  TextField,
} from '@mui/material';
import { debounce } from 'lodash';
import { useTranslation } from 'react-i18next';
import { useContactOptionsQuery } from './ContactsAutocomplete.generated';

type AutocompletePropsOverride = Omit<
  AutocompleteProps<string, boolean, boolean, boolean>,
  'onChange' | 'multiple' | 'value'
>;

interface ContactsAutocompleteProps extends Partial<AutocompletePropsOverride> {
  accountListId: string;
  value: string[] | string;
  onChange: (value: string[] | string) => void;
  multiple?: boolean;
  textFieldLabel?: string;
  excludeContactIds?: string[];
  disabled?: boolean;
  referral?:
    | { id: string; referredBy: { id: string; name: string } }
    | undefined;
}

export const ContactsAutocomplete: React.FC<ContactsAutocompleteProps> = ({
  accountListId,
  value,
  onChange,
  referral,
  textFieldLabel,
  excludeContactIds = [],
  multiple = true,
  disabled = false,
  ...props
}) => {
  const { t } = useTranslation();

  const [searchTerm, setSearchTerm] = useState(referral?.referredBy.name ?? '');

  const handleSearchTermChange = useCallback<
    ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>
  >(
    debounce((event) => setSearchTerm(event.target.value), 500),
    [],
  );

  // There are too many contacts to display all of them as options, so we load the contacts that
  // the user has selected and the contacts matching the user's current search, and merge the results

  const contactsFilters = excludeContactIds.length
    ? {
        wildcardSearch: searchTerm,
        ids: excludeContactIds,
        reverseIds: true,
      }
    : { wildcardSearch: searchTerm };

  const {
    data: currentSearchedContacts,
    previousData: previousSearchedContacts,
    loading: loadingFilteredByName,
  } = useContactOptionsQuery({
    variables: {
      accountListId,
      first: 10,
      contactsFilters,
    },
  });
  // When this query loads contacts once and the user changes the search query, `data` will be
  // undefined while the next query is loading. To avoid throwing away the contacts that we already
  // loaded, we fallback to using `previousData` if is is available.
  const searchedContacts =
    (currentSearchedContacts || previousSearchedContacts)?.contacts.nodes ?? [];

  const {
    data: currentSelectedContacts,
    previousData: previousSelectedContacts,
    loading: loadingFilteredById,
  } = useContactOptionsQuery({
    variables: {
      accountListId,
      first: Array.isArray(value) ? value.length : 1,
      contactsFilters: {
        ids: Array.isArray(value) ? value : [value],
        // When the status filter is omitted, only contacts with an active status are loaded. But
        // we need to load hidden contacts as well in case the user is adding a task to a hidden
        // contact. Setting status to an empty array overrides the default status filter and loads
        // contacts with any status.
        status: [],
      },
    },
    skip: Array.isArray(value) ? value.length === 0 : !value,
  });
  const selectedContacts =
    (currentSelectedContacts || previousSelectedContacts)?.contacts.nodes ?? [];

  const loading = loadingFilteredById || loadingFilteredByName;

  // Merge the two sources of contact options and deduplicate by contact id
  const options = useMemo(
    () =>
      [...searchedContacts, ...selectedContacts].filter(
        (contact1, index, self) =>
          self.findIndex((contact2) => contact2.id === contact1.id) === index,
      ),
    [searchedContacts, selectedContacts],
  );

  return (
    <Autocomplete
      openOnFocus
      {...props}
      autoSelect
      multiple={multiple}
      disabled={disabled}
      loading={loading}
      options={options
        .slice()
        .sort((a, b) => a.name.localeCompare(b.name))
        .map(({ id }) => id)}
      getOptionLabel={(contactId) =>
        options.find(({ id }) => id === contactId)?.name ?? ''
      }
      renderInput={(params) => (
        <TextField
          {...params}
          onChange={handleSearchTermChange}
          label={t(textFieldLabel ?? 'Contacts')}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {loading && <CircularProgress color="primary" size={20} />}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
      value={value}
      onChange={(event, newValue) => {
        if (
          multiple &&
          Array.isArray(newValue) &&
          event.type === 'blur' &&
          newValue.length < value.length
        ) {
          // Prevent tabbing out of the field from deselecting an item, while still
          // allowing tab to select the highlighted item
          return;
        }

        onChange(newValue ?? (multiple ? [] : ''));
      }}
    />
  );
};
