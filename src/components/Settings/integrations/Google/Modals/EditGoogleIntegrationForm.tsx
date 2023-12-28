import React, { ReactElement } from 'react';
import {
  Box,
  Checkbox,
  DialogActions,
  FormControlLabel,
  FormHelperText,
  MenuItem,
  Select,
  Skeleton,
  Typography,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { Formik } from 'formik';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import {
  DeleteButton,
  SubmitButton,
} from 'src/components/common/Modal/ActionButtons/ActionButtons';
import { GoogleAccountIntegration } from 'src/graphql/types.generated';
import { useAccountListId } from 'src/hooks/useAccountListId';
import useGetAppSettings from 'src/hooks/useGetAppSettings';
import { GoogleAccountAttributesSlimmed } from '../GoogleAccordion';
import {
  GoogleAccountIntegrationsDocument,
  GoogleAccountIntegrationsQuery,
  useGetIntegrationActivitiesQuery,
} from './googleIntegrations.generated';
import { useUpdateGoogleIntegrationMutation } from './updateGoogleIntegration.generated';

type GoogleAccountIntegrationSlimmed = Pick<
  GoogleAccountIntegration,
  'calendarId' | 'id' | 'calendarIntegrations' | 'calendars'
>;
interface EditGoogleIntegrationFormProps {
  account: GoogleAccountAttributesSlimmed;
  googleAccountDetails: GoogleAccountIntegrationSlimmed;
  loading: boolean;
  setIsSubmitting: (boolean) => void;
  handleToggleCalendarIntegration: (boolean) => void;
  handleClose: () => void;
}

const StyledBox = styled(Box)(() => ({
  display: 'flex',
  flexWrap: 'wrap',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginTop: '20px',
  marginBottom: '20px',
}));

const StyledFormControlLabel = styled(FormControlLabel)(() => ({
  flex: '0 1 50%',
  margin: '0 0 0 -11px',
}));

export const EditGoogleIntegrationForm: React.FC<
  EditGoogleIntegrationFormProps
> = ({
  account,
  googleAccountDetails,
  loading,
  setIsSubmitting,
  handleToggleCalendarIntegration,
  handleClose,
}) => {
  const { t } = useTranslation();
  const accountListId = useAccountListId();
  const { enqueueSnackbar } = useSnackbar();
  const { appName } = useGetAppSettings();
  const [updateGoogleIntegration] = useUpdateGoogleIntegrationMutation();

  const { data: actvitiesData } = useGetIntegrationActivitiesQuery();
  const actvities = actvitiesData?.constant?.activities;

  const IntegrationSchema: yup.SchemaOf<GoogleAccountIntegrationSlimmed> =
    yup.object({
      id: yup.string().required(),
      calendarId: yup.string().required(),
      calendarIntegrations: yup.array().of(yup.string().required()).required(),
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

  const onSubmit = async (attributes: GoogleAccountIntegrationSlimmed) => {
    setIsSubmitting(true);
    const googleIntegration = {
      calendarId: attributes.calendarId,
      calendarIntegrations: attributes.calendarIntegrations,
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
            ...googleIntegration,
          };
          cache.writeQuery({ ...query, data });
        }
      },
    });
    setIsSubmitting(false);
    enqueueSnackbar(t('Updated Google Calendar Integration!'), {
      variant: 'success',
    });
    handleClose();
  };

  return (
    <>
      {loading && (
        <>
          <Skeleton height="90px" />
          <Skeleton height="300px" />
        </>
      )}

      {!loading && (
        <>
          <Typography>
            {t('Choose a calendar for {{appName}} to push tasks to:', {
              appName,
            })}
          </Typography>

          <Formik
            initialValues={{
              calendarId: googleAccountDetails.calendarId,
              id: googleAccountDetails.id,
              calendarIntegrations: googleAccountDetails.calendarIntegrations,
              calendars: googleAccountDetails.calendars,
            }}
            validationSchema={IntegrationSchema}
            onSubmit={onSubmit}
          >
            {({
              values: { calendarId, calendarIntegrations, calendars },
              handleSubmit,
              setFieldValue,
              isSubmitting,
              isValid,
              errors,
            }): ReactElement => (
              <form onSubmit={handleSubmit}>
                <Box>
                  <Select
                    value={calendarId}
                    onChange={(e) =>
                      setFieldValue('calendarId', e.target.value)
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
                  {errors.calendarId && (
                    <FormHelperText error={true}>
                      {t('This field is required')}
                    </FormHelperText>
                  )}
                </Box>

                <StyledBox>
                  {actvities?.map((activity) => {
                    if (!activity?.id || !activity?.value) return null;
                    const activityId = `${activity.value}-Checkbox`;
                    const isChecked = calendarIntegrations.includes(
                      activity?.id ?? '',
                    );
                    return (
                      <StyledFormControlLabel
                        key={activityId}
                        control={
                          <Checkbox
                            data-testid={activityId}
                            name={activityId}
                            checked={isChecked}
                            onChange={(_, value) => {
                              let newCalendarIntegrations;
                              if (value) {
                                // Add to calendarIntegrations
                                newCalendarIntegrations = [
                                  ...calendarIntegrations,
                                  activity.value,
                                ];
                              } else {
                                // Remove from calendarIntegrations
                                newCalendarIntegrations =
                                  calendarIntegrations.filter(
                                    (act) => act !== activity?.id,
                                  );
                              }
                              setFieldValue(
                                `calendarIntegrations`,
                                newCalendarIntegrations,
                              );
                            }}
                          />
                        }
                        label={activity.value}
                      />
                    );
                  })}
                </StyledBox>

                <DialogActions>
                  <DeleteButton
                    disabled={isSubmitting}
                    onClick={() => handleToggleCalendarIntegration(false)}
                    variant="outlined"
                  >
                    {t('Disable Calendar Integration')}
                  </DeleteButton>
                  <SubmitButton
                    disabled={!isValid || isSubmitting}
                    variant="contained"
                  >
                    {t('Update')}
                  </SubmitButton>
                </DialogActions>
              </form>
            )}
          </Formik>
        </>
      )}
    </>
  );
};
