import React from 'react';
import { Grid, MenuItem, TextField, Typography } from '@mui/material';
import { styled } from '@mui/system';
import { Field, FieldProps, FormikProps } from 'formik';
import { useTranslation } from 'react-i18next';

const StyledFinancialForm = styled('div')({
  '.prefix': {
    marginRight: 8,
  },
  '.suffix': {
    marginLeft: 8,
  },
});

interface InformationFormValues {
  // Financial form fields
  monthlyIncome: number;
  monthlyExpenses: number;
  targetAmount: number;
  monthlySalary: number;
  taxes: number;
  secaStatus: string;
  contribution403b: number;
  mhaAmountPerMonth: number;
  solidMonthlySupportDeveloped: number;

  // Personal form fields
  location: string;
  role: string;
  benefits: string;
  tenure: number;
  age: number;
  children: number;
}

interface InformationStepFinancialFormProps {
  formikProps: FormikProps<InformationFormValues>;
}

export const InformationStepFinancialForm: React.FC<
  InformationStepFinancialFormProps
> = () => {
  const { t } = useTranslation();

  return (
    <StyledFinancialForm>
      <Typography variant="h6" gutterBottom>
        {t('Financial Information')}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {t('Review your financial details and settings here.')}
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Field name="monthlyIncome">
            {({ field, meta }: FieldProps) => (
              <TextField
                {...field}
                fullWidth
                size="small"
                label={t('Monthly Income')}
                type="number"
                error={meta.touched && Boolean(meta.error)}
                helperText={meta.touched && meta.error}
                variant="outlined"
                inputProps={{ min: 0, step: 0.01 }}
                InputProps={{
                  startAdornment: <span className="prefix">$</span>,
                }}
              />
            )}
          </Field>
        </Grid>

        <Grid item xs={12}>
          <Field name="monthlyExpenses">
            {({ field, meta }: FieldProps) => (
              <TextField
                {...field}
                fullWidth
                size="small"
                label={t('Monthly Expenses')}
                type="number"
                error={meta.touched && Boolean(meta.error)}
                helperText={meta.touched && meta.error}
                variant="outlined"
                inputProps={{ min: 0, step: 0.01 }}
                InputProps={{
                  startAdornment: <span className="prefix">$</span>,
                }}
              />
            )}
          </Field>
        </Grid>

        <Grid item xs={12}>
          <Field name="targetAmount">
            {({ field, meta }: FieldProps) => (
              <TextField
                {...field}
                fullWidth
                size="small"
                label={t('Target Amount')}
                type="number"
                error={meta.touched && Boolean(meta.error)}
                helperText={meta.touched && meta.error}
                variant="outlined"
                inputProps={{ min: 0, step: 0.01 }}
                InputProps={{
                  startAdornment: <span className="prefix">$</span>,
                }}
              />
            )}
          </Field>
        </Grid>

        <Grid item xs={12}>
          <Field name="monthlySalary">
            {({ field, meta }: FieldProps) => (
              <TextField
                {...field}
                fullWidth
                size="small"
                label={t('Monthly Salary')}
                type="number"
                error={meta.touched && Boolean(meta.error)}
                helperText={meta.touched && meta.error}
                variant="outlined"
                inputProps={{ min: 0, step: 0.01 }}
                InputProps={{
                  startAdornment: <span className="prefix">$</span>,
                }}
              />
            )}
          </Field>
        </Grid>

        <Grid item xs={12}>
          <Field name="taxes">
            {({ field, meta }: FieldProps) => (
              <TextField
                {...field}
                fullWidth
                size="small"
                label={t('Taxes (%)')}
                type="number"
                error={meta.touched && Boolean(meta.error)}
                helperText={meta.touched && meta.error}
                variant="outlined"
                inputProps={{ min: 0, max: 100, step: 0.01 }}
                InputProps={{
                  endAdornment: <span className="suffix">%</span>,
                }}
              />
            )}
          </Field>
        </Grid>

        <Grid item xs={12}>
          <Field name="secaStatus">
            {({ field, meta }: FieldProps) => (
              <TextField
                {...field}
                fullWidth
                size="small"
                select
                label={t('SECA Status')}
                error={meta.touched && Boolean(meta.error)}
                helperText={meta.touched && meta.error}
                variant="outlined"
              >
                <MenuItem value="">{t('Select SECA Status')}</MenuItem>
                <MenuItem value="exempt">{t('Exempt')}</MenuItem>
                <MenuItem value="non-exempt">{t('Non-Exempt')}</MenuItem>
              </TextField>
            )}
          </Field>
        </Grid>

        <Grid item xs={12}>
          <Field name="contribution403b">
            {({ field, meta }: FieldProps) => (
              <TextField
                {...field}
                fullWidth
                size="small"
                label={t('403(b) Contributions')}
                type="number"
                error={meta.touched && Boolean(meta.error)}
                helperText={meta.touched && meta.error}
                variant="outlined"
                inputProps={{ min: 0, step: 0.01 }}
                InputProps={{
                  startAdornment: <span className="prefix">$</span>,
                }}
              />
            )}
          </Field>
        </Grid>

        <Grid item xs={12}>
          <Field name="mhaAmountPerMonth">
            {({ field, meta }: FieldProps) => (
              <TextField
                {...field}
                fullWidth
                size="small"
                label={t('MHA Amount Per Month')}
                type="number"
                error={meta.touched && Boolean(meta.error)}
                helperText={meta.touched && meta.error}
                variant="outlined"
                inputProps={{ min: 0, step: 0.01 }}
                InputProps={{
                  startAdornment: <span className="prefix">$</span>,
                }}
              />
            )}
          </Field>
        </Grid>

        <Grid item xs={12}>
          <Field name="solidMonthlySupportDeveloped">
            {({ field, meta }: FieldProps) => (
              <TextField
                {...field}
                fullWidth
                size="small"
                label={t('Solid Monthly Support Developed')}
                type="number"
                error={meta.touched && Boolean(meta.error)}
                helperText={meta.touched && meta.error}
                variant="outlined"
                inputProps={{ min: 0, step: 0.01 }}
                InputProps={{
                  startAdornment: <span className="prefix">$</span>,
                }}
              />
            )}
          </Field>
        </Grid>
      </Grid>
    </StyledFinancialForm>
  );
};
