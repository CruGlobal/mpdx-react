import React, { ReactElement } from 'react';
import { Autocomplete, TextField } from '@mui/material';
import { Formik } from 'formik';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { useApiConstants } from 'src/components/Constants/UseApiConstants';
import { PreferenceAccordion } from 'src/components/Shared/Forms/Accordions/AccordionEnum';
import { AccordionItem } from 'src/components/Shared/Forms/Accordions/AccordionItem';
import { FieldWrapper } from 'src/components/Shared/Forms/FieldWrapper';
import { FormWrapper } from 'src/components/Shared/Forms/FormWrapper';
import { AccountListSettingsInput } from 'src/graphql/types.generated';
import { AccordionProps } from '../../../accordionHelper';
import { useUpdateAccountPreferencesMutation } from '../UpdateAccountPreferences.generated';

const preferencesSchema: yup.ObjectSchema<
  Pick<AccountListSettingsInput, 'currency'>
> = yup.object({
  currency: yup.string().required(),
});

interface CurrencyAccordionProps extends AccordionProps<PreferenceAccordion> {
  currency: string;
  accountListId: string;
  disabled?: boolean;
}

export const CurrencyAccordion: React.FC<CurrencyAccordionProps> = ({
  handleAccordionChange,
  expandedAccordion,
  currency,
  accountListId,
  disabled,
}) => {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const [updateAccountPreferences] = useUpdateAccountPreferencesMutation();
  const constants = useApiConstants();
  const currencies = constants?.pledgeCurrency ?? [];
  const label = t('Default Currency');

  const onSubmit = async (
    attributes: Pick<AccountListSettingsInput, 'currency'>,
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
      accordion={PreferenceAccordion.Currency}
      onAccordionChange={handleAccordionChange}
      expandedAccordion={expandedAccordion}
      label={label}
      value={currency}
      fullWidth
      disabled={disabled}
    >
      <Formik
        initialValues={{
          currency: currency,
        }}
        validationSchema={preferencesSchema}
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
              helperText={t(
                'This should be the currency that you receive your paychecks in. This will be used when converting donations in other currencies.',
              )}
            >
              <Autocomplete
                disabled={isSubmitting}
                autoHighlight
                value={currency}
                onChange={(_, id) => {
                  setFieldValue('currency', id);
                }}
                options={currencies.map((cur) => cur.code) || []}
                getOptionLabel={(currency): string => {
                  const selectedCurrency = currencies.find(
                    ({ code }) => code === currency,
                  );
                  if (!selectedCurrency) {
                    return '';
                  }
                  return `${selectedCurrency.name} - ${selectedCurrency.codeSymbolString}`;
                }}
                fullWidth
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder={label}
                    // eslint-disable-next-line jsx-a11y/no-autofocus
                    autoFocus
                    label={label}
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
