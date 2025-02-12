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
import useGetAppSettings from 'src/hooks/useGetAppSettings';
import { formatLanguage, languages } from 'src/lib/data/languages';
import { useUpdatePersonalPreferencesMutation } from '../UpdatePersonalPreferences.generated';

const preferencesSchema: yup.ObjectSchema<Pick<Preference, 'locale'>> =
  yup.object({
    locale: yup.string().required(),
  });

interface LanguageAccordionProps {
  handleAccordionChange: (accordion: PreferenceAccordion | null) => void;
  expandedAccordion: PreferenceAccordion | null;
  locale: string;
  disabled?: boolean;
}

export const LanguageAccordion: React.FC<LanguageAccordionProps> = ({
  handleAccordionChange,
  expandedAccordion,
  locale,
  disabled,
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

  const onSubmit = async (attributes: Pick<Preference, 'locale'>) => {
    await updatePersonalPreferences({
      variables: {
        input: {
          attributes: {
            locale: attributes.locale,
          },
        },
      },
      refetchQueries: ['LoadConstants'],
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
      accordion={PreferenceAccordion.Language}
      onAccordionChange={handleAccordionChange}
      expandedAccordion={expandedAccordion}
      label={label}
      value={selectedLanguage}
      fullWidth
      disabled={disabled}
    >
      <Formik
        initialValues={{
          locale: locale,
        }}
        validationSchema={preferencesSchema}
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
