import React, { ReactElement } from 'react';
import { TextField } from '@mui/material';
import { Formik } from 'formik';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { AccordionItem } from 'src/components/Shared/Forms/Accordions/AccordionItem';
import { FieldWrapper } from 'src/components/Shared/Forms/FieldWrapper';
import { FormWrapper } from 'src/components/Shared/Forms/Fields/FormWrapper';
import * as Types from 'src/graphql/types.generated';
import { useLocale } from 'src/hooks/useLocale';
import { currencyFormat } from 'src/lib/intlFormat';
import { useUpdateAccountPreferencesMutation } from '../UpdateAccountPreferences.generated';

interface MonthlyGoalAccordionProps {
  handleAccordionChange: (panel: string) => void;
  expandedPanel: string;
  loading: boolean;
  monthlyGoal: number | null;
  accountListId: string;
  currency: string;
}

export const MonthlyGoalAccordion: React.FC<MonthlyGoalAccordionProps> = ({
  handleAccordionChange,
  expandedPanel,
  monthlyGoal,
  accountListId,
  currency,
}) => {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const [updateAccountPreferences] = useUpdateAccountPreferencesMutation();
  const locale = useLocale();
  const label = t('Monthly Goal');

  const AccountPreferencesSchema: yup.SchemaOf<
    Pick<Types.AccountListSettingsInput, 'monthlyGoal'>
  > = yup.object({
    monthlyGoal: yup.number().required(),
  });

  const onSubmit = async (
    attributes: Pick<Types.AccountListSettingsInput, 'monthlyGoal'>,
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
      value={
        monthlyGoal && locale && currency
          ? currencyFormat(monthlyGoal, currency, locale)
          : monthlyGoal
          ? String(monthlyGoal)
          : ''
      }
      fullWidth
    >
      <Formik
        initialValues={{
          monthlyGoal: monthlyGoal,
        }}
        validationSchema={AccountPreferencesSchema}
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
              labelText={label}
              helperText={t(
                'This amount should be set to the amount your organization has determined is your target monthly goal. If you do not know, make your best guess for now. You can change it at any time.',
              )}
            >
              <TextField
                value={monthlyGoal}
                onChange={handleChange('monthlyGoal')}
                inputProps={{
                  'aria-label': label,
                  type: 'number',
                  'data-testid': 'input' + label.replace(/\s/g, ''),
                }}
                error={!!errors.monthlyGoal}
                helperText={errors.monthlyGoal && t('Monthly Goal is required')}
              />
            </FieldWrapper>
          </FormWrapper>
        )}
      </Formik>
    </AccordionItem>
  );
};
