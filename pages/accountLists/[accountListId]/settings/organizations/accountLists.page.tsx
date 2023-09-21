import React, { ReactElement, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Skeleton,
  Autocomplete,
  TextField,
  InputAdornment,
} from '@mui/material';
import useMediaQuery from '@mui/material/useMediaQuery';
import PersonSearchIcon from '@mui/icons-material/PersonSearch';
import { styled } from '@mui/material/styles';
import { useDebouncedValue } from 'src/hooks/useDebounce';
import * as Types from '../../../../../graphql/types.generated';
import { AccountLists } from 'src/components/Settings/Organization/AccountLists/AccountLists';
import { useGetOrganizationsQuery } from '../organizations.generated';
import { SettingsWrapper } from '../wrapper';
import { OrganizationsContextProvider } from './organizationsContext';

const HeaderAndDropdown = styled(Box)(() => ({
  fontSize: '16px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
}));

const AccountListsOrganizations = (): ReactElement => {
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
  const { data } = useGetOrganizationsQuery();
  const organizations = data?.getOrganizations.organizations;
  const contactSearch = useDebouncedValue(search, 1000);

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
        pageTitle={t('Organizations Account Lists')}
        pageHeading={t('Organizations Account Lists')}
        selectedMenuId="organizations/accountLists"
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
                  label={t('Search Account Lists')}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  fullWidth
                  multiline
                  inputProps={{ 'aria-label': 'Search Account Lists' }}
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

        <AccountLists />
      </SettingsWrapper>
    </OrganizationsContextProvider>
  );
};

export default AccountListsOrganizations;
