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
import { Preference } from 'src/graphql/types.generated';
import useGetAppSettings from 'src/hooks/useGetAppSettings';
import { useUpdatePersonalPreferencesMutation } from '../UpdatePersonalPreferences.generated';

const preferencesSchema: yup.ObjectSchema<
  Pick<Preference, 'hourToSendNotifications'>
> = yup.object({
  hourToSendNotifications: yup.number().default(null).nullable(),
});

interface HourToSendNotificationsAccordionProps {
  handleAccordionChange: (panel: string) => void;
  expandedPanel: string;
  hourToSendNotifications: number | null;
  disabled?: boolean;
}

export const HourToSendNotificationsAccordion: React.FC<
  HourToSendNotificationsAccordionProps
> = ({
  handleAccordionChange,
  expandedPanel,
  hourToSendNotifications,
  disabled,
}) => {
  const { t } = useTranslation();
  const { appName } = useGetAppSettings();
  const { enqueueSnackbar } = useSnackbar();
  const [updatePersonalPreferences] = useUpdatePersonalPreferencesMutation();
  const constants = useApiConstants();
  const hours = constants?.times ?? [];
  const label = t('Hour To Send Notifications');

  const formatHour = (hour) => {
    return hours.find(
      ({ key }) => key === hour || (hour === -1 && key === null),
    )?.value;
  };
  const selectedHour = useMemo(
    () => formatHour(hourToSendNotifications),
    [hours, hourToSendNotifications],
  );

  const onSubmit = async (
    attributes: Pick<Preference, 'hourToSendNotifications'>,
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
      value={selectedHour || ''}
      fullWidth
      disabled={disabled}
    >
      <Formik
        initialValues={{
          hourToSendNotifications: hourToSendNotifications,
        }}
        validationSchema={preferencesSchema}
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
                  formatHour(hourToSendNotifications) || ''
                }
                fullWidth
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder={label}
                    // eslint-disable-next-line jsx-a11y/no-autofocus
                    autoFocus
                    label={label}
                    sx={{ marginTop: 1 }}
                  />
                )}
              />
            </FieldWrapper>
          </FormWrapper>
        )}
      </Formik>
    </AccordionItem>
  );
};
