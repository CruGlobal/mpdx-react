import React from 'react';
import { Grid, MenuItem, TextField, Typography } from '@mui/material';
import { styled } from '@mui/system';
import { Field, FieldProps } from 'formik';
import { useTranslation } from 'react-i18next';

const StyledFinancialForm = styled('div')({
  '.prefix': {
    marginRight: 8,
  },
  '.suffix': {
    marginLeft: 8,
  },
});

interface InformationStepFinancialFormProps {
  isSpouse?: boolean;
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
          <Field name="paycheckAmount">
            {({ field, meta }: FieldProps) => (
              <TextField
                {...field}
                fullWidth
                size="small"
                label={t('Net Paycheck Amount')}
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
                label={t('SECA (Social Security) Status')}
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
          <Field name="contributionRoth403b">
            {({ field, meta }: FieldProps) => (
              <TextField
                {...field}
                fullWidth
                size="small"
                label={t('Roth 403(b) Contributions')}
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
          <Field name="contributionTraditional403b">
            {({ field, meta }: FieldProps) => (
              <TextField
                {...field}
                fullWidth
                size="small"
                label={t('Traditional 403(b) Contributions')}
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
          <Field name="mhaAmountPerPaycheck">
            {({ field, meta }: FieldProps) => (
              <TextField
                {...field}
                fullWidth
                size="small"
                label={t('MHA Amount Per Paycheck')}
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
