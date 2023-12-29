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
import { AccountLists } from 'src/components/Settings/Organization/AccountLists/AccountLists';
import { useDebouncedValue } from 'src/hooks/useDebounce';
import { enforceAdmin } from 'src/lib/enforceAdmin';
import {
  SettingsOrganizationFragment,
  useOrganizationsQuery,
} from '../organizations.generated';
import { SettingsWrapper } from '../wrapper';
import { OrganizationsContextProvider } from './OrganizationsContext';

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
    SettingsOrganizationFragment | null | undefined
  >();
  const { data } = useOrganizationsQuery();
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
                value={selectedOrganization?.id ?? null}
                onChange={(_, organization): void => {
                  const org = organizations?.find(
                    (org) => org?.id === organization,
                  );
                  setSelectedOrganization(org);
                }}
              />
            </Box>
          </HeaderAndDropdown>
        )}

        <AccountLists />
      </SettingsWrapper>
    </OrganizationsContextProvider>
  );
};

export const getServerSideProps = enforceAdmin;

export default AccountListsOrganizations;
