import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Grid,
  Box,
  Button,
  IconButton,
  Typography,
  Card,
  Divider,
} from '@mui/material';
import { DateTime } from 'luxon';
import theme from 'src/theme';
import DeleteIcon from '@mui/icons-material/Delete';
import Edit from '@mui/icons-material/Edit';
import { styled } from '@mui/material/styles';
import { AccordionItem } from 'src/components/Shared/Forms/Accordions/AccordionItem';
import { OrganizationAddAccountModal } from './OrganizationAddAccountModal';
import { OrganizationImportDataSyncModal } from './OrganizationImportDataSyncModal';
import { useGetUsersOrganizationsQuery } from './Organizations.generated';
import { Organization } from '../../../../../graphql/types.generated';

interface OrganizationAccordianProps {
  handleAccordionChange: (panel: string) => void;
  expandedPanel: string;
}

const StyledServicesButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(2),
}));

const OrganizationDeleteIconButton = styled(IconButton)(() => ({
  color: theme.palette.cruGrayMedium.main,
  marginLeft: '10px',
  '&:disabled': {
    cursor: 'not-allowed',
    pointerEvents: 'all',
  },
}));

export enum OrganizationTypesEnum {
  MINISTRY = 'ministry',
  LOGIN = 'login',
  OAUTH = 'oauth',
  OFFLINE = 'offline',
}

export const getOrganizationType = (apiClass, oauth) => {
  const ministryAccount = [
    'Siebel',
    'Remote::Import::OrganizationAccountService',
  ];
  const loginRequired = [
    'DataServer',
    'DataServerPtc',
    'DataServerNavigators',
    'DataServerStumo',
  ];
  const offline = ['OfflineOrg'];

  if (apiClass) {
    if (ministryAccount.indexOf(apiClass) !== -1) {
      return OrganizationTypesEnum.MINISTRY;
    } else if (loginRequired.indexOf(apiClass) !== -1 && !oauth) {
      return OrganizationTypesEnum.LOGIN;
    } else if (oauth) {
      return OrganizationTypesEnum.OAUTH;
    } else if (offline.indexOf(apiClass) !== -1) {
      return OrganizationTypesEnum.OFFLINE;
    }
  }
  return undefined;
};

export const OrganizationAccordian: React.FC<OrganizationAccordianProps> = ({
  handleAccordionChange,
  expandedPanel,
}) => {
  const { t } = useTranslation();
  const [selectedOrganization, setSelectedOrganization] =
    useState<Omit<Organization, 'createdAt' | 'updatedAt'>>();
  const [showAddAccountModal, setShowAddAccountModal] = useState(false);
  const [showSyncAccountModal, setShowSyncAccountModal] = useState(false);
  const [showImportDataSyncModal, setShowImportDataSyncModal] = useState(false);
  const [showReconnectModal, setShowReconnectModal] = useState(false);

  const { data, loading } = useGetUsersOrganizationsQuery();
  const organizations = data?.userOrganizationAccounts;

  return (
    <AccordionItem
      onAccordionChange={handleAccordionChange}
      expandedPanel={expandedPanel}
      label={t('Organization')}
      value={''}
      image={
        <img
          src="https://mpdx.org/681865a8b19bbf7a86ee68825106de3f.png"
          alt="Organization"
          style={{
            maxWidth: '80px',
          }}
        />
      }
    >
      <Typography>
        Add or change the organizations that sync donation information with this
        MPDX account. Removing an organization will not remove past information,
        but will prevent future donations and contacts from syncing.
      </Typography>

      {!loading && !organizations?.length && (
        <Typography variant="h5" style={{ marginTop: '20px' }}>
          Let&apos;s start by connecting to your first organization
        </Typography>
      )}

      {!loading && !!organizations?.length && (
        <Box style={{ marginTop: '20px' }}>
          {organizations.map(
            ({ organization, lastDownloadedAt, latestDonationDate }) => {
              const type = getOrganizationType(
                organization.apiClass,
                organization.oauth,
              );

              return (
                <Card key={organization.id}>
                  <Box
                    sx={{
                      p: 1,
                      pl: 2,
                      background: theme.palette.cruGrayLight.main,
                      justifyContent: 'space-between',
                      display: 'flex',
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      <Typography fontWeight={700}>
                        {organization.name}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      {type !== OrganizationTypesEnum.OFFLINE && (
                        <StyledServicesButton
                          variant="contained"
                          size="small"
                          sx={{ m: '0 0 0 10px' }}
                          onClick={() => {
                            setSelectedOrganization(organization);
                            setShowSyncAccountModal(true);
                          }}
                        >
                          Sync
                        </StyledServicesButton>
                      )}

                      {type === OrganizationTypesEnum.OFFLINE && (
                        <StyledServicesButton
                          variant="contained"
                          size="small"
                          sx={{ m: '0 0 0 10px' }}
                          onClick={() => {
                            setSelectedOrganization(organization);
                            setShowImportDataSyncModal(true);
                          }}
                        >
                          Import TntConnect DataSync file
                        </StyledServicesButton>
                      )}

                      {type === OrganizationTypesEnum.OAUTH && (
                        <StyledServicesButton
                          variant="contained"
                          size="small"
                          sx={{ m: '0 0 0 10px' }}
                          onClick={() => {
                            setSelectedOrganization(organization);
                            setShowReconnectModal(true);
                          }}
                        >
                          Reconnect
                        </StyledServicesButton>
                      )}
                      {type === OrganizationTypesEnum.LOGIN && (
                        <OrganizationDeleteIconButton>
                          <Edit />
                        </OrganizationDeleteIconButton>
                      )}
                      <OrganizationDeleteIconButton>
                        <DeleteIcon />
                      </OrganizationDeleteIconButton>
                    </Box>
                  </Box>
                  <Divider />
                  <Box sx={{ p: 2, display: 'flex' }}>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        Last Updated
                      </Grid>
                      {lastDownloadedAt && (
                        <Grid item xs={6}>
                          {DateTime.fromISO(lastDownloadedAt).toRelative()}
                        </Grid>
                      )}
                    </Grid>
                  </Box>
                  <Box sx={{ p: 2, display: 'flex' }}>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        Last Gift Date
                      </Grid>
                      {latestDonationDate && (
                        <Grid item xs={6}>
                          {DateTime.fromISO(latestDonationDate).toRelative()}
                        </Grid>
                      )}
                    </Grid>
                  </Box>
                </Card>
              );
            },
          )}
        </Box>
      )}

      <StyledServicesButton
        variant={!!organizations?.length ? 'outlined' : 'contained'}
        onClick={() => setShowAddAccountModal(true)}
      >
        Add Account
      </StyledServicesButton>

      {showAddAccountModal && (
        <OrganizationAddAccountModal
          handleClose={() => setShowAddAccountModal(false)}
        />
      )}
      {showSyncAccountModal && (
        <OrganizationAddAccountModal
          handleClose={() => setShowSyncAccountModal(false)}
        />
      )}
      {showImportDataSyncModal && (
        <OrganizationImportDataSyncModal
          handleClose={() => setShowImportDataSyncModal(false)}
          organization={selectedOrganization}
        />
      )}
      {showReconnectModal && (
        <OrganizationAddAccountModal
          handleClose={() => setShowSyncAccountModal(false)}
        />
      )}
    </AccordionItem>
  );
};
