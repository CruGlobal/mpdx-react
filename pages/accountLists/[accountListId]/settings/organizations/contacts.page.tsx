import React, { ReactElement, useState } from 'react';
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
import { Contacts } from 'src/components/Settings/Organization/Contacts/Contacts';
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

const OrganizationsContacts = (): ReactElement => {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const isNarrowScreen = useMediaQuery('(max-width:600px)');
  const [selectedOrganization, setSelectedOrganization] = useState<
    SettingsOrganizationFragment | null | undefined
  >();
  const { data } = useOrganizationsQuery();
  const organizations = data?.getOrganizations.organizations;
  // Debounce 1.5 seconds since it calls a massive request on contactSearch change.
  const contactSearch = useDebouncedValue(search, 1500);

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
        pageTitle={t('Organizations Contacts')}
        pageHeading={t('Organizations Contacts')}
        selectedMenuId="organizations/contacts"
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
                  title={t('Search by name, phone, email or partner number')}
                  placement={'bottom'}
                  arrow
                >
                  <TextField
                    label={t('Search Contacts')}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    fullWidth
                    inputProps={{ 'aria-label': 'Search Contacts' }}
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
                autoHighlight
                organizations={organizations}
                textFieldLabel={t('Filter by Organization')}
                value={selectedOrganization ?? undefined}
                onChange={(_, organization) => {
                  setSelectedOrganization(
                    organization as SettingsOrganizationFragment,
                  );
                }}
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

export const getServerSideProps = ensureSessionAndAccountList;

export default OrganizationsContacts;
