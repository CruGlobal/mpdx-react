import React, { ReactElement } from 'react';
import { Formik } from 'formik';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { PreferenceAccordion } from 'src/components/Shared/Forms/Accordions/AccordionEnum';
import { AccordionItem } from 'src/components/Shared/Forms/Accordions/AccordionItem';
import { FieldWrapper } from 'src/components/Shared/Forms/FieldWrapper';
import { FormWrapper } from 'src/components/Shared/Forms/FormWrapper';
import { CurrencyAutocomplete } from 'src/components/common/Autocomplete/CurrencyAutocomplete/CurrencyAutocomplete';
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
              <CurrencyAutocomplete
                disabled={isSubmitting}
                value={currency}
                onChange={(_, currencyCode) => {
                  setFieldValue('currency', currencyCode);
                }}
                textFieldProps={{
                  placeholder: label,
                  label: label,
                  sx: { marginTop: 1 },
                  autoFocus: true,
                }}
              />
            </FieldWrapper>
          </FormWrapper>
        )}
      </Formik>
    </AccordionItem>
  );
};
