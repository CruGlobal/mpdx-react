import React from 'react';
import {
  Autocomplete,
  FormControl,
  FormHelperText,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import { Field, FieldProps } from 'formik';
import { useTranslation } from 'react-i18next';
import { BenefitsPlan, Role } from './enums';
import { locations } from './geographicAdjustments';
import { ageOptions, familySizeOptions, tenureOptions } from './mockData';

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
        <Grid item xs={12} sm={6}>
          <Field name="firstName">
            {({ field, meta }: FieldProps) => (
              <TextField
                {...field}
                fullWidth
                size="small"
                label={t('First Name')}
                error={meta.touched && Boolean(meta.error)}
                helperText={meta.touched && meta.error}
                variant="outlined"
                required
              />
            )}
          </Field>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Field name="lastName">
            {({ field, meta }: FieldProps) => (
              <TextField
                {...field}
                fullWidth
                size="small"
                label={t('Last Name')}
                error={meta.touched && Boolean(meta.error)}
                helperText={meta.touched && meta.error}
                variant="outlined"
                required
              />
            )}
          </Field>
        </Grid>

        <Grid item xs={12}>
          <Field name="geographicLocation">
            {({ field, meta, form }: FieldProps) => (
              <Autocomplete
                {...field}
                onChange={(_, value) =>
                  form.setFieldValue('geographicLocation', value)
                }
                options={locations}
                size="small"
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label={t('Geographic Location')}
                    error={meta.touched && Boolean(meta.error)}
                    helperText={meta.touched && meta.error}
                  />
                )}
              />
            )}
          </Field>
        </Grid>

        <Grid item xs={12}>
          <Field name="role">
            {({ field, meta }: FieldProps) => (
              <FormControl fullWidth size="small">
                <InputLabel>{t('Role Type')}</InputLabel>
                <Select {...field} label={t('Role Type')}>
                  <MenuItem value={Role.Office}>{t('Office')}</MenuItem>
                  <MenuItem value={Role.Field}>{t('Field')}</MenuItem>
                </Select>
                <FormHelperText error={meta.touched && Boolean(meta.error)}>
                  {meta.touched && meta.error}
                </FormHelperText>
              </FormControl>
            )}
          </Field>
        </Grid>

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
          <Field name="familySize">
            {({ field, meta }: FieldProps) => (
              <FormControl fullWidth size="small">
                <InputLabel>{t('Family Size')}</InputLabel>
                <Select {...field} label={t('Family Size')}>
                  {Object.values(familySizeOptions).map((label) => (
                    <MenuItem key={label} value={label}>
                      {label}
                    </MenuItem>
                  ))}
                </Select>
                <FormHelperText error={meta.touched && Boolean(meta.error)}>
                  {(meta.touched && meta.error) || t('For benefits plan')}
                </FormHelperText>
              </FormControl>
            )}
          </Field>
        </Grid>

        <Grid item xs={12}>
          <Field name="benefits">
            {({ field, meta }: FieldProps) => (
              <FormControl fullWidth size="small">
                <InputLabel>{t('Benefits Plan')}</InputLabel>
                <Select {...field} label={t('Benefits Plan')}>
                  <MenuItem value={BenefitsPlan.Select}>{t('Select')}</MenuItem>
                  <MenuItem value={BenefitsPlan.Plus}>{t('Plus')}</MenuItem>
                  <MenuItem value={BenefitsPlan.Base}>{t('Base')}</MenuItem>
                  <MenuItem value={BenefitsPlan.Minimum}>
                    {t('Minimum')}
                  </MenuItem>
                </Select>
                <FormHelperText error={meta.touched && Boolean(meta.error)}>
                  {meta.touched && meta.error}
                </FormHelperText>
              </FormControl>
            )}
          </Field>
        </Grid>

        <Grid item xs={12}>
          <Field name="tenure">
            {({ field, meta }: FieldProps) => (
              <FormControl fullWidth size="small">
                <InputLabel>{t('Years on Staff')}</InputLabel>
                <Select {...field} label={t('Years on Staff')}>
                  {tenureOptions.map((tenure) => (
                    <MenuItem key={tenure} value={tenure}>
                      {t(tenure)}
                    </MenuItem>
                  ))}
                </Select>
                <FormHelperText error={meta.touched && Boolean(meta.error)}>
                  {(meta.touched && meta.error) ||
                    t('For new staff reference goal')}
                </FormHelperText>
              </FormControl>
            )}
          </Field>
        </Grid>

        <Grid item xs={12}>
          <Field name="age">
            {({ field, meta }: FieldProps) => (
              <FormControl fullWidth size="small">
                <InputLabel>{t('Age')}</InputLabel>
                <Select {...field} label={t('Age')}>
                  {ageOptions.map((age) => (
                    <MenuItem key={age} value={age}>
                      {t(age)}
                    </MenuItem>
                  ))}
                </Select>
                <FormHelperText error={meta.touched && Boolean(meta.error)}>
                  {(meta.touched && meta.error) ||
                    t('For new staff reference goal')}
                </FormHelperText>
              </FormControl>
            )}
          </Field>
        </Grid>

        <Grid item xs={12}>
          <Field name="children">
            {({ field, meta }: FieldProps) => (
              <>
                <TextField
                  {...field}
                  fullWidth
                  size="small"
                  label={t("Children's Names and Ages")}
                  error={meta.touched && Boolean(meta.error)}
                  helperText={meta.touched && meta.error}
                  variant="outlined"
                />
                <FormHelperText error={meta.touched && Boolean(meta.error)}>
                  {(meta.touched && meta.error) ||
                    t('For informational purposes only')}
                </FormHelperText>
              </>
            )}
          </Field>
        </Grid>
      </Grid>
    </>
  );
};
