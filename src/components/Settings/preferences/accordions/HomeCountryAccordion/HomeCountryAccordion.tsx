import React, { ReactElement } from 'react';
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
import { useUpdateAccountPreferencesMutation } from '../UpdateAccountPreferences.generated';
import {
  GetAccountPreferencesQuery,
  GetAccountPreferencesDocument,
} from '../../GetAccountPreferences.generated';

interface HomeCountryAccordionProps {
  handleAccordionChange: (panel: string) => void;
  expandedPanel: string;
  loading: boolean;
  data: GetAccountPreferencesQuery | undefined;
  accountListId: string;
}

export const HomeCountryAccordion: React.FC<HomeCountryAccordionProps> = ({
  handleAccordionChange,
  expandedPanel,
  loading,
  data,
  accountListId,
}) => {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const [updateAccountPreferencesMutation] =
    useUpdateAccountPreferencesMutation();
  const label = 'Home Country';

  const countries = [
    {
      id: 'United States',
      value: 'United States',
    },
    {
      id: 'United States Minor Outlying Islands',
      value: 'United States Minor Outlying Islands',
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

  const PreferencesSchema: yup.SchemaOf<
    Pick<Types.AccountListSettingsInput, 'homeCountry'>
  > = yup.object({
    homeCountry: yup.string().required(),
  });

  const onSubmit = async (
    attributes: Pick<Types.AccountListSettingsInput, 'homeCountry'>,
  ) => {
    await updateAccountPreferencesMutation({
      variables: {
        input: {
          id: accountListId,
          attributes: {
            id: accountListId,
            settings: {
              homeCountry: attributes.homeCountry,
            },
          },
        },
      },
      update: (cache) => {
        cache.updateQuery(
          {
            query: GetAccountPreferencesDocument,
            variables: {
              accountListId,
            },
          },
          (data) => {
            return {
              user: data.user,
              accountList: {
                ...data.accountList,
                settings: {
                  ...data.accountList.settings,
                  homeCountry: attributes.homeCountry,
                },
              },
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
      value={data?.accountList?.settings?.homeCountry || ''}
      fullWidth={true}
    >
      <Formik
        initialValues={{
          homeCountry: data?.accountList?.settings?.homeCountry,
        }}
        validationSchema={PreferencesSchema}
        onSubmit={onSubmit}
      >
        {({
          values: { homeCountry },
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
                  'This should be the place from which you are living and sending out physical communications. This will be used in exports for mailing address information.',
                )}
              >
                <Autocomplete
                  autoSelect
                  disabled={isSubmitting}
                  autoHighlight
                  loading={loading}
                  value={homeCountry}
                  onChange={(_, value) => {
                    setFieldValue('homeCountry', value);
                  }}
                  options={countries.map((country) => country.id) || []}
                  getOptionLabel={(homeCountry): string =>
                    countries.find(({ id }) => id === homeCountry)?.value ?? ''
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
