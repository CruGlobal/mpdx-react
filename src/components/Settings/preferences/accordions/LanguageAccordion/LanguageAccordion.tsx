import React, { ReactElement, useContext } from 'react';
import * as yup from 'yup';
import { Formik } from 'formik';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';
import { Autocomplete, TextField } from '@mui/material';
import Skeleton from '@mui/material/Skeleton';
import * as Types from '../../../../../../graphql/types.generated';
import { FormWrapper } from 'src/components/Shared/Forms/Fields/FormWrapper';
import { FieldWrapper } from 'src/components/Shared/Forms/FieldWrapper';
import { AccordionItem } from 'src/components/Shared/Forms/Accordions/AccordionItem';
import { useUpdateUserLanguagePreferenceMutation } from './UpdateLanguage.generated';
import {
  GetPersonalPreferencesQuery,
  GetPersonalPreferencesDocument,
} from '../../GetPersonalPreferences.generated';
import {
  UserPreferenceContext,
  UserPreferenceType,
} from '../../../../User/Preferences/UserPreferenceProvider';

interface LanguageAccordionProps {
  handleAccordionChange: (panel: string) => void;
  expandedPanel: string;
  loading: boolean;
  data: GetPersonalPreferencesQuery['user'] | undefined;
  accountListId: string;
}

export const LanguageAccordion: React.FC<LanguageAccordionProps> = ({
  handleAccordionChange,
  expandedPanel,
  loading,
  data,
  accountListId,
}) => {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const [updateUserLanguagePreference] =
    useUpdateUserLanguagePreferenceMutation();

  const label = 'Language';

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
      value: 'US Englsh',
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
    await updateUserLanguagePreference({
      variables: {
        input: {
          attributes: {
            locale: attributes.locale,
          },
        },
      },
      update: (cache) => {
        cache.updateQuery(
          {
            query: GetPersonalPreferencesDocument,
            variables: {
              accountListId,
            },
          },
          (data) => {
            return {
              user: {
                ...data.user,
                preferences: {
                  ...data.user.preferences,
                  locale: attributes.locale,
                },
              },
              accountList: data.accountList,
              accountLists: data.accountLists,
            };
          },
        );
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
      label={t(label)}
      value={
        languages.find(
          ({ id }) => String(id) === String(data?.preferences?.locale),
        )?.value || ''
      }
      fullWidth={true}
    >
      <Formik
        initialValues={{
          locale: data?.preferences?.locale,
        }}
        validationSchema={PreferencesSchema}
        onSubmit={onSubmit}
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
            {loading && <Skeleton height="90px" />}
            {!loading && (
              <FieldWrapper
                labelText={t(label)}
                helperText={t(
                  'The language determines your default language for MPDX.',
                )}
              >
                <Autocomplete
                  autoSelect
                  disabled={isSubmitting}
                  autoHighlight
                  loading={loading}
                  value={locale}
                  onChange={(_, value) => {
                    setFieldValue('locale', value);
                    //console.log('onChange', value);
                    if (value) setLanguage(value);
                  }}
                  options={languages.map((language) => language.id) || []}
                  getOptionLabel={(locale): string => formatLanguage(locale)}
                  filterSelectedOptions
                  fullWidth
                  renderInput={(params) => (
                    <TextField {...params} placeholder={t(label)} />
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
