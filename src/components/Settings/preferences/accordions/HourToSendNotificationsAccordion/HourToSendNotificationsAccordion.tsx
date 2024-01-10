import React, { ReactElement } from 'react';
import { Autocomplete, TextField } from '@mui/material';
import Skeleton from '@mui/material/Skeleton';
import { Formik } from 'formik';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { useApiConstants } from 'src/components/Constants/UseApiConstants';
import { AccordionItem } from 'src/components/Shared/Forms/Accordions/AccordionItem';
import { FieldWrapper } from 'src/components/Shared/Forms/FieldWrapper';
import { FormWrapper } from 'src/components/Shared/Forms/Fields/FormWrapper';
import * as Types from 'src/graphql/types.generated';
import useGetAppSettings from 'src/hooks/useGetAppSettings';
import { useUpdatePersonalPreferencesMutation } from '../UpdatePersonalPreferences.generated';

interface HourToSendNotificationsAccordionProps {
  handleAccordionChange: (panel: string) => void;
  expandedPanel: string;
  loading: boolean;
  hourToSendNotifications: number | null;
}

export const HourToSendNotificationsAccordion: React.FC<
  HourToSendNotificationsAccordionProps
> = ({
  handleAccordionChange,
  expandedPanel,
  loading,
  hourToSendNotifications,
}) => {
  const { t } = useTranslation();
  const { appName } = useGetAppSettings();
  const { enqueueSnackbar } = useSnackbar();
  const [updatePersonalPreferences] = useUpdatePersonalPreferencesMutation();
  const constants = useApiConstants();
  const hours = constants?.times ?? [];
  const label = t('Hour To Send Notifications');

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
        //console.log('error: ', e);
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
      value={
        hours.find(({ key }) => key === hourToSendNotifications)?.value ||
        'Immediately'
      }
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
            {loading && <Skeleton height="90px" />}
            {!loading && (
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
                  loading={loading}
                  value={hourToSendNotifications || -1}
                  onChange={(_, value) => {
                    const modifiedValue = value === -1 ? null : value;
                    setFieldValue('hourToSendNotifications', modifiedValue);
                  }}
                  options={
                    hours.map((hour) => (hour.key === null ? -1 : hour.key)) ||
                    []
                  }
                  getOptionLabel={(hourToSendNotifications): string =>
                    hours.find(({ key }) => key === hourToSendNotifications)
                      ?.value ?? 'Immediately'
                  }
                  filterSelectedOptions
                  fullWidth
                  data-testid={'input' + label.replace(/\s/g, '')}
                  renderInput={(params) => (
                    <TextField {...params} placeholder={label} />
                  )}
                />
              </FieldWrapper>
            )}
          </FormWrapper>
        )}
      </Formik>
    </AccordionItem>
  );
};
