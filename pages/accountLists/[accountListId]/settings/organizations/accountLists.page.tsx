import React, { ReactElement, useEffect, useState } from 'react';
import PersonSearchIcon from '@mui/icons-material/PersonSearch';
import {
  Box,
  InputAdornment,
  Skeleton,
  TextField,
  Tooltip,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTranslation } from 'react-i18next';
import { ensureSessionAndAccountList } from 'pages/api/utils/pagePropsHelpers';
import { AccountLists } from 'src/components/Settings/Organization/AccountLists/AccountLists';
import { OrganizationAutocomplete } from 'src/components/common/Autocomplete/OrganizationAutocomplete/OrganizationAutocomplete';
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

const AccountListsOrganizations = (): ReactElement => {
  const { t } = useTranslation();
  const [selectedOrganization, setSelectedOrganization] = useState<
    SettingsOrganizationFragment | null | undefined
  >(null);

  const [search, setSearch] = useState('');
  const isNarrowScreen = useMediaQuery('(max-width:600px)');

  const { data } = useOrganizationsQuery();
  const organizations = data?.getOrganizations.organizations;
  const contactSearch = useDebouncedValue(search, 1000);

  const clearFilters = () => {
    setSearch('');
  };

  useEffect(() => {
    if (!window?.localStorage) {
      return;
    }
    const savedOrg = window.localStorage.getItem('admin-org');
    savedOrg && setSelectedOrganization(JSON.parse(savedOrg));
  }, []);

  const handleSelectedOrgChange = (organization): void => {
    const org = organizations?.find((org) => org?.id === organization);
    setSelectedOrganization(org);
    org && window.localStorage.setItem(`admin-org`, JSON.stringify(org));
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
              <OrganizationAutocomplete
                style={{
                  width: isNarrowScreen ? '150px' : '350px',
                }}
                autoSelect
                organizations={organizations}
                textFieldLabel={t('Filter by Organization')}
                value={selectedOrganization ?? undefined}
                onChange={(_, organization): void =>
                  handleSelectedOrgChange(organization)
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

export const getServerSideProps = ensureSessionAndAccountList;

export default AccountListsOrganizations;
