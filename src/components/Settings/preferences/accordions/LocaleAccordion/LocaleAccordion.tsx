import React, { ReactElement, useMemo } from 'react';
import { Autocomplete, TextField } from '@mui/material';
import { Formik } from 'formik';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { useApiConstants } from 'src/components/Constants/UseApiConstants';
import { PreferenceAccordion } from 'src/components/Shared/Forms/Accordions/AccordionEnum';
import { AccordionItem } from 'src/components/Shared/Forms/Accordions/AccordionItem';
import { FieldWrapper } from 'src/components/Shared/Forms/FieldWrapper';
import { FormWrapper } from 'src/components/Shared/Forms/FormWrapper';
import { Preference } from 'src/graphql/types.generated';
import { AccordionProps } from '../../../accordionHelper';
import { useUpdatePersonalPreferencesMutation } from '../UpdatePersonalPreferences.generated';

const preferencesSchema: yup.ObjectSchema<Pick<Preference, 'localeDisplay'>> =
  yup.object({
    localeDisplay: yup.string().required(),
  });

interface LocaleAccordionProps extends AccordionProps<PreferenceAccordion> {
  localeDisplay: string;
  disabled?: boolean;
  handleSetupChange: () => Promise<void>;
}

export const LocaleAccordion: React.FC<LocaleAccordionProps> = ({
  handleAccordionChange,
  expandedAccordion,
  localeDisplay,
  disabled,
  handleSetupChange,
}) => {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const [updatePersonalPreferences] = useUpdatePersonalPreferencesMutation();
  const constants = useApiConstants();
  const locales = constants?.locales ?? [];
  const label = t('Locale');

  const formatLocale = (locale) => {
    const thisLocale = locales
      ? locales.find(({ shortName }) => shortName === locale)
      : null;
    return thisLocale?.englishName && thisLocale?.nativeName
      ? `${thisLocale?.englishName} (${thisLocale?.nativeName})`
      : thisLocale?.englishName
      ? thisLocale?.englishName
      : '';
  };

  const selectedLocale = useMemo(
    () => formatLocale(localeDisplay),
    [localeDisplay, locales],
  );

  const onSubmit = async (attributes: Pick<Preference, 'localeDisplay'>) => {
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
        handleAccordionChange(null);
      },
      onError: () => {
        enqueueSnackbar(t('Saving failed.'), {
          variant: 'error',
        });
      },
    });
    handleSetupChange();
  };

  return (
    <AccordionItem
      accordion={PreferenceAccordion.Locale}
      onAccordionChange={handleAccordionChange}
      expandedAccordion={expandedAccordion}
      label={label}
      value={selectedLocale || ''}
      fullWidth
      disabled={disabled}
    >
      <Formik
        initialValues={{
          localeDisplay: localeDisplay,
        }}
        validationSchema={preferencesSchema}
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
