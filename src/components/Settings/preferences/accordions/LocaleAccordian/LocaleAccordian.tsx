import * as yup from 'yup';
import { Formik } from 'formik';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';
import React, { ReactElement } from 'react';
import { Autocomplete, TextField } from '@mui/material';
import Skeleton from '@mui/material/Skeleton';
import * as Types from '../../../../../../graphql/types.generated';
import { FormWrapper } from 'src/components/Shared/Forms/Fields/FormWrapper';
import { FieldWrapper } from 'src/components/Shared/Forms/FieldWrapper';
import { useApiConstants } from 'src/components/Constants/UseApiConstants';
import { AccordionItem } from 'src/components/Shared/Forms/Accordions/AccordionItem';
import { useUpdateUserLocalePreferenceMutation } from './UpdateLocale.generated';

interface LocaleAccordianProps {
  handleAccordionChange: (panel: string) => void;
  expandedPanel: string;
  loading: boolean;
  data: string | undefined;
}

export const LocaleAccordian: React.FC<LocaleAccordianProps> = ({
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

  const PreferencesSchema: yup.SchemaOf<
    Pick<Types.Preference, 'localeDisplay'>
  > = yup.object({
    localeDisplay: yup.string().required(),
  });

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
      //update: (cache, { data }) => {
      //console.log('data: ', data);
      //const cacheId = cache.identify(data?.updatePreference);
      //console.log('cacheId: ', cacheId);
      // cache.modify({
      //   fields: {
      //     user: (existingFieldData, { toReference }) => {
      //       return {...existingFieldData, toReference(cacheId)};
      //     },
      //   },
      // });
      //   cache.modify({
      //     id: cacheId,
      //     fields: {
      //       localDisplay(data) {
      //         return data?.updatePreference?.preference.localeDisplay;
      //       },
      //     },
      //   });
      // },
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
          localeDisplay: data || '',
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
                  }}
                  options={languages.map((language) => language.id) || []}
                  getOptionLabel={(localeDisplay): string =>
                    languages.find(
                      ({ id }) => String(id) === String(localeDisplay),
                    )?.value ?? ''
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
