import React, { ReactElement } from 'react';
import { Autocomplete, TextField } from '@mui/material';
import { Formik } from 'formik';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { useApiConstants } from 'src/components/Constants/UseApiConstants';
import { AccordionItem } from 'src/components/Shared/Forms/Accordions/AccordionItem';
import { FieldWrapper } from 'src/components/Shared/Forms/FieldWrapper';
import { FormWrapper } from 'src/components/Shared/Forms/Fields/FormWrapper';
import * as Types from 'src/graphql/types.generated';
import { useUpdateAccountPreferencesMutation } from '../UpdateAccountPreferences.generated';

interface CurrencyAccordionProps {
  handleAccordionChange: (panel: string) => void;
  expandedPanel: string;
  loading: boolean;
  currency: string;
  accountListId: string;
}

export const CurrencyAccordion: React.FC<CurrencyAccordionProps> = ({
  handleAccordionChange,
  expandedPanel,
  loading,
  currency,
  accountListId,
}) => {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const [updateAccountPreferences] = useUpdateAccountPreferencesMutation();
  const constants = useApiConstants();
  const currencies = constants?.pledgeCurrencies ?? [];
  const label = t('Default Currency');

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
      label={label}
      value={currency}
      fullWidth={true}
    >
      <Formik
        initialValues={{
          currency: currency,
        }}
        validationSchema={PreferencesSchema}
        onSubmit={onSubmit}
        validateOnMount
      >
        {({
          handleSubmit,
          isSubmitting,
          isValid,
          setFieldValue,
          values: { currency },
        }): ReactElement => (
          <FormWrapper
            onSubmit={handleSubmit}
            isValid={isValid}
            isSubmitting={isSubmitting}
          >
            <FieldWrapper
              labelText={label}
              helperText={t(
                'This should be the place from which you are living and sending out physical communications. This will be used in exports for mailing address information.',
              )}
            >
              <Autocomplete
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
