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
import { useApiConstants } from 'src/components/Constants/UseApiConstants';

interface CurrencyAccordionProps {
  handleAccordionChange: (panel: string) => void;
  expandedPanel: string;
  loading: boolean;
  data: GetAccountPreferencesQuery | undefined;
  accountListId: string;
}

export const CurrencyAccordion: React.FC<CurrencyAccordionProps> = ({
  handleAccordionChange,
  expandedPanel,
  loading,
  data,
  accountListId,
}) => {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const [updateAccountPreferences] = useUpdateAccountPreferencesMutation();
  const constants = useApiConstants();
  const currencies = constants?.pledgeCurrencies ?? [];
  const label = 'Default Currency';
  //console.log('currencies', currencies);

  const PreferencesSchema: yup.SchemaOf<
    Pick<Types.AccountListSettingsInput, 'currency'>
  > = yup.object({
    currency: yup.string().required(),
  });

  const onSubmit = async (
    attributes: Pick<Types.AccountListSettingsInput, 'currency'>,
  ) => {
    await updateAccountPreferences({
      variables: {
        input: {
          id: accountListId,
          attributes: {
            id: accountListId,
            settings: {
              currency: attributes.currency,
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
                  currency: attributes.currency,
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
      value={data?.accountList?.settings?.currency || ''}
      fullWidth={true}
    >
      <Formik
        initialValues={{
          currency: data?.accountList?.settings?.currency,
        }}
        validationSchema={PreferencesSchema}
        onSubmit={onSubmit}
      >
        {({
          values: { currency },
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
                  value={currency}
                  onChange={(_, value) => {
                    setFieldValue('currency', value);
                  }}
                  options={currencies.map((cur) => cur.id) || []}
                  getOptionLabel={(currency): string =>
                    currencies.find(({ id }) => id === currency)?.value ?? ''
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
