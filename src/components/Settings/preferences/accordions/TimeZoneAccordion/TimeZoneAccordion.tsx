import React, { ReactElement } from 'react';
import { Autocomplete, TextField } from '@mui/material';
import { Formik } from 'formik';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { AccordionItem } from 'src/components/Shared/Forms/Accordions/AccordionItem';
import { FieldWrapper } from 'src/components/Shared/Forms/FieldWrapper';
import { FormWrapper } from 'src/components/Shared/Forms/FormWrapper';
import * as Types from 'src/graphql/types.generated';
import { useUpdatePersonalPreferencesMutation } from '../UpdatePersonalPreferences.generated';
import { timeZones } from './TimeZones';

interface TimeZoneAccordionProps {
  handleAccordionChange: (panel: string) => void;
  expandedPanel: string;
  timeZone: string;
}

export const TimeZoneAccordion: React.FC<TimeZoneAccordionProps> = ({
  handleAccordionChange,
  expandedPanel,
  timeZone,
}) => {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const [updatePersonalPreferences] = useUpdatePersonalPreferencesMutation();
  const label = t('Time Zone');

  const PreferencesSchema: yup.SchemaOf<Pick<Types.Preference, 'timeZone'>> =
    yup.object({
      timeZone: yup.string().required(),
    });

  const onSubmit = async (attributes: Pick<Types.Preference, 'timeZone'>) => {
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
      value={timeZone || ''}
      fullWidth
    >
      <Formik
        initialValues={{
          timeZone: timeZone || '',
        }}
        validationSchema={PreferencesSchema}
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
              labelText={label}
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
                options={timeZones.map((zone) => zone.key) || []}
                getOptionLabel={(timeZone): string =>
                  timeZones.find(({ key }) => String(key) === String(timeZone))
                    ?.value ?? ''
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
