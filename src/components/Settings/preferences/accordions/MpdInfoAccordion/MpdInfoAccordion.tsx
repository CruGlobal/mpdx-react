import React, { ReactElement } from 'react';
import { Grid, TextField } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { Formik } from 'formik';
import { DateTime } from 'luxon';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { AccordionItem } from 'src/components/Shared/Forms/Accordions/AccordionItem';
import { FieldWrapper } from 'src/components/Shared/Forms/FieldWrapper';
import { FormWrapper } from 'src/components/Shared/Forms/Fields/FormWrapper';
import * as Types from 'src/graphql/types.generated';
import { useLocale } from 'src/hooks/useLocale';
import {
  currencyFormat,
  getDateFormatPattern,
} from 'src/lib/intlFormat/intlFormat';
import { useUpdateAccountPreferencesMutation } from '../UpdateAccountPreferences.generated';

interface MpdInfoAccordionProps {
  handleAccordionChange: (panel: string) => void;
  expandedPanel: string;
  loading: boolean;
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

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const AccountPreferencesSchema: yup.SchemaOf<
    Pick<
      Types.AccountList,
      'activeMpdMonthlyGoal' | 'activeMpdStartAt' | 'activeMpdFinishAt'
    >
  > = yup.object({
    activeMpdMonthlyGoal: yup
      .number()
      .nullable(true)
      .transform((_, val) => (val === Number(val) ? val : null)),
    activeMpdStartAt: yup
      .string()
      .nullable(true)
      .transform((_, val) => (val === Number(val) ? val : null)),
    activeMpdFinishAt: yup
      .string()
      .nullable(true)
      .transform((_, val) => (val === Number(val) ? val : null)),
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
        (activeMpdMonthlyGoal && activeMpdMonthlyGoal > 0 && currency && locale
          ? currencyFormat(activeMpdMonthlyGoal, currency, locale) + '   '
          : activeMpdMonthlyGoal && activeMpdMonthlyGoal > 0
          ? activeMpdMonthlyGoal + '   '
          : '') +
        (activeMpdStartAt ? formatDate(activeMpdStartAt) + ' - ' : '') +
        (activeMpdFinishAt ? formatDate(activeMpdFinishAt) : '')
      }
      fullWidth
    >
      <Formik
        initialValues={{
          activeMpdMonthlyGoal: activeMpdMonthlyGoal,
          activeMpdStartAt: activeMpdStartAt,
          activeMpdFinishAt: activeMpdFinishAt,
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
                <Grid item xs={12} md={6}>
                  <FieldWrapper labelText={t('Start Date')}>
                    <DatePicker<Date, DateTime>
                      renderInput={(params) => (
                        <TextField
                          fullWidth
                          inputProps={{
                            'aria-label': t('Start Date'),
                            'data-testid': 'Start Date',
                          }}
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
                <Grid item xs={12} md={6}>
                  <FieldWrapper labelText={t('End Date')}>
                    <DatePicker<Date, DateTime>
                      renderInput={(params) => (
                        <TextField
                          fullWidth
                          inputProps={{
                            'aria-label': t('End Date'),
                            'data-testid': 'End Date',
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
              <FieldWrapper
                labelText={t('New Recurring Commitment Goal')}
                helperText={t(
                  'This should be set to the amount of new recurring commitments you expect to raise during the period set above. If you do not know, make your best guess for now. You can change it at any time.',
                )}
              >
                <TextField
                  value={activeMpdMonthlyGoal}
                  onChange={handleChange('activeMpdMonthlyGoal')}
                  inputProps={{
                    'aria-label': label,
                    type: 'number',
                    'data-testid': 'input' + label.replace(/\s/g, ''),
                  }}
                />
              </FieldWrapper>
            </>
          </FormWrapper>
        )}
      </Formik>
    </AccordionItem>
  );
};
