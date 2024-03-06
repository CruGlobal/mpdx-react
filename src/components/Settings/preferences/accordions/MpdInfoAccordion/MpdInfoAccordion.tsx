import React, { ReactElement, useMemo } from 'react';
import { Grid, TextField } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { Formik } from 'formik';
import { DateTime } from 'luxon';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { AccordionItem } from 'src/components/Shared/Forms/Accordions/AccordionItem';
import { HelperPositionEnum } from 'src/components/Shared/Forms/FieldHelper';
import { FieldWrapper } from 'src/components/Shared/Forms/FieldWrapper';
import { FormWrapper } from 'src/components/Shared/Forms/FormWrapper';
import * as Types from 'src/graphql/types.generated';
import { useLocale } from 'src/hooks/useLocale';
import {
  currencyFormat,
  dateFormat,
  getDateFormatPattern,
} from 'src/lib/intlFormat/intlFormat';
import { useUpdateAccountPreferencesMutation } from '../UpdateAccountPreferences.generated';

interface MpdInfoAccordionProps {
  handleAccordionChange: (panel: string) => void;
  expandedPanel: string;
  activeMpdMonthlyGoal: number | null;
  activeMpdStartAt: string | null;
  activeMpdFinishAt: string | null;
  currency: string;
  accountListId: string;
}

export const MpdInfoAccordion: React.FC<MpdInfoAccordionProps> = ({
  handleAccordionChange,
  expandedPanel,
  activeMpdMonthlyGoal,
  activeMpdStartAt,
  activeMpdFinishAt,
  currency,
  accountListId,
}) => {
  const { t } = useTranslation();
  const locale = useLocale();
  const { enqueueSnackbar } = useSnackbar();
  const [updateAccountPreferences] = useUpdateAccountPreferencesMutation();
  const label = t('MPD Info');

  const numberOrNullTransform = (_, val) => (val === Number(val) ? val : null);

  const AccountPreferencesSchema: yup.SchemaOf<
    Pick<
      Types.AccountList,
      'activeMpdMonthlyGoal' | 'activeMpdStartAt' | 'activeMpdFinishAt'
    >
  > = yup.object({
    activeMpdMonthlyGoal: yup
      .number()
      .nullable()
      .transform(numberOrNullTransform),
    activeMpdStartAt: yup.string().nullable().transform(numberOrNullTransform),
    activeMpdFinishAt: yup.string().nullable().transform(numberOrNullTransform),
  });

  const onSubmit = async (
    attributes: Pick<
      Types.AccountList,
      'activeMpdMonthlyGoal' | 'activeMpdStartAt' | 'activeMpdFinishAt'
    >,
  ) => {
    await updateAccountPreferences({
      variables: {
        input: {
          id: accountListId,
          attributes: {
            id: accountListId,
            activeMpdMonthlyGoal: attributes.activeMpdMonthlyGoal || null,
            activeMpdStartAt: attributes.activeMpdStartAt || null,
            activeMpdFinishAt: attributes.activeMpdFinishAt || null,
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
      onAccordionChange={handleAccordionChange}
      expandedPanel={expandedPanel}
      label={label}
      value={goalDateString}
      fullWidth
    >
      <Formik
        initialValues={{
          activeMpdMonthlyGoal: activeMpdMonthlyGoal,
          activeMpdStartAt:
            activeMpdStartAt && DateTime.fromISO(activeMpdStartAt).toISO(),
          activeMpdFinishAt:
            activeMpdFinishAt && DateTime.fromISO(activeMpdFinishAt).toISO(),
        }}
        validationSchema={AccountPreferencesSchema}
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
            <>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <FieldWrapper labelText={t('Start Date')}>
                    <DatePicker<Date, DateTime>
                      renderInput={(params) => (
                        <TextField
                          fullWidth
                          inputProps={{
                            'aria-label': t('Start Date'),
                          }}
                          // eslint-disable-next-line jsx-a11y/no-autofocus
                          autoFocus
                          {...params}
                        />
                      )}
                      onChange={(date) =>
                        setFieldValue('activeMpdStartAt', date)
                      }
                      value={
                        activeMpdStartAt ? new Date(activeMpdStartAt) : null
                      }
                      inputFormat={getDateFormatPattern(locale)}
                      componentsProps={{
                        actionBar: {
                          actions: ['clear', 'accept'],
                        },
                      }}
                    />
                  </FieldWrapper>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FieldWrapper labelText={t('End Date')}>
                    <DatePicker<Date, DateTime>
                      renderInput={(params) => (
                        <TextField
                          fullWidth
                          inputProps={{
                            'aria-label': t('End Date'),
                          }}
                          {...params}
                        />
                      )}
                      onChange={(date) =>
                        setFieldValue('activeMpdFinishAt', date)
                      }
                      value={
                        activeMpdFinishAt ? new Date(activeMpdFinishAt) : null
                      }
                      inputFormat={getDateFormatPattern(locale)}
                      componentsProps={{
                        actionBar: {
                          actions: ['clear', 'accept'],
                        },
                      }}
                    />
                  </FieldWrapper>
                </Grid>
              </Grid>
              <Grid sx={{ marginTop: 2 }}>
                <FieldWrapper
                  labelText={t('New Recurring Commitment Goal')}
                  helperText={t(
                    'This should be set to the amount of new recurring commitments you expect to raise during the period set above. If you do not know, make your best guess for now. You can change it at any time.',
                  )}
                  helperPosition={HelperPositionEnum.Bottom}
                >
                  <TextField
                    value={activeMpdMonthlyGoal}
                    onChange={handleChange('activeMpdMonthlyGoal')}
                    inputProps={{
                      'aria-label': label,
                      type: 'number',
                    }}
                  />
                </FieldWrapper>
              </Grid>
            </>
          </FormWrapper>
        )}
      </Formik>
    </AccordionItem>
  );
};
