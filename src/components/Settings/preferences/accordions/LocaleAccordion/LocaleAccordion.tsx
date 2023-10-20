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
import { useApiConstants } from 'src/components/Constants/UseApiConstants';
import { AccordionItem } from 'src/components/Shared/Forms/Accordions/AccordionItem';
import { useUpdateUserLocalePreferenceMutation } from './UpdateLocale.generated';
import { GetPersonalPreferencesQuery } from '../../GetPersonalPreferences.generated';
import {
  UserPreferenceContext,
  UserPreferenceType,
} from '../../../../User/Preferences/UserPreferenceProvider';

interface LocaleAccordionProps {
  handleAccordionChange: (panel: string) => void;
  expandedPanel: string;
  loading: boolean;
  data: GetPersonalPreferencesQuery['user'] | undefined;
}

export const LocaleAccordion: React.FC<LocaleAccordionProps> = ({
  handleAccordionChange,
  expandedPanel,
  loading,
  data,
}) => {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const [updateUserLocalePreference] = useUpdateUserLocalePreferenceMutation();
  const constants = useApiConstants();
  const languages = constants?.languages ?? [];
  const label = 'Locale';

  const { setLocale } = useContext(UserPreferenceContext) as UserPreferenceType;

  const PreferencesSchema: yup.SchemaOf<
    Pick<Types.Preference, 'localeDisplay'>
  > = yup.object({
    localeDisplay: yup.string().required(),
  });

  const formatLocale = (locale) => {
    const name = languages.find(
      ({ id }) => String(id) === String(locale),
    )?.value;
    return `${name} (${String(locale)})` ?? '';
  };

  const onSubmit = async (
    attributes: Pick<Types.Preference, 'localeDisplay'>,
  ) => {
    await updateUserLocalePreference({
      variables: {
        input: {
          attributes: {
            localeDisplay: attributes.localeDisplay,
          },
        },
      },
      update: (cache) => {
        if (!data) return;
        //console.log('locale cache', cache.identify(data));
        cache.modify({
          id: cache.identify(data),
          fields: {
            localeDisplay() {
              return attributes.localeDisplay;
            },
          },
        });
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
        languages.find(({ id }) => String(id) === String(data?.localeDisplay))
          ?.value || ''
      }
      fullWidth={true}
    >
      <Formik
        initialValues={{
          localeDisplay: data?.localeDisplay,
        }}
        validationSchema={PreferencesSchema}
        onSubmit={onSubmit}
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
            {loading && <Skeleton height="90px" />}
            {!loading && (
              <FieldWrapper
                labelText={t(label)}
                helperText={t(
                  'The locale determines how numbers, dates and other information are formatted in MPDX.',
                )}
              >
                <Autocomplete
                  autoSelect
                  disabled={isSubmitting}
                  autoHighlight
                  loading={loading}
                  value={localeDisplay}
                  onChange={(_, value) => {
                    setFieldValue('localeDisplay', value);
                    if (value) setLocale(value);
                  }}
                  options={languages.map((language) => language.id) || []}
                  getOptionLabel={(localeDisplay): string =>
                    formatLocale(localeDisplay)
                  }
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
