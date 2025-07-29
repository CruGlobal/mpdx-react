import React from 'react';
import { Grid, TextField, Typography } from '@mui/material';
import { Field, FieldProps } from 'formik';
import { useTranslation } from 'react-i18next';

export const InformationStepPersonalForm: React.FC = () => {
  const { t } = useTranslation();

  return (
    <>
      <Typography variant="h6" gutterBottom>
        {t('Personal Information')}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {t('Review your personal details and preferences here.')}
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Field name="location">
            {({ field, meta }: FieldProps) => (
              <TextField
                {...field}
                fullWidth
                size="small"
                label={t('Location')}
                error={meta.touched && Boolean(meta.error)}
                helperText={meta.touched && meta.error}
                variant="outlined"
              />
            )}
          </Field>
        </Grid>

        <Grid item xs={12}>
          <Field name="role">
            {({ field, meta }: FieldProps) => (
              <TextField
                {...field}
                fullWidth
                size="small"
                label={t('Role')}
                error={meta.touched && Boolean(meta.error)}
                helperText={meta.touched && meta.error}
                variant="outlined"
              />
            )}
          </Field>
        </Grid>

        <Grid item xs={12}>
          <Field name="benefits">
            {({ field, meta }: FieldProps) => (
              <TextField
                {...field}
                fullWidth
                size="small"
                label={t('Benefits')}
                multiline
                rows={4}
                error={meta.touched && Boolean(meta.error)}
                helperText={meta.touched && meta.error}
                variant="outlined"
                placeholder={t('Describe your benefits package...')}
              />
            )}
          </Field>
        </Grid>

        <Grid item xs={12}>
          <Field name="tenure">
            {({ field, meta }: FieldProps) => (
              <TextField
                {...field}
                fullWidth
                size="small"
                label={t('Tenure (years)')}
                type="number"
                error={meta.touched && Boolean(meta.error)}
                helperText={meta.touched && meta.error}
                variant="outlined"
                inputProps={{ min: 0, max: 50 }}
              />
            )}
          </Field>
        </Grid>

        <Grid item xs={12}>
          <Field name="age">
            {({ field, meta }: FieldProps) => (
              <TextField
                {...field}
                fullWidth
                size="small"
                label={t('Age')}
                type="number"
                error={meta.touched && Boolean(meta.error)}
                helperText={meta.touched && meta.error}
                variant="outlined"
                inputProps={{ min: 18, max: 100 }}
              />
            )}
          </Field>
        </Grid>

        <Grid item xs={12}>
          <Field name="children">
            {({ field, meta }: FieldProps) => (
              <TextField
                {...field}
                fullWidth
                size="small"
                label={t('Number of Children')}
                type="number"
                error={meta.touched && Boolean(meta.error)}
                helperText={meta.touched && meta.error}
                variant="outlined"
                inputProps={{ min: 0, max: 20 }}
              />
            )}
          </Field>
        </Grid>
      </Grid>
    </>
  );
};
