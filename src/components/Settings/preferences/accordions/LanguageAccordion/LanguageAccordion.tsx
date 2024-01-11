import React, { ReactElement, useContext } from 'react';
import { Autocomplete, TextField } from '@mui/material';
import { Formik } from 'formik';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { AccordionItem } from 'src/components/Shared/Forms/Accordions/AccordionItem';
import { FieldWrapper } from 'src/components/Shared/Forms/FieldWrapper';
import { FormWrapper } from 'src/components/Shared/Forms/Fields/FormWrapper';
import * as Types from 'src/graphql/types.generated';
import useGetAppSettings from 'src/hooks/useGetAppSettings';
import {
  UserPreferenceContext,
  UserPreferenceType,
} from '../../../../User/Preferences/UserPreferenceProvider';
import { useUpdatePersonalPreferencesMutation } from '../UpdatePersonalPreferences.generated';

interface LanguageAccordionProps {
  handleAccordionChange: (panel: string) => void;
  expandedPanel: string;
  loading: boolean;
  locale: string;
}

export const LanguageAccordion: React.FC<LanguageAccordionProps> = ({
  handleAccordionChange,
  expandedPanel,
  loading,
  locale,
}) => {
  const { t } = useTranslation();
  const { appName } = useGetAppSettings();
  const { enqueueSnackbar } = useSnackbar();
  const [updatePersonalPreferences] = useUpdatePersonalPreferencesMutation();

  const label = t('Language');

  const { setLanguage } = useContext(
    UserPreferenceContext,
  ) as UserPreferenceType;

  const PreferencesSchema: yup.SchemaOf<Pick<Types.Preference, 'locale'>> =
    yup.object({
      locale: yup.string().required(),
    });

  const languages = [
    {
      id: 'en',
      value: 'US English',
    },
    {
      id: 'fr',
      value: 'French (français)',
    },
    {
      id: 'de',
      value: 'German (Deutsch)',
    },
    {
      id: 'ru',
      value: 'Russian (русский)',
    },
    {
      id: 'es-419',
      value: 'Latin American Spanish (español latinoamericano)',
    },
    {
      id: 'tr',
      value: 'Turkish (Türkçe)',
    },
    {
      id: 'ro',
      value: 'Romanian (Română)',
    },
  ];

  const formatLanguage = (language) => {
    const name = languages.find(
      ({ id }) => String(id) === String(language),
    )?.value;
    return name ?? '';
  };

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
        handleAccordionChange(label);
        if (attributes.locale) setLanguage(attributes.locale);
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
        languages.find(({ id }) => String(id) === String(locale))?.value || ''
      }
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
              labelText={label}
              helperText={t(
                'The language determines your default language for {{appName}}.',
                { appName },
              )}
            >
              <Autocomplete
                disabled={isSubmitting}
                autoHighlight
                loading={loading}
                value={locale}
                onChange={(_, value) => {
                  setFieldValue('locale', value);
                  //console.log('onChange', value);
                }}
                options={languages.map((language) => language.id) || []}
                getOptionLabel={(locale): string => formatLanguage(locale)}
                filterSelectedOptions
                fullWidth
                data-testid={'input' + label.replace(/\s/g, '')}
                renderInput={(params) => (
                  <TextField {...params} placeholder={label} />
                )}
              />
            </FieldWrapper>
          </FormWrapper>
        )}
      </Formik>
    </AccordionItem>
  );
};
