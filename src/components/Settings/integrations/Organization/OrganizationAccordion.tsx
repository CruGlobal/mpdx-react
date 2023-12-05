import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DateTime } from 'luxon';
import { useSnackbar } from 'notistack';
import { styled } from '@mui/material/styles';
import {
  Grid,
  Box,
  IconButton,
  Typography,
  Card,
  Divider,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import Edit from '@mui/icons-material/Edit';
import { useAccountListId } from 'src/hooks/useAccountListId';
import useGetAppSettings from 'src/hooks/useGetAppSettings';
import {
  useGetUsersOrganizationsQuery,
  useDeleteOrganizationAccountMutation,
  useSyncOrganizationAccountMutation,
} from './Organizations.generated';
import theme from 'src/theme';
import { AccordionItem } from 'src/components/Shared/Forms/Accordions/AccordionItem';
import { Confirmation } from 'src/components/common/Modal/Confirmation/Confirmation';
import { OrganizationAddAccountModal } from './Modals/OrganizationAddAccountModal';
import { OrganizationImportDataSyncModal } from './Modals/OrganizationImportDataSyncModal';
import { OrganizationEditAccountModal } from './Modals/OrganizationEditAccountModal';
import { getOauthUrl } from './OrganizationService';
import { StyledServicesButton } from '../integrationsHelper';

interface OrganizationAccordionProps {
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

export const getOrganizationType = (
  apiClass: string | undefined,
  oauth = false,
) => {
  const ministryAccount = new Set([
    'Siebel',
    'Remote::Import::OrganizationAccountService',
  ]);
  const loginRequired = new Set([
    'DataServer',
    'DataServerPtc',
    'DataServerNavigators',
    'DataServerStumo',
  ]);

  if (apiClass) {
    if (ministryAccount.has(apiClass)) {
      return OrganizationTypesEnum.MINISTRY;
    } else if (loginRequired.has(apiClass) && !oauth) {
      return OrganizationTypesEnum.LOGIN;
    } else if (oauth) {
      return OrganizationTypesEnum.OAUTH;
    } else if (apiClass === 'OfflineOrg') {
      return OrganizationTypesEnum.OFFLINE;
    }
  }
  return undefined;
};

export const OrganizationAccordion: React.FC<OrganizationAccordionProps> = ({
  handleAccordionChange,
  expandedPanel,
}) => {
  const { t } = useTranslation();
  const accountListId = useAccountListId();
  const { enqueueSnackbar } = useSnackbar();
  const { appName } = useGetAppSettings();
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
    const oAuthUrl = await getOauthUrl(organizationId);
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
        enqueueSnackbar(
          t("{{appName}} couldn't sync your organization account", { appName }),
          {
            variant: 'error',
          },
        );
      },
      onCompleted: () => {
        enqueueSnackbar(
          t(
            '{{appName}} started syncing your organization account. This will occur in the background over the next 24-hours.',
            { appName },
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
            "{{appName}} couldn't save your configuration changes for that organization",
            { appName },
          ),
          {
            variant: 'error',
          },
        );
      },
      onCompleted: () => {
        enqueueSnackbar(
          t('{{appName}} removed your organization integration', { appName }),
          {
            variant: 'success',
          },
        );
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
          src="/images/settings-preferences-intergrations-organizations.png"
          alt="Organization"
          style={{
            maxWidth: '80px',
          }}
        />
      }
    >
      <Typography>
        {t(
          `Add or change the organizations that sync donation information with this
        {{appName}} account. Removing an organization will not remove past information,
        but will prevent future donations and contacts from syncing.`,
          { appName },
        )}
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
                <Card key={organization.id} style={{ marginBottom: '20px' }}>
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
                          {t('Sync')}
                        </StyledServicesButton>
                      )}

                      {type === OrganizationTypesEnum.OFFLINE && (
                        <StyledServicesButton
                          variant="contained"
                          size="small"
                          sx={{ m: '0 0 0 10px' }}
                          onClick={() => setShowImportDataSyncModal(true)}
                        >
                          {t('Import TntConnect DataSync file')}
                        </StyledServicesButton>
                      )}

                      {type === OrganizationTypesEnum.OAUTH && (
                        <StyledServicesButton
                          variant="contained"
                          size="small"
                          sx={{ m: '0 0 0 10px' }}
                          onClick={() => handleReconnect(organization.id)}
                        >
                          {t('Reconnect')}
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
                          {t('Last Updated')}
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
                          {t('Last Gift Date')}
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
        {t('Add Account')}
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
