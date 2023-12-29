import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import React, { ReactElement, useEffect, useState } from 'react';
import { Autocomplete, Box, Skeleton, TextField } from '@mui/material';
import { styled } from '@mui/material/styles';
import { getSession } from 'next-auth/react';
import { useTranslation } from 'react-i18next';
import { ImpersonateUserAccordion } from 'src/components/Settings/Organization/ImpersonateUser/ImpersonateUserAccordion';
import { ManageOrganizationAccessAccordion } from 'src/components/Settings/Organization/ManageOrganizationAccess/ManageOrganizationAccessAccordion';
import { AccordionGroup } from 'src/components/Shared/Forms/Accordions/AccordionGroup';
import { suggestArticles } from 'src/lib/helpScout';
import {
  SettingsOrganizationFragment,
  useOrganizationsQuery,
} from './organizations.generated';
import { SettingsWrapper } from './wrapper';

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
  const router = useRouter();
  const [expandedPanel, setExpandedPanel] = useState('');

  const [selectedOrganization, setSelectedOrganization] = useState<
    SettingsOrganizationFragment | null | undefined
  >();
  const { data } = useOrganizationsQuery();

  const organizations = data?.getOrganizations.organizations;

  useEffect(() => {
    setSelectedOrganization(organizations?.[0]);
  }, [organizations]);

  useEffect(() => {
    suggestArticles('HS_SETTINGS_SERVICES_SUGGESTIONS');
    if (router.query?.selectedTab) {
      setExpandedPanel(router.query.selectedTab as string);
    } else setExpandedPanel('Impersonate User');
  }, []);

  const handleAccordionChange = (panel: string) => {
    const panelLowercase = panel.toLowerCase();
    setExpandedPanel(expandedPanel === panelLowercase ? '' : panelLowercase);
  };

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
        {organizations?.length && selectedOrganization ? (
          <HeaderAndDropdown>
            <Box>
              <h2>
                {t('Manage {{organizationName}}', {
                  organizationName: selectedOrganization.name,
                })}
              </h2>
            </Box>
            <Box>
              <Autocomplete
                style={{
                  width: '250px',
                }}
                autoSelect
                autoHighlight
                disableClearable
                options={organizations?.map((org) => org?.id) || []}
                getOptionLabel={(orgId) =>
                  organizations.find((org) => org?.id === orgId)?.name ?? ''
                }
                renderInput={(params): ReactElement => (
                  <TextField
                    {...params}
                    label={t('Organization')}
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
              />
            </Box>
          </HeaderAndDropdown>
        ) : null}
        <AccordionGroup title={t('External Services')}>
          <ImpersonateUserAccordion
            handleAccordionChange={handleAccordionChange}
            expandedPanel={expandedPanel}
          />

          <ManageOrganizationAccessAccordion
            handleAccordionChange={handleAccordionChange}
            expandedPanel={expandedPanel}
          />
        </AccordionGroup>
      </SettingsWrapper>
    </OrganizationsContextProvider>
  );
};

// Redirect back to the dashboard if the user isn't an admin
export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context);
  if (!session?.user.admin) {
    return {
      redirect: {
        destination: `/accountLists/${context.query.accountListId ?? ''}`,
        permanent: false,
      },
    };
  }
  return {
    props: {},
  };
};

export default Organizations;
