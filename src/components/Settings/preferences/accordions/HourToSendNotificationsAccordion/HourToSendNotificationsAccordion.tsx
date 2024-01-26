import React, { ReactElement, useMemo } from 'react';
import { Autocomplete, TextField } from '@mui/material';
import { Formik } from 'formik';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { useApiConstants } from 'src/components/Constants/UseApiConstants';
import { AccordionItem } from 'src/components/Shared/Forms/Accordions/AccordionItem';
import { FieldWrapper } from 'src/components/Shared/Forms/FieldWrapper';
import { FormWrapper } from 'src/components/Shared/Forms/FormWrapper';
import * as Types from 'src/graphql/types.generated';
import useGetAppSettings from 'src/hooks/useGetAppSettings';
import { useUpdatePersonalPreferencesMutation } from '../UpdatePersonalPreferences.generated';

interface HourToSendNotificationsAccordionProps {
  handleAccordionChange: (panel: string) => void;
  expandedPanel: string;
  hourToSendNotifications: number | null;
}

export const HourToSendNotificationsAccordion: React.FC<
  HourToSendNotificationsAccordionProps
> = ({ handleAccordionChange, expandedPanel, hourToSendNotifications }) => {
  const { t } = useTranslation();
  const { appName } = useGetAppSettings();
  const { enqueueSnackbar } = useSnackbar();
  const [updatePersonalPreferences] = useUpdatePersonalPreferencesMutation();
  const constants = useApiConstants();
  const hours = constants?.times ?? [];
  const label = t('Hour To Send Notifications');

  const selectedHour = useMemo(
    () =>
      hours.find(({ key }) => key === hourToSendNotifications)?.value ||
      t('Immediately'),
    [hours, hourToSendNotifications],
  );

  const PreferencesSchema: yup.SchemaOf<
    Pick<Types.Preference, 'hourToSendNotifications'>
  > = yup.object({
    hourToSendNotifications: yup.number().default(null).nullable(),
  });

  const onSubmit = async (
    attributes: Pick<Types.Preference, 'hourToSendNotifications'>,
  ) => {
    await updatePersonalPreferences({
      variables: {
        input: {
          attributes: {
            hourToSendNotifications: attributes.hourToSendNotifications,
          },
        },
      },
      onCompleted: () => {
        enqueueSnackbar(t('Saved successfully.'), {
          variant: 'success',
        });
        handleAccordionChange(label);
      },
      onError: () => {
        enqueueSnackbar(t('Saving failed.'), {
          variant: 'error',
        });
      },
    });
  };

  return (
    <AccordionItem
      onAccordionChange={handleAccordionChange}
      expandedPanel={expandedPanel}
      label={label}
      value={selectedHour}
      fullWidth
    >
      <Formik
        initialValues={{
          hourToSendNotifications: hourToSendNotifications,
        }}
        validationSchema={PreferencesSchema}
        onSubmit={onSubmit}
        enableReinitialize
      >
        {({
          values: { hourToSendNotifications },
          handleSubmit,
          setFieldValue,
          isSubmitting,
          isValid,
        }): ReactElement => (
          <FormWrapper
            onSubmit={handleSubmit}
            isValid={isValid}
            isSubmitting={isSubmitting}
          >
            <FieldWrapper
              labelText={label}
              helperText={t(
                '{{appName}} can send you app notifications immediately or at a particular time each day. Please make sure your time zone is set correctly so this time matches your local time.',
                { appName },
              )}
            >
              <Autocomplete
                disabled={isSubmitting}
                autoHighlight
                value={hourToSendNotifications || -1}
                onChange={(_, value) => {
                  const modifiedValue = value === -1 ? null : value;
                  setFieldValue('hourToSendNotifications', modifiedValue);
                }}
                options={hours.map((hour) =>
                  hour.key === null ? -1 : hour.key,
                )}
                getOptionLabel={(hourToSendNotifications): string =>
                  hours.find(({ key }) => key === hourToSendNotifications)
                    ?.value ?? t('Immediately')
                }
                filterSelectedOptions
                fullWidth
                renderInput={(params) => (
                  // eslint-disable-next-line jsx-a11y/no-autofocus
                  <TextField {...params} placeholder={label} autoFocus />
                )}
              />
            </FieldWrapper>
          </FormWrapper>
        )}
      </Formik>
    </AccordionItem>
  );
};
