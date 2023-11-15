import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';
import { styled } from '@mui/material/styles';
import {
  DialogContent,
  DialogActions,
  Typography,
  Tabs,
  Tab,
  Box,
  Skeleton,
  Button,
} from '@mui/material';
import { useAccountListId } from 'src/hooks/useAccountListId';
import {
  useGetGoogleAccountIntegrationsQuery,
  GetGoogleAccountIntegrationsDocument,
  GetGoogleAccountIntegrationsQuery,
  useCreateGoogleIntegrationMutation,
} from './googleIntegrations.generated';
import { useSyncGoogleAccountMutation } from '../googleAccounts.generated';
import { useUpdateGoogleIntegrationMutation } from './updateGoogleIntegration.generated';
import Modal from 'src/components/common/Modal/Modal';
import {
  SubmitButton,
  CancelButton,
  ActionButton,
} from 'src/components/common/Modal/ActionButtons/ActionButtons';
import { GoogleAccountAttributesSlimmed } from '../GoogleAccordian';
import { EditGoogleIntegrationForm } from './EditGoogleIntegrationForm';

interface EditGoogleAccountModalProps {
  handleClose: () => void;
  account: GoogleAccountAttributesSlimmed;
  oAuth: string;
}

enum tabs {
  calendar = 'calendar',
  setup = 'setup',
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
  const [tabSelected, setTabSelected] = useState<tabs>(tabs.calendar);
  const accountListId = useAccountListId();
  const { enqueueSnackbar } = useSnackbar();

  const [updateGoogleIntegration] = useUpdateGoogleIntegrationMutation();
  const [createGoogleIntegration] = useCreateGoogleIntegrationMutation();
  const [syncGoogleAccountQuery] = useSyncGoogleAccountMutation();
  const {
    data,
    loading,
    refetch: refetchGoogleIntegrations,
  } = useGetGoogleAccountIntegrationsQuery({
    variables: {
      input: {
        googleAccountId: account.id,
        accountListId: accountListId ?? '',
      },
    },
    skip: !accountListId,
  });

  const googleAccountDetails = data?.getGoogleAccountIntegrations[0];

  const handleTabChange = (_, tab) => {
    setTabSelected(tab);
  };

  const handleToogleCalendarIntegration = async (
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
            query: GetGoogleAccountIntegrationsDocument,
            variables: {
              googleAccountId: account.id,
              accountListId,
            },
          };
          const dataFromCache =
            cache.readQuery<GetGoogleAccountIntegrationsQuery>(query);

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
          integrationName: tabs.calendar,
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
              value={tabs.calendar}
              label="Calendar"
              style={{ width: '50%' }}
            />
            <Tab value={tabs.setup} label="Setup" style={{ width: '50%' }} />
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
          tabSelected === tabs.calendar && (
            <EditGoogleIntegrationForm
              googleAccountDetails={googleAccountDetails}
              loading={loading}
              setIsSubmitting={setIsSubmitting}
              account={account}
              handleToogleCalendarIntegration={handleToogleCalendarIntegration}
              handleClose={handleClose}
            />
          )}

        {!loading &&
          !googleAccountDetails?.calendarIntegration &&
          tabSelected === tabs.calendar && (
            <Typography>
              {t(`MPDX can automatically update your google calendar with your tasks.
            Once you enable this feature, you'll be able to choose which
            types of tasks you want to sync. By default MPDX will add
            'Appointment' tasks to your calendar.`)}
            </Typography>
          )}

        {tabSelected === tabs.setup && (
          <Typography>
            {t(
              `If the link between MPDX and your Google account breaks, 
              click the button below to re-establish the connection. 
              (You should only need to do this if you receive an email 
              from MPDX)`,
            )}
          </Typography>
        )}
      </DialogContent>

      {tabSelected === tabs.calendar &&
        !googleAccountDetails?.calendarIntegration && (
          <StyledDialogActions>
            <CancelButton onClick={handleClose} disabled={isSubmitting} />
            <SubmitButton
              disabled={isSubmitting}
              onClick={() => handleToogleCalendarIntegration(true)}
            >
              {t('Enable Calendar Integration')}
            </SubmitButton>
          </StyledDialogActions>
        )}
      {tabSelected === tabs.calendar &&
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
      {tabSelected === tabs.setup && (
        <StyledDialogActions>
          <CancelButton
            onClick={handleClose}
            disabled={isSubmitting}
            variant="contained"
          />
          <Button href={oAuth} variant="contained">
            {t('Refresh Google Account')}
          </Button>
        </StyledDialogActions>
      )}
    </Modal>
  );
};
