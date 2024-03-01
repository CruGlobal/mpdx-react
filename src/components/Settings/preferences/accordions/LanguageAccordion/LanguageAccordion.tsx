import React, { ReactElement, useMemo } from 'react';
import { Autocomplete, TextField } from '@mui/material';
import { Formik } from 'formik';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { AccordionItem } from 'src/components/Shared/Forms/Accordions/AccordionItem';
import { FieldWrapper } from 'src/components/Shared/Forms/FieldWrapper';
import { FormWrapper } from 'src/components/Shared/Forms/FormWrapper';
import * as Types from 'src/graphql/types.generated';
import useGetAppSettings from 'src/hooks/useGetAppSettings';
import { formatLanguage, languages } from 'src/lib/data/languages';
import { useUpdatePersonalPreferencesMutation } from '../UpdatePersonalPreferences.generated';

interface LanguageAccordionProps {
  handleAccordionChange: (panel: string) => void;
  expandedPanel: string;
  locale: string;
}

export const LanguageAccordion: React.FC<LanguageAccordionProps> = ({
  handleAccordionChange,
  expandedPanel,
  locale,
}) => {
  const { t } = useTranslation();
  const { appName } = useGetAppSettings();
  const { enqueueSnackbar } = useSnackbar();
  const [updatePersonalPreferences] = useUpdatePersonalPreferencesMutation();

  const label = t('Language');

  const selectedLanguage = useMemo(
    () => languages.find(({ id }) => id === locale)?.value || '',
    [languages, locale],
  );

  const PreferencesSchema: yup.SchemaOf<Pick<Types.Preference, 'locale'>> =
    yup.object({
      locale: yup.string().required(),
    });

  const onSubmit = async (attributes: Pick<Types.Preference, 'locale'>) => {
    await updatePersonalPreferences({
      variables: {
        input: {
          attributes: {
            locale: attributes.locale,
          },
        },
      },
      onCompleted: () => {
        enqueueSnackbar(t('Saved successfully.'), {
          variant: 'success',
        });
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
      value={selectedLanguage}
      fullWidth
    >
      <Formik
        initialValues={{
          locale: locale,
        }}
        validationSchema={PreferencesSchema}
        onSubmit={onSubmit}
        enableReinitialize
        validateOnMount
      >
        {({
          values: { locale },
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
                'The language determines your default language for {{appName}}.',
                { appName },
              )}
            >
              <Autocomplete
                disabled={isSubmitting}
                autoHighlight
                value={locale}
                onChange={(_, value) => {
                  setFieldValue('locale', value);
                }}
                options={languages.map((language) => language.id) || []}
                getOptionLabel={(locale): string => formatLanguage(locale)}
                fullWidth
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder={label}
                    label={label}
                    // eslint-disable-next-line jsx-a11y/no-autofocus
                    autoFocus
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
