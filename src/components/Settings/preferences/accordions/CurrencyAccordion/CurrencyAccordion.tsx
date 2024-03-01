import React, { ReactElement } from 'react';
import { Autocomplete, TextField } from '@mui/material';
import { Formik } from 'formik';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { useApiConstants } from 'src/components/Constants/UseApiConstants';
import { AccordionItem } from 'src/components/Shared/Forms/Accordions/AccordionItem';
import { FieldWrapper } from 'src/components/Shared/Forms/FieldWrapper';
import { FormWrapper } from 'src/components/Shared/Forms/FormWrapper';
import * as Types from 'src/graphql/types.generated';
import { useUpdateAccountPreferencesMutation } from '../UpdateAccountPreferences.generated';

interface CurrencyAccordionProps {
  handleAccordionChange: (panel: string) => void;
  expandedPanel: string;
  currency: string;
  accountListId: string;
}

export const CurrencyAccordion: React.FC<CurrencyAccordionProps> = ({
  handleAccordionChange,
  expandedPanel,
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
      fullWidth
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
              helperText={t(
                'This should be the place from which you are living and sending out physical communications. This will be used in exports for mailing address information.',
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
                  if (!selectedCurrency) return '';
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
