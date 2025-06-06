import React, { ReactElement, useMemo } from 'react';
import { TextField } from '@mui/material';
import { Formik } from 'formik';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { PreferenceAccordion } from 'src/components/Shared/Forms/Accordions/AccordionEnum';
import { AccordionItem } from 'src/components/Shared/Forms/Accordions/AccordionItem';
import { FieldWrapper } from 'src/components/Shared/Forms/FieldWrapper';
import { FormWrapper } from 'src/components/Shared/Forms/FormWrapper';
import { AccountListSettingsInput } from 'src/graphql/types.generated';
import { useLocale } from 'src/hooks/useLocale';
import { currencyFormat } from 'src/lib/intlFormat';
import { AccordionProps } from '../../../accordionHelper';
import { useUpdateAccountPreferencesMutation } from '../UpdateAccountPreferences.generated';

const accountPreferencesSchema: yup.ObjectSchema<
  Pick<AccountListSettingsInput, 'monthlyGoal'>
> = yup.object({
  monthlyGoal: yup.number().required(),
});

interface MonthlyGoalAccordionProps
  extends AccordionProps<PreferenceAccordion> {
  monthlyGoal: number | null;
  accountListId: string;
  currency: string;
  disabled?: boolean;
  handleSetupChange: () => Promise<void>;
}

export const MonthlyGoalAccordion: React.FC<MonthlyGoalAccordionProps> = ({
  handleAccordionChange,
  expandedAccordion,
  monthlyGoal,
  accountListId,
  currency,
  disabled,
  handleSetupChange,
}) => {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const [updateAccountPreferences] = useUpdateAccountPreferencesMutation();
  const locale = useLocale();
  const label = t('Monthly Goal');

  const monthlyGoalString = useMemo(() => {
    return monthlyGoal && locale && currency
      ? currencyFormat(monthlyGoal, currency, locale)
      : monthlyGoal
      ? String(monthlyGoal)
      : '';
  }, [monthlyGoal, locale, currency]);

  const onSubmit = async (
    attributes: Pick<AccountListSettingsInput, 'monthlyGoal'>,
  ) => {
    await updateAccountPreferences({
      variables: {
        input: {
          id: accountListId,
          attributes: {
            id: accountListId,
            settings: { monthlyGoal: attributes.monthlyGoal },
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
    handleSetupChange();
  };

  return (
    <AccordionItem
      accordion={PreferenceAccordion.MonthlyGoal}
      onAccordionChange={handleAccordionChange}
      expandedAccordion={expandedAccordion}
      label={label}
      value={monthlyGoalString}
      fullWidth
      disabled={disabled}
    >
      <Formik
        initialValues={{
          monthlyGoal: monthlyGoal,
        }}
        validationSchema={accountPreferencesSchema}
        onSubmit={onSubmit}
        enableReinitialize
        validateOnMount
      >
        {({
          values: { monthlyGoal },
          errors,
          handleSubmit,
          isSubmitting,
          isValid,
          handleChange,
        }): ReactElement => (
          <FormWrapper
            onSubmit={handleSubmit}
            isValid={isValid}
            isSubmitting={isSubmitting}
          >
            <FieldWrapper
              helperText={t(
                'This amount should be set to the amount your organization has determined is your target monthly goal. If you do not know, make your best guess for now. You can change it at any time.',
              )}
            >
              <TextField
                value={monthlyGoal}
                onChange={handleChange}
                inputProps={{
                  'aria-label': label,
                  type: 'number',
                }}
                name="monthlyGoal"
                error={!!errors.monthlyGoal}
                helperText={errors.monthlyGoal && t('Monthly Goal is required')}
                // eslint-disable-next-line jsx-a11y/no-autofocus
                autoFocus
                label={label}
                sx={{ marginTop: 1 }}
                id="monthlyGoalInput"
              />
            </FieldWrapper>
          </FormWrapper>
        )}
      </Formik>
    </AccordionItem>
  );
};
