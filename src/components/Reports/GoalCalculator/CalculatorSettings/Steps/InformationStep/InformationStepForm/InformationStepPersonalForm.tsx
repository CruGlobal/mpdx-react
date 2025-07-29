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
import { Age, BenefitsPlan, FamilySize, Role, Tenure } from './enums';
import { locations } from './geographicAdjustments';

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
            {({ field, meta, form }: FieldProps) => (
              <Autocomplete
                {...field}
                onChange={(_, value) => form.setFieldValue('location', value)}
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
                <InputLabel>{t('Role')}</InputLabel>
                <Select {...field} label={t('Role')}>
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
          <Field name="benefits">
            {({ field, meta }: FieldProps) => (
              <FormControl fullWidth size="small">
                <InputLabel>{t('Benefits plan')}</InputLabel>
                <Select {...field} label={t('Benefits plan')}>
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
          <Field name="familySize">
            {({ field, meta }: FieldProps) => (
              <FormControl fullWidth size="small">
                <InputLabel>{t('Family size')}</InputLabel>
                <Select {...field} label={t('Family size')}>
                  <MenuItem value={FamilySize.SingleOrSpouseNotStaff}>
                    {t('Single or spouse not staff')}
                  </MenuItem>
                  <MenuItem value={FamilySize.MarriedNoChildren}>
                    {t('Married with no children')}
                  </MenuItem>
                  <MenuItem value={FamilySize.Sosa1Dependent}>
                    {t('SOSA with 1 dependent')}
                  </MenuItem>
                  <MenuItem value={FamilySize.Sosa2Or3Dependents}>
                    {t('SOSA with 2-3 dependents')}
                  </MenuItem>
                  <MenuItem value={FamilySize.Sosa4OrMoreDependents}>
                    {t('SOSA with 4 or more dependents')}
                  </MenuItem>
                  <MenuItem value={FamilySize.Married1Or2Children}>
                    {t('Married with 1-2 children')}
                  </MenuItem>
                  <MenuItem value={FamilySize.Married3OrMoreChildren}>
                    {t('Married with 3 or more children')}
                  </MenuItem>
                </Select>
                <FormHelperText error={meta.touched && Boolean(meta.error)}>
                  {(meta.touched && meta.error) || t('For benefits plan')}
                </FormHelperText>
              </FormControl>
            )}
          </Field>
        </Grid>

        <Grid item xs={12}>
          <Field name="tenure">
            {({ field, meta }: FieldProps) => (
              <FormControl fullWidth size="small">
                <InputLabel>{t('Tenure (years)')}</InputLabel>
                <Select {...field} label={t('Tenure (years)')}>
                  <MenuItem value={Tenure.OneToFour}>{t('1-4')}</MenuItem>
                  <MenuItem value={Tenure.FiveToNine}>{t('5-9')}</MenuItem>
                  <MenuItem value={Tenure.TenToFourteen}>{t('10-14')}</MenuItem>
                  <MenuItem value={Tenure.FifteenToNineteen}>
                    {t('15-19')}
                  </MenuItem>
                  <MenuItem value={Tenure.TwentyToTwentyFour}>
                    {t('20-24')}
                  </MenuItem>
                  <MenuItem value={Tenure.TwentyFiveToTwentyNine}>
                    {t('25-29')}
                  </MenuItem>
                  <MenuItem value={Tenure.ThirtyToThirtyFour}>
                    {t('30-34')}
                  </MenuItem>
                  <MenuItem value={Tenure.ThirtyFiveToThirtyNine}>
                    {t('35-39')}
                  </MenuItem>
                  <MenuItem value={Tenure.FortyToFortyFour}>
                    {t('40-44')}
                  </MenuItem>
                  <MenuItem value={Tenure.FortyFivePlus}>{t('45+')}</MenuItem>
                </Select>
                <FormHelperText error={meta.touched && Boolean(meta.error)}>
                  {(meta.touched && meta.error) ||
                    t('For New Staff Reference Goal')}
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
                  <MenuItem value={Age.Under30}>{t('Under 30')}</MenuItem>
                  <MenuItem value={Age.ThirtyToThirtyFour}>
                    {t('30-34')}
                  </MenuItem>
                  <MenuItem value={Age.ThirtyFiveToThirtyNine}>
                    {t('35-39')}
                  </MenuItem>
                  <MenuItem value={Age.Over40}>{t('Over 40')}</MenuItem>
                </Select>
                <FormHelperText error={meta.touched && Boolean(meta.error)}>
                  {(meta.touched && meta.error) ||
                    t('For New Staff Reference Goal')}
                </FormHelperText>
              </FormControl>
            )}
          </Field>
        </Grid>
      </Grid>
    </>
  );
};
