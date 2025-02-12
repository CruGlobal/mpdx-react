import React, { ReactElement, useMemo } from 'react';
import { Autocomplete, TextField } from '@mui/material';
import { Formik } from 'formik';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { PreferenceAccordion } from 'src/components/Shared/Forms/Accordions/AccordionEnum';
import { AccordionItem } from 'src/components/Shared/Forms/Accordions/AccordionItem';
import { FieldWrapper } from 'src/components/Shared/Forms/FieldWrapper';
import { FormWrapper } from 'src/components/Shared/Forms/FormWrapper';
import { Preference } from 'src/graphql/types.generated';
import { useUpdatePersonalPreferencesMutation } from '../UpdatePersonalPreferences.generated';

const preferencesSchema: yup.ObjectSchema<Pick<Preference, 'timeZone'>> =
  yup.object({
    timeZone: yup.string().required(),
  });

interface TimeZoneAccordionProps {
  handleAccordionChange: (accordion: PreferenceAccordion | null) => void;
  expandedAccordion: PreferenceAccordion | null;
  timeZone: string;
  timeZones: Array<Record<string, string>>;
  disabled?: boolean;
}

export const TimeZoneAccordion: React.FC<TimeZoneAccordionProps> = ({
  handleAccordionChange,
  expandedAccordion,
  timeZone,
  timeZones,
  disabled,
}) => {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const [updatePersonalPreferences] = useUpdatePersonalPreferencesMutation();
  const label = t('Time Zone');

  const formatTimeZone = (timeZone) => {
    return timeZones.find(({ key }) => key === timeZone)?.value ?? '';
  };

  const selectedTimeZone = useMemo(
    () => formatTimeZone(timeZone),
    [timeZones, timeZone],
  );

  const onSubmit = async (attributes: Pick<Preference, 'timeZone'>) => {
    await updatePersonalPreferences({
      variables: {
        input: {
          attributes: {
            timeZone: attributes.timeZone,
          },
        },
      },
      onCompleted: () => {
        enqueueSnackbar(t('Saved successfully.'), {
          variant: 'success',
        });
        handleAccordionChange(null);
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
      accordion={PreferenceAccordion.TimeZone}
      onAccordionChange={handleAccordionChange}
      expandedAccordion={expandedAccordion}
      label={label}
      value={selectedTimeZone}
      fullWidth
      disabled={disabled}
    >
      <Formik
        initialValues={{
          timeZone: timeZone || '',
        }}
        validationSchema={preferencesSchema}
        onSubmit={onSubmit}
        enableReinitialize
        validateOnMount
      >
        {({
          values: { timeZone },
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
                'The timezone will be used in setting tasks, appointments, completion dates, etc. Please make sure it matches the one your computer is set to.',
              )}
            >
              <Autocomplete
                disabled={isSubmitting}
                autoHighlight
                value={timeZone}
                onChange={(_, value) => {
                  setFieldValue('timeZone', value);
                }}
                options={timeZones.map((zone) => zone.key)}
                getOptionLabel={(timeZone): string => formatTimeZone(timeZone)}
                fullWidth
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder={label}
                    label={label}
                    sx={{ marginTop: 1 }}
                    // eslint-disable-next-line jsx-a11y/no-autofocus
                    autoFocus
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
