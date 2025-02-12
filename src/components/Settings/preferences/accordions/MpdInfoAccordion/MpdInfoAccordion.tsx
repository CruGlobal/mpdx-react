import React, { ReactElement, useMemo } from 'react';
import { Grid, TextField } from '@mui/material';
import { Formik } from 'formik';
import { DateTime } from 'luxon';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { PreferenceAccordion } from 'src/components/Shared/Forms/Accordions/AccordionEnum';
import { AccordionItem } from 'src/components/Shared/Forms/Accordions/AccordionItem';
import { HelperPositionEnum } from 'src/components/Shared/Forms/FieldHelper';
import { FieldWrapper } from 'src/components/Shared/Forms/FieldWrapper';
import { FormWrapper } from 'src/components/Shared/Forms/FormWrapper';
import { CustomDateField } from 'src/components/common/DateTimePickers/CustomDateField';
import { useLocale } from 'src/hooks/useLocale';
import { nullableDateTime } from 'src/lib/formikHelpers';
import { currencyFormat, dateFormat } from 'src/lib/intlFormat';
import { useUpdateAccountPreferencesMutation } from '../UpdateAccountPreferences.generated';

const numberOrNullTransform = (_: unknown, val: unknown) =>
  val === Number(val) ? val : null;

const accountPreferencesSchema = yup.object({
  activeMpdMonthlyGoal: yup
    .number()
    .nullable()
    .transform(numberOrNullTransform),
  activeMpdStartAt: nullableDateTime(),
  activeMpdFinishAt: nullableDateTime(),
});

type Attributes = yup.InferType<typeof accountPreferencesSchema>;

interface MpdInfoAccordionProps {
  handleAccordionChange: (accordion: PreferenceAccordion | null) => void;
  expandedAccordion: PreferenceAccordion | null;
  activeMpdMonthlyGoal: number | null;
  activeMpdStartAt: string | null;
  activeMpdFinishAt: string | null;
  currency: string;
  accountListId: string;
  disabled?: boolean;
}

export const MpdInfoAccordion: React.FC<MpdInfoAccordionProps> = ({
  handleAccordionChange,
  expandedAccordion,
  activeMpdMonthlyGoal,
  activeMpdStartAt,
  activeMpdFinishAt,
  currency,
  accountListId,
  disabled,
}) => {
  const { t } = useTranslation();
  const locale = useLocale();
  const { enqueueSnackbar } = useSnackbar();
  const [updateAccountPreferences] = useUpdateAccountPreferencesMutation();
  const label = t('MPD Info');

  const onSubmit = async (attributes: Attributes) => {
    await updateAccountPreferences({
      variables: {
        input: {
          id: accountListId,
          attributes: {
            id: accountListId,
            activeMpdMonthlyGoal: attributes.activeMpdMonthlyGoal || null,
            activeMpdStartAt: attributes.activeMpdStartAt?.toISODate() ?? null,
            activeMpdFinishAt:
              attributes.activeMpdFinishAt?.toISODate() ?? null,
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

  const goalDateString = useMemo(() => {
    const mpdMonthlyGoal =
      activeMpdMonthlyGoal && activeMpdMonthlyGoal > 0 && currency && locale
        ? ' (' + currencyFormat(activeMpdMonthlyGoal, currency, locale) + ')'
        : activeMpdMonthlyGoal && activeMpdMonthlyGoal > 0
        ? ' (' + activeMpdMonthlyGoal + ')'
        : '';
    const mpdStartDate = activeMpdStartAt
      ? dateFormat(DateTime.fromISO(activeMpdStartAt), locale) + ' - '
      : '';
    const mpdFinishDate = activeMpdFinishAt
      ? dateFormat(DateTime.fromISO(activeMpdFinishAt), locale)
      : '';
    return mpdStartDate + mpdFinishDate + mpdMonthlyGoal;
  }, [
    activeMpdMonthlyGoal,
    activeMpdStartAt,
    activeMpdFinishAt,
    locale,
    currency,
  ]);

  return (
    <AccordionItem
      accordion={PreferenceAccordion.MpdInfo}
      onAccordionChange={handleAccordionChange}
      expandedAccordion={expandedAccordion}
      label={label}
      value={goalDateString}
      fullWidth
      disabled={disabled}
    >
      <Formik
        initialValues={{
          activeMpdMonthlyGoal,
          activeMpdStartAt: activeMpdStartAt
            ? DateTime.fromISO(activeMpdStartAt)
            : null,
          activeMpdFinishAt: activeMpdFinishAt
            ? DateTime.fromISO(activeMpdFinishAt)
            : null,
        }}
        validationSchema={accountPreferencesSchema}
        onSubmit={onSubmit}
        enableReinitialize
      >
        {({
          values: { activeMpdMonthlyGoal, activeMpdFinishAt, activeMpdStartAt },
          handleSubmit,
          isSubmitting,
          isValid,
          handleChange,
          setFieldValue,
        }): ReactElement => (
          <FormWrapper
            onSubmit={handleSubmit}
            isValid={isValid}
            isSubmitting={isSubmitting}
          >
            <Grid container spacing={3} pt={1}>
              <Grid item xs={12} sm={6}>
                <CustomDateField
                  label={t('Start Date')}
                  value={activeMpdStartAt}
                  onChange={(date) => setFieldValue('activeMpdStartAt', date)}
                  // eslint-disable-next-line jsx-a11y/no-autofocus
                  autoFocus
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <CustomDateField
                  label={t('End Date')}
                  value={activeMpdFinishAt}
                  onChange={(date) => setFieldValue('activeMpdFinishAt', date)}
                />
              </Grid>
            </Grid>
            <Grid sx={{ marginTop: 2 }}>
              <FieldWrapper
                helperText={t(
                  'This should be set to the amount of new recurring commitments you expect to raise during the period set above. If you do not know, make your best guess for now. You can change it at any time.',
                )}
                helperPosition={HelperPositionEnum.Bottom}
              >
                <TextField
                  label={t('New Recurring Commitment Goal')}
                  value={activeMpdMonthlyGoal}
                  onChange={handleChange('activeMpdMonthlyGoal')}
                  inputProps={{
                    'aria-label': label,
                    type: 'number',
                  }}
                />
              </FieldWrapper>
            </Grid>
          </FormWrapper>
        )}
      </Formik>
    </AccordionItem>
  );
};
