import React, { ReactElement, useMemo } from 'react';
import WarningIcon from '@mui/icons-material/Warning';
import { Box, Button, TextField, Tooltip, Typography } from '@mui/material';
import { Formik } from 'formik';
import { DateTime } from 'luxon';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { PreferenceAccordion } from 'src/components/Shared/Forms/Accordions/AccordionEnum';
import { AccordionItem } from 'src/components/Shared/Forms/Accordions/AccordionItem';
import { FieldWrapper } from 'src/components/Shared/Forms/FieldWrapper';
import { AccountListSettingsInput } from 'src/graphql/types.generated';
import { useLocale } from 'src/hooks/useLocale';
import { currencyFormat, dateFormat, numberFormat } from 'src/lib/intlFormat';
import { AccordionProps } from '../../../accordionHelper';
import { useUpdateAccountPreferencesMutation } from '../UpdateAccountPreferences.generated';
import { useMachineCalculatedGoalQuery } from './MachineCalculatedGoal.generated';

const accountPreferencesSchema: yup.ObjectSchema<
  Pick<AccountListSettingsInput, 'monthlyGoal'>
> = yup.object({
  monthlyGoal: yup.number().required(),
});

const formatMonthlyGoal = (
  goal: number | null,
  currency: string | null,
  locale: string,
): string => {
  if (goal === null) {
    return '';
  }

  if (currency) {
    return currencyFormat(goal, currency, locale);
  }
  return numberFormat(goal, locale);
};

interface MonthlyGoalAccordionProps
  extends AccordionProps<PreferenceAccordion> {
  monthlyGoal: number | null;
  monthlyGoalUpdatedAt: string | null;
  accountListId: string;
  currency: string | null;
  disabled?: boolean;
  handleSetupChange: () => Promise<void>;
}

export const MonthlyGoalAccordion: React.FC<MonthlyGoalAccordionProps> = ({
  handleAccordionChange,
  expandedAccordion,
  monthlyGoal: initialMonthlyGoal,
  monthlyGoalUpdatedAt,
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
    },
  });
  const {
    machineCalculatedGoal: calculatedGoal,
    machineCalculatedGoalCurrency: calculatedCurrency,
  } = data?.healthIndicatorData.at(-1) ?? {};
  const formattedCalculatedGoal = useMemo(
    () =>
      formatMonthlyGoal(
        calculatedGoal ?? null,
        calculatedCurrency ?? null,
        locale,
      ),
    [calculatedGoal, calculatedCurrency, locale],
  );

  const accordionValue = useMemo(() => {
    const goal = formatMonthlyGoal(initialMonthlyGoal, currency, locale);

    if (initialMonthlyGoal === null) {
      if (typeof calculatedGoal === 'number') {
        // There is no preferences goal, but there is a machine-calculated goal
        return t('{{goal}} (estimated)', { goal: formattedCalculatedGoal });
      } else {
        // There is no preferences goal or machine-calculated goal
        return null;
      }
    } else if (
      typeof currency === 'string' &&
      currency === calculatedCurrency &&
      typeof calculatedGoal === 'number' &&
      initialMonthlyGoal < calculatedGoal
    ) {
      // Staff-entered goal is below machine-calculated goal
      return (
        <Typography component="span" color="statusWarning.main">
          {t('{{goal}} (below machine-calculated support goal)', { goal })}
        </Typography>
      );
    } else if (monthlyGoalUpdatedAt) {
      // Staff-entered goal has an updated date
      const date = DateTime.fromISO(monthlyGoalUpdatedAt);
      return t('{{goal}} (last updated {{updated}})', {
        goal,
        updated: dateFormat(date, locale),
      });
    } else {
      // Staff-entered goal does not have an updated date
      return goal;
    }
  }, [
    initialMonthlyGoal,
    calculatedGoal,
    formattedCalculatedGoal,
    monthlyGoalUpdatedAt,
    currency,
    locale,
  ]);

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

  const getInstructions = () => {
    if (typeof calculatedGoal !== 'number') {
      return t(
        'This amount should be set to the amount your organization has determined is your target monthly goal. If you do not know, make your best guess for now. You can change it at any time.',
      );
    }

    if (initialMonthlyGoal) {
      return t(
        'Based on the past year, NetSuite estimates that you need at least {{goal}} of monthly support. You can choose your own target monthly goal or leave it blank to use the estimate.',
        { goal: formattedCalculatedGoal },
      );
    } else {
      return t(
        'Based on the past year, NetSuite estimates that you need at least {{goal}} of monthly support. You can choose your own target monthly goal or reset it to use the estimate.',
        { goal: formattedCalculatedGoal },
      );
    }
  };

  const getWarning = (currentGoal: number | null) => {
    if (
      typeof currentGoal === 'number' &&
      typeof calculatedGoal === 'number' &&
      currentGoal < calculatedGoal
    ) {
      return (
        <Typography
          component="span"
          color="statusWarning.main"
          display="flex"
          my={1}
          gap={0.5}
        >
          <WarningIcon />
          {t(
            'Your current monthly goal is less than the amount NetSuite estimates that you need. Please review your goal and adjust it if needed.',
          )}
        </Typography>
      );
    }
  };

  return (
    <AccordionItem
      accordion={PreferenceAccordion.MonthlyGoal}
      onAccordionChange={handleAccordionChange}
      expandedAccordion={expandedAccordion}
      label={label}
      value={accordionValue}
      fullWidth
      disabled={disabled}
    >
      <Formik
        initialValues={{
          monthlyGoal: initialMonthlyGoal,
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
          <form onSubmit={handleSubmit}>
            <FieldWrapper
              helperText={
                <>
                  {getInstructions()}
                  {getWarning(monthlyGoal)}
                </>
              }
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
            <Box display="flex" gap={2} mt={2}>
              <Button
                variant="contained"
                color="primary"
                type="submit"
                disabled={!isValid || isSubmitting}
              >
                {t('Save')}
              </Button>
              {calculatedGoal && initialMonthlyGoal !== null && (
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
                    onClick={() => {
                      onSubmit({ monthlyGoal: null });
                    }}
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
