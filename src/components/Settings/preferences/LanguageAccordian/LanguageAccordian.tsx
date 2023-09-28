import * as yup from 'yup';
import { Formik } from 'formik';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';
import React, { ReactElement } from 'react';
import { Autocomplete, TextField } from '@mui/material';
import Skeleton from '@mui/material/Skeleton';
import * as Types from '../../../../../graphql/types.generated';
import { FormWrapper } from 'src/components/Shared/Forms/Fields/FormWrapper';
import { FieldWrapper } from 'src/components/Shared/Forms/FieldWrapper';
import { useApiConstants } from 'src/components/Constants/UseApiConstants';
import { AccordionItem } from 'src/components/Shared/Forms/Accordions/AccordionItem';
import { useUpdateUserLanguagePreferenceMutation } from './UpdateLanguage.generated';

interface LanguageAccordianProps {
  handleAccordionChange: (panel: string) => void;
  expandedPanel: string;
  loading: boolean;
  data: string | undefined;
}

export const LanguageAccordian: React.FC<LanguageAccordianProps> = ({
  handleAccordionChange,
  expandedPanel,
  loading,
  data,
}) => {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const [updateUserLanguagePreference] =
    useUpdateUserLanguagePreferenceMutation();
  const constants = useApiConstants();
  const languages = constants?.languages ?? [];
  const label = 'Language';

  const PreferencesSchema: yup.SchemaOf<Pick<Types.Preference, 'locale'>> =
    yup.object({
      locale: yup.string().required(),
    });

  const onSubmit = async (attributes: Pick<Types.Preference, 'locale'>) => {
    await updateUserLanguagePreference({
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
      value={data || ''}
      fullWidth={true}
    >
      <Formik
        initialValues={{
          locale: data || '',
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
                  }}
                  options={languages.map((language) => language.id) || []}
                  getOptionLabel={(locale): string =>
                    languages.find(({ id }) => String(id) === String(locale))
                      ?.value ?? ''
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
