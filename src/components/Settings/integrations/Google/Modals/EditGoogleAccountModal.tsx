import React, { useState } from 'react';
import {
  Box,
  Button,
  DialogActions,
  DialogContent,
  Skeleton,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import {
  ActionButton,
  CancelButton,
  SubmitButton,
} from 'src/components/common/Modal/ActionButtons/ActionButtons';
import Modal from 'src/components/common/Modal/Modal';
import { useAccountListId } from 'src/hooks/useAccountListId';
import useGetAppSettings from 'src/hooks/useGetAppSettings';
import { GoogleAccountAttributesSlimmed } from '../GoogleAccordion';
import { useSyncGoogleAccountMutation } from '../GoogleAccounts.generated';
import { EditGoogleIntegrationForm } from './EditGoogleIntegrationForm';
import {
  GoogleAccountIntegrationsDocument,
  GoogleAccountIntegrationsQuery,
  useCreateGoogleIntegrationMutation,
  useGoogleAccountIntegrationsQuery,
} from './googleIntegrations.generated';
import { useUpdateGoogleIntegrationMutation } from './updateGoogleIntegration.generated';

interface EditGoogleAccountModalProps {
  handleClose: () => void;
  account: GoogleAccountAttributesSlimmed;
  oAuth: string;
}

enum TabsEnum {
  Calendar = 'calendar',
  Setup = 'setup',
}

const StyledDialogActions = styled(DialogActions)(() => ({
  justifyContent: 'space-between',
}));

export const EditGoogleAccountModal: React.FC<EditGoogleAccountModalProps> = ({
  account,
  handleClose,
  oAuth,
}) => {
  const { t } = useTranslation();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const accountListId = useAccountListId();
  const { enqueueSnackbar } = useSnackbar();
  const { appName } = useGetAppSettings();
  const [tabSelected, setTabSelected] = useState<TabsEnum>(TabsEnum.Calendar);

  const [updateGoogleIntegration] = useUpdateGoogleIntegrationMutation();
  const [createGoogleIntegration] = useCreateGoogleIntegrationMutation();
  const [syncGoogleAccountQuery] = useSyncGoogleAccountMutation();
  const {
    data,
    loading,
    refetch: refetchGoogleIntegrations,
  } = useGoogleAccountIntegrationsQuery({
    variables: {
      input: {
        googleAccountId: account.id,
        accountListId: accountListId ?? '',
      },
    },
    skip: !accountListId,
  });

  const googleAccountDetails = data?.googleAccountIntegrations[0];

  const handleTabChange = (_, tab) => {
    setTabSelected(tab);
  };

  const handleToggleCalendarIntegration = async (
    enableIntegration: boolean,
  ) => {
    if (!tabSelected) return;
    setIsSubmitting(true);

    if (!googleAccountDetails && enableIntegration) {
      // Create Google Integration
      await createGoogleIntegration({
        variables: {
          input: {
            googleAccountId: account.id,
            accountListId: accountListId ?? '',
            googleIntegration: {
              [`${tabSelected}Integration`]: enableIntegration,
            },
          },
        },
        update: () => refetchGoogleIntegrations(),
      });
    } else if (googleAccountDetails) {
      // Update Google Inetgration
      await updateGoogleIntegration({
        variables: {
          input: {
            googleAccountId: account.id,
            googleIntegrationId: googleAccountDetails.id,
            googleIntegration: {
              [`${tabSelected}Integration`]: enableIntegration,
              overwrite: true,
            },
          },
        },
        update: (cache) => {
          const query = {
            query: GoogleAccountIntegrationsDocument,
            variables: {
              googleAccountId: account.id,
              accountListId,
            },
          };
          const dataFromCache =
            cache.readQuery<GoogleAccountIntegrationsQuery>(query);

          if (dataFromCache) {
            const data = {
              ...dataFromCache,
              [`${tabSelected}Integration`]: enableIntegration,
            };
            cache.writeQuery({ ...query, data });
          }
        },
      });
    } else {
      return;
    }

    enqueueSnackbar(
      enableIntegration
        ? t('Enabled Google Calendar Integration!')
        : t('Disabled Google Calendar Integration!'),
      {
        variant: 'success',
      },
    );
    setIsSubmitting(false);
  };

  const handleSyncCalendar = async () => {
    await syncGoogleAccountQuery({
      variables: {
        input: {
          googleAccountId: account.id,
          googleIntegrationId: googleAccountDetails?.id ?? '',
          integrationName: TabsEnum.Calendar,
        },
      },
    });
    enqueueSnackbar(t('Successfully Synced Calendar!'), {
      variant: 'success',
    });
  };

  return (
    <Modal
      isOpen={true}
      title={t('Edit Google Integration')}
      handleClose={handleClose}
      size={'sm'}
    >
      <DialogContent>
        <Typography>
          {t('You are currently editing settings for {{email}}', {
            email: account.email,
          })}
        </Typography>
        <Box
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            marginTop: '15px',
            marginBottom: '15px',
          }}
        >
          <Tabs
            value={tabSelected}
            onChange={handleTabChange}
            aria-label="tabs"
          >
            <Tab
              value={TabsEnum.Calendar}
              label="Calendar"
              style={{ width: '50%' }}
            />
            <Tab
              value={TabsEnum.Setup}
              label="Setup"
              style={{ width: '50%' }}
            />
          </Tabs>
        </Box>

        {loading && googleAccountDetails?.calendarIntegration && (
          <>
            <Skeleton height="90px" />
            <Skeleton height="300px" />
          </>
        )}

        {!loading &&
          googleAccountDetails?.calendarIntegration &&
          tabSelected === TabsEnum.Calendar && (
            <EditGoogleIntegrationForm
              googleAccountDetails={googleAccountDetails}
              loading={loading}
              setIsSubmitting={setIsSubmitting}
              account={account}
              handleToggleCalendarIntegration={handleToggleCalendarIntegration}
              handleClose={handleClose}
            />
          )}

        {!loading &&
          !googleAccountDetails?.calendarIntegration &&
          tabSelected === TabsEnum.Calendar && (
            <Typography>
              {t(
                `{{appName}} can automatically update your google calendar with your tasks.
            Once you enable this feature, you'll be able to choose which
            types of tasks you want to sync. By default {{appName}} will add
            'Appointment' tasks to your calendar.`,
                { appName },
              )}
            </Typography>
          )}

        {tabSelected === TabsEnum.Setup && (
          <Typography>
            {t(
              `If the link between {{appName}} and your Google account breaks,
              click the button below to re-establish the connection.
              (You should only need to do this if you receive an email
              from {{appName}})`,
              { appName },
            )}
          </Typography>
        )}
      </DialogContent>

      {tabSelected === TabsEnum.Calendar &&
        !googleAccountDetails?.calendarIntegration && (
          <StyledDialogActions>
            <CancelButton onClick={handleClose} disabled={isSubmitting} />
            <SubmitButton
              disabled={isSubmitting}
              onClick={() => handleToggleCalendarIntegration(true)}
            >
              {t('Enable Calendar Integration')}
            </SubmitButton>
          </StyledDialogActions>
        )}
      {tabSelected === TabsEnum.Calendar &&
        googleAccountDetails?.calendarIntegration && (
          <StyledDialogActions>
            <CancelButton
              onClick={handleClose}
              disabled={isSubmitting}
              variant="contained"
            />
            <ActionButton disabled={isSubmitting} onClick={handleSyncCalendar}>
              {t('Sync Calendar')}
            </ActionButton>
          </StyledDialogActions>
        )}
      {tabSelected === TabsEnum.Setup && (
        <StyledDialogActions>
          <CancelButton
            onClick={handleClose}
            disabled={isSubmitting}
            variant="contained"
          />
          <Button href={oAuth} variant="text">
            {t('Refresh Google Account')}
          </Button>
        </StyledDialogActions>
      )}
    </Modal>
  );
};
