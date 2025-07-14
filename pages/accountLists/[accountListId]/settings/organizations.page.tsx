import { useRouter } from 'next/router';
import React, { ReactElement, useEffect, useState } from 'react';
import { Box, Skeleton } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { ensureSessionAndAccountList } from 'pages/api/utils/pagePropsHelpers';
import { ImpersonateUserAccordion } from 'src/components/Settings/Organization/ImpersonateUser/ImpersonateUserAccordion';
import { ManageOrganizationAccessAccordion } from 'src/components/Settings/Organization/ManageOrganizationAccess/ManageOrganizationAccessAccordion';
import { OrganizationAccordion } from 'src/components/Shared/Forms/Accordions/AccordionEnum';
import { AccordionGroup } from 'src/components/Shared/Forms/Accordions/AccordionGroup';
import { OrganizationAutocomplete } from 'src/components/common/Autocomplete/OrganizationAutocomplete/OrganizationAutocomplete';
import { Organizations as OrganizationsType } from 'src/graphql/types.generated';
import { SettingsWrapper } from './Wrapper';
import { useOrganizationsQuery } from './organizations.generated';

export type OrganizationsContextType = {
  selectedOrganizationId: string;
};
export const OrganizationsContext =
  React.createContext<OrganizationsContextType | null>(null);

interface OrganizationsContextProviderProps {
  children: React.ReactNode;
  selectedOrganizationId: string;
}
export const OrganizationsContextProvider: React.FC<
  OrganizationsContextProviderProps
> = ({ children, selectedOrganizationId }) => {
  return (
    <OrganizationsContext.Provider value={{ selectedOrganizationId }}>
      {children}
    </OrganizationsContext.Provider>
  );
};

const HeaderAndDropdown = styled(Box)(() => ({
  fontSize: '16px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
}));

const Organizations = (): ReactElement => {
  const { t } = useTranslation();
  const { query } = useRouter();
  const [expandedAccordion, setExpandedAccordion] =
    useState<OrganizationAccordion | null>(
      typeof query.selectedTab === 'string'
        ? (query.selectedTab as OrganizationAccordion)
        : OrganizationAccordion.ImpersonateUser,
    );

  const [selectedOrganization, setSelectedOrganization] = useState<
    OrganizationsType | null | undefined
  >();
  const { data } = useOrganizationsQuery();

  const organizations = data?.getOrganizations.organizations;

  useEffect(() => {
    setSelectedOrganization(organizations?.[0]);
  }, [organizations]);

  return (
    <OrganizationsContextProvider
      selectedOrganizationId={selectedOrganization?.id ?? ''}
    >
      <SettingsWrapper
        pageTitle={t('Organizations')}
        pageHeading={t('Organizations')}
        selectedMenuId="organizations"
      >
        {!organizations?.length && !selectedOrganization && (
          <HeaderAndDropdown>
            <Skeleton height={'58px'} width={'250px'} />
            <Skeleton height={'58px'} width={'250px'} />
          </HeaderAndDropdown>
        )}
        {!!organizations?.length && selectedOrganization && (
          <HeaderAndDropdown>
            <Box>
              <h2>
                {t('Manage {{organizationName}}', {
                  organizationName: selectedOrganization.name,
                })}
              </h2>
            </Box>
            <Box>
              <OrganizationAutocomplete
                style={{
                  width: '250px',
                }}
                autoSelect
                autoHighlight
                disableClearable
                organizations={organizations}
                value={selectedOrganization ?? undefined}
                onChange={(_, organization): void => {
                  setSelectedOrganization(organization as OrganizationsType);
                }}
              />
            </Box>
          </HeaderAndDropdown>
        )}
        <AccordionGroup title={t('External Services')}>
          <ImpersonateUserAccordion
            handleAccordionChange={setExpandedAccordion}
            expandedAccordion={expandedAccordion}
          />

          <ManageOrganizationAccessAccordion
            handleAccordionChange={setExpandedAccordion}
            expandedAccordion={expandedAccordion}
          />
        </AccordionGroup>
      </SettingsWrapper>
    </OrganizationsContextProvider>
  );
};

export const getServerSideProps = ensureSessionAndAccountList;

export default Organizations;
