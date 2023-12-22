import React, { ReactElement, useState } from 'react';
import PersonSearchIcon from '@mui/icons-material/PersonSearch';
import {
  Autocomplete,
  Box,
  InputAdornment,
  Skeleton,
  TextField,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTranslation } from 'react-i18next';
import { Contacts } from 'src/components/Settings/Organization/Contacts/Contacts';
import * as Types from 'src/graphql/types.generated';
import { useDebouncedValue } from 'src/hooks/useDebounce';
import { useOrganizationsQuery } from '../organizations.generated';
import { SettingsWrapper } from '../wrapper';
import { OrganizationsContextProvider } from './organizationsContext';

const HeaderAndDropdown = styled(Box)(() => ({
  fontSize: '16px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
}));

const Organizations = (): ReactElement => {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const matches = useMediaQuery('(max-width:600px)');
  const [selectedOrganization, setSelectedOrganization] = useState<
    | Types.Maybe<
        {
          __typename?: 'Organizations' | undefined;
        } & Pick<Types.Organizations, 'id' | 'name'>
      >
    | undefined
  >();
  const { data } = useOrganizationsQuery();
  const organizations = data?.getOrganizations.organizations;
  // Deboounce 1.5 seconds since it calls a massive request on contactSearch change.
  const contactSearch = useDebouncedValue(search, 1500);

  const clearFilters = () => {
    setSearch('');
    setSelectedOrganization(undefined);
  };

  return (
    <OrganizationsContextProvider
      selectedOrganizationId={selectedOrganization?.id ?? ''}
      search={contactSearch}
      setSearch={setSearch}
      clearFilters={clearFilters}
    >
      <SettingsWrapper
        pageTitle={t('Organizations Contacts')}
        pageHeading={t('Organizations Contacts')}
        selectedMenuId="organizations/contacts"
      >
        {!organizations?.length && !selectedOrganization && (
          <HeaderAndDropdown>
            <Skeleton height={'58px'} width={'250px'} />
            <Skeleton height={'58px'} width={'250px'} />
          </HeaderAndDropdown>
        )}
        {organizations?.length && (
          <HeaderAndDropdown>
            <Box>
              {selectedOrganization && (
                <TextField
                  label={t('Search Contacts')}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  fullWidth
                  multiline
                  inputProps={{ 'aria-label': 'Search Contacts' }}
                  style={{
                    width: matches ? '150px' : '250px',
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonSearchIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            </Box>
            <Box>
              <Autocomplete
                style={{
                  width: matches ? '150px' : '250px',
                }}
                autoSelect
                autoHighlight
                options={organizations?.map((org) => org?.id) || []}
                getOptionLabel={(orgId) =>
                  organizations.find((org) => org?.id === orgId)?.name ?? ''
                }
                renderInput={(params): ReactElement => (
                  <TextField
                    {...params}
                    label={t('Filter by Organization')}
                    InputProps={{
                      ...params.InputProps,
                    }}
                  />
                )}
                value={selectedOrganization?.id}
                onChange={(_, organization): void => {
                  const org = organizations?.find(
                    (org) => org?.id === organization,
                  );
                  if (org) {
                    setSelectedOrganization(org);
                  }
                }}
                isOptionEqualToValue={(option, value): boolean =>
                  option === value
                }
              />
            </Box>
          </HeaderAndDropdown>
        )}
        {/* List of contacts */}
        <Contacts />
      </SettingsWrapper>
    </OrganizationsContextProvider>
  );
};

export default Organizations;
