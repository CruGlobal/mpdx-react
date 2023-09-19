import React, { ReactElement, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SettingsWrapper } from './wrapper';
import { suggestArticles } from 'src/lib/helpScout';
import { Box, Skeleton, Autocomplete, TextField } from '@mui/material';
import { AccordionGroup } from 'src/components/Shared/Forms/Accordions/AccordionGroup';
import { useRouter } from 'next/router';
import { ImpersonateUserAccordian } from 'src/components/Settings/Organization/ImpersonateUser/ImpersonateUserAccordian';
import { ManageOrganizationAccessAccordian } from 'src/components/Settings/Organization/ManageOrganizationAccess/ManageOrganizationAccessAccordian';
import { useGetOrganizationsQuery } from './organizations.generated';
import { styled } from '@mui/material/styles';
import * as Types from '../../../../graphql/types.generated';

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
    | Types.Maybe<
        {
          __typename?: 'Organizations' | undefined;
        } & Pick<Types.Organizations, 'id' | 'name'>
      >
    | undefined
  >();
  const { data } = useGetOrganizationsQuery();

  const organizations = data?.getOrganizations.organizations;

  useEffect(() => {
    if (!organizations) return;
    if (organizations[0]) setSelectedOrganization(organizations[0]);
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
        {organizations?.length && selectedOrganization && (
          <HeaderAndDropdown>
            <Box>
              <h2>Manage {selectedOrganization.name}</h2>
            </Box>
            <Box>
              <Autocomplete
                style={{
                  width: '250px',
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
                isOptionEqualToValue={(option, value): boolean =>
                  option === value
                }
              />
            </Box>
          </HeaderAndDropdown>
        )}
        <AccordionGroup title={t('External Services')}>
          <ImpersonateUserAccordian
            handleAccordionChange={handleAccordionChange}
            expandedPanel={expandedPanel}
          />

          <ManageOrganizationAccessAccordian
            handleAccordionChange={handleAccordionChange}
            expandedPanel={expandedPanel}
          />
        </AccordionGroup>
      </SettingsWrapper>
    </OrganizationsContextProvider>
  );
};

export default Organizations;
