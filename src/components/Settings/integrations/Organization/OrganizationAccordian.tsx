import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Grid,
  Box,
  IconButton,
  Typography,
  Card,
  Divider,
} from '@mui/material';
import { DateTime } from 'luxon';
import { useSnackbar } from 'notistack';
import theme from 'src/theme';
import DeleteIcon from '@mui/icons-material/Delete';
import Edit from '@mui/icons-material/Edit';
import { styled } from '@mui/material/styles';
import { AccordionItem } from 'src/components/Shared/Forms/Accordions/AccordionItem';
import { OrganizationAddAccountModal } from './Modals/OrganizationAddAccountModal';
import { OrganizationImportDataSyncModal } from './Modals/OrganizationImportDataSyncModal';
import {
  useGetUsersOrganizationsQuery,
  useDeleteOrganizationAccountMutation,
  useSyncOrganizationAccountMutation,
} from './Organizations.generated';
import { oAuth } from './OrganizationService';
import { Confirmation } from 'src/components/common/Modal/Confirmation/Confirmation';
import { useAccountListId } from 'src/hooks/useAccountListId';
import { OrganizationEditAccountModal } from './Modals/OrganizationEditAccountModal';
import { StyledServicesButton } from '../integrationsHelper';

interface OrganizationAccordianProps {
  handleAccordionChange: (panel: string) => void;
  expandedPanel: string;
}

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
  const accountListId = useAccountListId();
  const { enqueueSnackbar } = useSnackbar();
  const [showAddAccountModal, setShowAddAccountModal] = useState(false);
  const [showImportDataSyncModal, setShowImportDataSyncModal] = useState(false);
  const [showDeleteOrganizationModal, setShowDeleteOrganizationModal] =
    useState(false);
  const [showEditOrganizationModal, setShowEditOrganizationModal] =
    useState(false);
  const [deleteOrganizationAccount] = useDeleteOrganizationAccountMutation();
  const [syncOrganizationAccount] = useSyncOrganizationAccountMutation();

  const {
    data,
    loading,
    refetch: refetchOrganizations,
  } = useGetUsersOrganizationsQuery();
  const organizations = data?.userOrganizationAccounts;

  const handleReconnect = async (organizationId) => {
    enqueueSnackbar(
      t('Redirecting you to complete authenication to reconnect.'),
      { variant: 'success' },
    );
    const oAuthUrl = await oAuth(organizationId);
    window.location.href = oAuthUrl;
  };

  const handleSync = async (accountId: string) => {
    await syncOrganizationAccount({
      variables: {
        input: {
          id: accountId,
        },
      },
      onError: () => {
        enqueueSnackbar(t("MPDX couldn't sync your organization account"), {
          variant: 'error',
        });
      },
      onCompleted: () => {
        enqueueSnackbar(
          t(
            'MPDX started syncing your organization account. This will occur in the background over the next 24-hours.',
          ),
          {
            variant: 'success',
          },
        );
      },
    });
  };

  const handleDelete = async (accountId: string) => {
    await deleteOrganizationAccount({
      variables: {
        input: {
          id: accountId,
        },
      },
      update: () => refetchOrganizations(),
      onError: () => {
        enqueueSnackbar(
          t(
            "MPDX couldn't save your configuration changes for that organization",
          ),
          {
            variant: 'error',
          },
        );
      },
      onCompleted: () => {
        enqueueSnackbar(t('MPDX removed your organization integration'), {
          variant: 'success',
        });
      },
    });
  };

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
        {t(`Add or change the organizations that sync donation information with this
        MPDX account. Removing an organization will not remove past information,
        but will prevent future donations and contacts from syncing.`)}
      </Typography>

      {!loading && !organizations?.length && (
        <Typography variant="h5" style={{ marginTop: '20px' }}>
          {t("Let's start by connecting to your first organization")}
        </Typography>
      )}

      {!loading && !!organizations?.length && (
        <Box style={{ marginTop: '20px' }}>
          {organizations.map(
            ({ organization, lastDownloadedAt, latestDonationDate, id }) => {
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
                          onClick={() => handleSync(id)}
                        >
                          Sync
                        </StyledServicesButton>
                      )}

                      {type === OrganizationTypesEnum.OFFLINE && (
                        <StyledServicesButton
                          variant="contained"
                          size="small"
                          sx={{ m: '0 0 0 10px' }}
                          onClick={() => setShowImportDataSyncModal(true)}
                        >
                          Import TntConnect DataSync file
                        </StyledServicesButton>
                      )}

                      {type === OrganizationTypesEnum.OAUTH && (
                        <StyledServicesButton
                          variant="contained"
                          size="small"
                          sx={{ m: '0 0 0 10px' }}
                          onClick={() => handleReconnect(organization.id)}
                        >
                          Reconnect
                        </StyledServicesButton>
                      )}
                      {type === OrganizationTypesEnum.LOGIN && (
                        <OrganizationDeleteIconButton
                          onClick={() => setShowEditOrganizationModal(true)}
                        >
                          <Edit />
                        </OrganizationDeleteIconButton>
                      )}
                      <OrganizationDeleteIconButton
                        onClick={() => setShowDeleteOrganizationModal(true)}
                      >
                        <DeleteIcon />
                      </OrganizationDeleteIconButton>
                    </Box>
                  </Box>
                  <Divider />
                  {lastDownloadedAt && (
                    <Box sx={{ p: 2, display: 'flex' }}>
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          Last Updated
                        </Grid>
                        <Grid item xs={6}>
                          {DateTime.fromISO(lastDownloadedAt).toRelative()}
                        </Grid>
                      </Grid>
                    </Box>
                  )}
                  {latestDonationDate && (
                    <Box sx={{ p: 2, display: 'flex' }}>
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          Last Gift Date
                        </Grid>
                        <Grid item xs={6}>
                          {DateTime.fromISO(latestDonationDate).toRelative()}
                        </Grid>
                      </Grid>
                    </Box>
                  )}
                  <Confirmation
                    isOpen={showDeleteOrganizationModal}
                    title={t('Confirm')}
                    message={t(
                      'Are you sure you wish to disconnect this organization?',
                    )}
                    handleClose={() => setShowDeleteOrganizationModal(false)}
                    mutation={() => handleDelete(id)}
                  />
                  {showEditOrganizationModal && (
                    <OrganizationEditAccountModal
                      handleClose={() => setShowEditOrganizationModal(false)}
                      organizationId={id}
                    />
                  )}
                  {showImportDataSyncModal && (
                    <OrganizationImportDataSyncModal
                      handleClose={() => setShowImportDataSyncModal(false)}
                      organizationId={id}
                      organizationName={organization.name}
                      accountListId={accountListId ?? ''}
                    />
                  )}
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
          accountListId={accountListId}
          refetchOrganizations={refetchOrganizations}
        />
      )}
    </AccordionItem>
  );
};
