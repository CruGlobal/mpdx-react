import React, { ReactElement, useMemo } from 'react';
import { Box, Button, TextField, Tooltip } from '@mui/material';
import { Formik } from 'formik';
import { DateTime } from 'luxon';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { AccordionItem } from 'src/components/Shared/Forms/Accordions/AccordionItem';
import { FieldWrapper } from 'src/components/Shared/Forms/FieldWrapper';
import { AccountListSettingsInput } from 'src/graphql/types.generated';
import { useLocale } from 'src/hooks/useLocale';
import { currencyFormat } from 'src/lib/intlFormat';
import { useUpdateAccountPreferencesMutation } from '../UpdateAccountPreferences.generated';
import { useMachineCalculatedGoalQuery } from './MachineCalculatedGoal.generated';

const accountPreferencesSchema: yup.ObjectSchema<
  Pick<AccountListSettingsInput, 'monthlyGoal'>
> = yup.object({
  monthlyGoal: yup.number().required(),
});

const formatMonthlyGoal = (
  goal: number | null,
  currency: string,
  locale: string,
): string => {
  if (goal === null) {
    return '';
  }

  if (currency && locale) {
    return currencyFormat(goal, currency, locale);
  }
  return goal.toString();
};

interface MonthlyGoalAccordionProps {
  handleAccordionChange: (panel: string) => void;
  expandedPanel: string;
  monthlyGoal: number | null;
  accountListId: string;
  currency: string;
  disabled?: boolean;
  handleSetupChange: () => Promise<void>;
}

export const MonthlyGoalAccordion: React.FC<MonthlyGoalAccordionProps> = ({
  handleAccordionChange,
  expandedPanel,
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

  const { data } = useMachineCalculatedGoalQuery({
    variables: {
      accountListId,
      month: DateTime.now().startOf('month').toISODate(),
    },
  });
  const calculatedGoal = data?.healthIndicatorData[0]?.machineCalculatedGoal;
  const formattedCalculatedGoal = useMemo(
    () => formatMonthlyGoal(calculatedGoal ?? null, currency, locale),
    [calculatedGoal, currency, locale],
  );

  const formattedMonthlyGoal = useMemo(
    () => formatMonthlyGoal(monthlyGoal, currency, locale),
    [monthlyGoal, currency, locale],
  );

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
        handleAccordionChange(label);
      },
      onError: () => {
        enqueueSnackbar(t('Saving failed.'), {
          variant: 'error',
        });
      },
    });
    handleSetupChange();
  };

  const instructions = calculatedGoal
    ? t(
        'Based on the past year, NetSuite estimates that you need at least {{goal}} of monthly support. You can use this amount or choose your own target monthly goal.',
        { goal: formattedCalculatedGoal },
      )
    : t(
        'This amount should be set to the amount your organization has determined is your target monthly goal. If you do not know, make your best guess for now. You can change it at any time.',
      );

  return (
    <AccordionItem
      onAccordionChange={handleAccordionChange}
      expandedPanel={expandedPanel}
      label={label}
      value={formattedMonthlyGoal}
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
          setFieldValue,
        }): ReactElement => (
          <form onSubmit={handleSubmit}>
            <FieldWrapper helperText={instructions}>
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
            <Box display="flex" gap={2} mt={2}>
              <Button
                variant="contained"
                color="primary"
                type="submit"
                disabled={!isValid || isSubmitting}
              >
                {t('Save')}
              </Button>
              {calculatedGoal && monthlyGoal !== calculatedGoal && (
                <Tooltip
                  title={t(
                    'Reset to NetSuite estimated goal of {{calculatedGoal}}',
                    {
                      calculatedGoal: formattedCalculatedGoal,
                    },
                  )}
                >
                  <Button
                    variant="outlined"
                    type="button"
                    onClick={() => setFieldValue('monthlyGoal', calculatedGoal)}
                  >
                    {t('Reset to Calculated Goal')}
                  </Button>
                </Tooltip>
              )}
            </Box>
          </form>
        )}
      </Formik>
    </AccordionItem>
  );
};
