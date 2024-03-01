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
import { useUpdatePersonalPreferencesMutation } from '../UpdatePersonalPreferences.generated';

interface LocaleAccordionProps {
  handleAccordionChange: (panel: string) => void;
  expandedPanel: string;
  localeDisplay: string;
}

export const LocaleAccordion: React.FC<LocaleAccordionProps> = ({
  handleAccordionChange,
  expandedPanel,
  localeDisplay,
}) => {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const [updatePersonalPreferences] = useUpdatePersonalPreferencesMutation();
  const constants = useApiConstants();
  const locales = constants?.locales ?? [];
  const label = t('Locale');

  const PreferencesSchema: yup.SchemaOf<
    Pick<Types.Preference, 'localeDisplay'>
  > = yup.object({
    localeDisplay: yup.string().required(),
  });

  const formatLocale = (locale) => {
    const thisLocale = locales
      ? locales.find(({ shortName }) => String(shortName) === String(locale))
      : null;
    return thisLocale
      ? `${thisLocale?.englishName} (${thisLocale?.nativeName})`
      : '';
  };

  const selectedLocale = useMemo(
    () => formatLocale(localeDisplay),
    [localeDisplay, locales],
  );

  const onSubmit = async (
    attributes: Pick<Types.Preference, 'localeDisplay'>,
  ) => {
    await updatePersonalPreferences({
      variables: {
        input: {
          attributes: {
            localeDisplay: attributes.localeDisplay,
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
      value={selectedLocale || ''}
      fullWidth
    >
      <Formik
        initialValues={{
          localeDisplay: localeDisplay,
        }}
        validationSchema={PreferencesSchema}
        onSubmit={onSubmit}
        enableReinitialize
        validateOnMount
      >
        {({
          values: { localeDisplay },
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
                'The locale determines how numbers, dates and other information are formatted.',
              )}
            >
              <Autocomplete
                disabled={isSubmitting}
                autoHighlight
                value={localeDisplay}
                onChange={(_, value) => {
                  setFieldValue('localeDisplay', value);
                }}
                options={locales.map((locale) => locale.shortName) || []}
                getOptionLabel={(localeDisplay): string =>
                  formatLocale(localeDisplay)
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
