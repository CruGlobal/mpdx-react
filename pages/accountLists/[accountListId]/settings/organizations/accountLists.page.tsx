import React, { ReactElement, useState } from 'react';
import PersonSearchIcon from '@mui/icons-material/PersonSearch';
import {
  Autocomplete,
  Box,
  InputAdornment,
  Skeleton,
  TextField,
  Tooltip,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTranslation } from 'react-i18next';
import { enforceAdmin } from 'pages/api/utils/pagePropsHelpers';
import { AccountLists } from 'src/components/Settings/Organization/AccountLists/AccountLists';
import { useDebouncedValue } from 'src/hooks/useDebounce';
import { SettingsWrapper } from '../Wrapper';
import {
  SettingsOrganizationFragment,
  useOrganizationsQuery,
} from '../organizations.generated';
import { OrganizationsContextProvider } from './OrganizationsContext';

const HeaderAndDropdown = styled(Box)(() => ({
  fontSize: '16px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
}));

type SelectedOrg = SettingsOrganizationFragment | null | undefined;

const AccountListsOrganizations = (): ReactElement => {
  const { t } = useTranslation();
  const savedOrg = window.localStorage.getItem('admin-org');
  const selectedOrg: SelectedOrg = savedOrg ? JSON.parse(savedOrg) : null;

  const [search, setSearch] = useState('');
  const isNarrowScreen = useMediaQuery('(max-width:600px)');
  const [selectedOrganization, setSelectedOrganization] = useState<
    SettingsOrganizationFragment | null | undefined
  >(selectedOrg);
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
      selectedOrganizationName={selectedOrganization?.name ?? ''}
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
            <Skeleton height={'58px'} width={'250px'} data-testid="skeleton" />
            <Skeleton height={'58px'} width={'250px'} />
          </HeaderAndDropdown>
        )}
        {organizations?.length && (
          <HeaderAndDropdown>
            <Box>
              {selectedOrganization && (
                <Tooltip
                  title={t('Search by name, email or account number')}
                  placement={'bottom'}
                  arrow
                >
                  <TextField
                    label={t('Search Account Lists')}
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                    }}
                    fullWidth
                    inputProps={{ 'aria-label': 'Search Account Lists' }}
                    style={{
                      width: isNarrowScreen ? '150px' : '250px',
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PersonSearchIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Tooltip>
              )}
            </Box>
            <Box>
              <Autocomplete
                style={{
                  width: isNarrowScreen ? '150px' : '350px',
                }}
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
                  org &&
                    window.localStorage.setItem(
                      `admin-org`,
                      JSON.stringify(org),
                    );
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
