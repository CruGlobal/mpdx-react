import React, { useState, ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import {
  DialogActions,
  Typography,
  Tabs,
  Tab,
  Select,
  MenuItem,
} from '@mui/material';
import { Box } from '@mui/system';
import Modal from 'src/components/common/Modal/Modal';
import {
  SubmitButton,
  CancelButton,
} from 'src/components/common/Modal/ActionButtons/ActionButtons';
import {
  GoogleAccountAttributes,
  GoogleAccountIntegration,
} from '../../../../../../graphql/types.generated';
import {
  useGetGoogleAccountIntegrationsQuery,
  GetGoogleAccountIntegrationsDocument,
  GetGoogleAccountIntegrationsQuery,
} from './getGoogleAccountIntegrations.generated';
import { useAccountListId } from 'src/hooks/useAccountListId';
import { useUpdateGoogleIntegrationMutation } from './updateGoogleIntegration.generated';
import { useSnackbar } from 'notistack';
import { Formik } from 'formik';
import * as yup from 'yup';

interface EditGoogleAccountModalProps {
  handleClose: () => void;
  account: GoogleAccountAttributes;
}

enum tabs {
  calendar = 'calendar',
  setup = 'setup',
}

export const EditGoogleAccountModal: React.FC<EditGoogleAccountModalProps> = ({
  account,
  handleClose,
}) => {
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tabSelected, setTabSelected] = useState<tabs>(tabs.calendar);
  const accountListId = useAccountListId();
  const { enqueueSnackbar } = useSnackbar();

  const [updateGoogleIntegration] = useUpdateGoogleIntegrationMutation();
  const { data } = useGetGoogleAccountIntegrationsQuery({
    variables: {
      input: {
        googleAccountId: account.id,
        accountListId: accountListId ?? '',
      },
      skip: !accountListId,
    },
  });

  const googleAccountDetails = data?.getGoogleAccountIntegrations[0];

  // console.log('googleAccountDetails', googleAccountDetails);

  const handleTabChange = (_, tab) => {
    setTabSelected(tab);
  };

  const handleEnableCalendarIntegration = async (integration) => {
    if (!googleAccountDetails?.id || !account?.id || !integration) return;
    setIsSubmitting(true);
    await updateGoogleIntegration({
      variables: {
        input: {
          googleAccountId: account.id,
          googleIntegrationId: googleAccountDetails.id,
          googleIntegration: {
            [`${integration}_integration`]: true,
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
            [`${integration}_integration`]: true,
          };
          cache.writeQuery({ ...query, data });
        }
      },
    });

    enqueueSnackbar(t('Enabled Google Calendar Integration!'), {
      variant: 'success',
    });
    setIsSubmitting(false);
  };

  const IntegrationSchema: yup.SchemaOf<
    Omit<
      GoogleAccountIntegration,
      'created_at' | 'updated_at' | 'updated_in_db_at' | '__typename'
    >
  > = yup.object({
    id: yup.string().required(),
    calendar_id: yup.string().required(),
    calendar_integration: yup.boolean().required(),
    calendar_integrations: yup.array().of(yup.string().required()).required(),
    calendar_name: yup.string().nullable(),
    calendars: yup
      .array()
      .of(
        yup.object({
          __typename: yup
            .string()
            .equals(['GoogleAccountIntegrationCalendars']),
          id: yup.string().required(),
          name: yup.string().required(),
        }),
      )
      .required(),
  });

  const onSubmit = async (
    attributes: Omit<
      GoogleAccountIntegration,
      'created_at' | 'updated_at' | 'updated_in_db_at' | '__typename'
    >,
  ) => {
    const googleIntegration = {
      calendar_id: attributes.calendar_id,
      calendar_integrations: attributes.calendar_integrations,
    };
    await updateGoogleIntegration({
      variables: {
        input: {
          googleAccountId: account.id,
          googleIntegrationId: googleAccountDetails?.id ?? '',
          googleIntegration: {
            ...googleIntegration,
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
            ...googleIntegration,
          };
          cache.writeQuery({ ...query, data });
        }
      },
    });

    enqueueSnackbar(t('Updated Google Calendar Integration!'), {
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
      <Box sx={{ p: 2 }}>
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

        {googleAccountDetails?.calendar_integration &&
          tabSelected === tabs.calendar && (
            <>
              <Typography>
                {t('Choose a calendar for MPDX to push tasks to:')}
              </Typography>

              <Formik
                initialValues={{
                  calendar_id: googleAccountDetails.calendar_id,
                  id: googleAccountDetails.id,
                  calendar_integration:
                    googleAccountDetails.calendar_integration,
                  calendar_integrations:
                    googleAccountDetails.calendar_integrations,
                  calendar_name: googleAccountDetails.calendar_name,
                  calendars: googleAccountDetails.calendars,
                }}
                validationSchema={IntegrationSchema}
                onSubmit={onSubmit}
              >
                {({
                  values: {
                    // id,
                    calendar_id,
                    // calendar_integration,
                    // calendar_integrations,
                    // calendar_name,
                    calendars,
                  },
                  // handleChange,
                  handleSubmit,
                  setFieldValue,
                  isSubmitting,
                  isValid,
                  // errors,
                  // initialErrors,
                }): ReactElement => (
                  <form onSubmit={handleSubmit}>
                    {/* {console.log('-----------------___________---------------')}
                  {console.log('id', id)}
                  {console.log('calendar_id', calendar_id)}
                  {console.log('calendar_integration', calendar_integration)}
                  {console.log('calendar_integrations', calendar_integrations)}
                  {console.log('calendar_name', calendar_name)}
                  {console.log('calendars', calendars)}
                  {console.log('errors', errors)}
                  {console.log('initialErrors', initialErrors)} */}
                    <Box>
                      <Select
                        value={calendar_id}
                        onChange={(e) =>
                          setFieldValue('calendar_id', e.target.value)
                        }
                        style={{
                          width: '100%',
                        }}
                      >
                        {calendars.map((calendar) => (
                          <MenuItem key={calendar?.id} value={calendar?.id}>
                            {calendar?.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </Box>

                    <DialogActions>
                      <SubmitButton disabled={!isValid || isSubmitting}>
                        {t('Update')}
                      </SubmitButton>
                    </DialogActions>
                  </form>
                )}
              </Formik>

              {/* 
              // Update button
              // Sync button - Different than Update
            */}
            </>
          )}

        {!googleAccountDetails?.calendar_integration &&
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
      </Box>

      <DialogActions>
        <CancelButton onClick={handleClose} disabled={isSubmitting} />
        {tabSelected === tabs.calendar && (
          <SubmitButton
            disabled={isSubmitting}
            onClick={() => handleEnableCalendarIntegration(tabs.calendar)}
          >
            {t('Enable Calendar Integration')}
          </SubmitButton>
        )}
      </DialogActions>
    </Modal>
  );
};
