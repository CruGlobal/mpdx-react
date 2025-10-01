import React, { useEffect, useMemo } from 'react';
import InfoIcon from '@mui/icons-material/Info';
import {
  Autocomplete,
  FormControl,
  FormHelperText,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import { Field, FieldProps, useFormikContext } from 'formik';
import { useTranslation } from 'react-i18next';
import { useGoalCalculator } from 'src/components/Reports/GoalCalculator/Shared/GoalCalculatorContext';
import {
  MpdGoalBenefitsConstantPlanEnum,
  MpdGoalBenefitsConstantSizeEnum,
} from 'src/graphql/types.generated';
import { BenefitsPlanHelperPanel } from '../InformationHelperPanel/BenefitsPlanHelperPanel';
import { Role } from './enums';
import { ageOptions, tenureOptions } from './mockData';

interface GoalCategoryFormValues {
  familySize: string;
  benefitsPlan: string;
}

interface InformationCategoryPersonalFormProps {
  isSpouse?: boolean;
}

export const InformationCategoryPersonalForm: React.FC<
  InformationCategoryPersonalFormProps
> = ({ isSpouse }) => {
  const { t } = useTranslation();
  const { values, setFieldValue } = useFormikContext<GoalCategoryFormValues>();
  const {
    setRightPanelContent,
    goalGeographicConstantMap,
    goalBenefitsConstantMap,
  } = useGoalCalculator();

  const locations = useMemo(
    () => Array.from(goalGeographicConstantMap.keys()),
    [goalGeographicConstantMap],
  );

  const familySizeOptions = useMemo(() => {
    const familySize = new Map<MpdGoalBenefitsConstantSizeEnum, string>();
    goalBenefitsConstantMap.forEach((benefits) => {
      familySize.set(benefits.size, benefits.sizeDisplayName);
    });

    return Array.from(familySize.entries());
  }, [goalBenefitsConstantMap]);

  const planOptions = useMemo(() => {
    const plans = new Map<MpdGoalBenefitsConstantPlanEnum, string>();
    goalBenefitsConstantMap.forEach((benefits) => {
      // Only include plans that match the selected family size (if one is selected)
      if (!values.familySize || benefits.size === values.familySize) {
        plans.set(benefits.plan, benefits.planDisplayName);
      }
    });
    return Array.from(plans.entries());
  }, [goalBenefitsConstantMap, values.familySize]);

  useEffect(() => {
    // Clear benefits plan if it's not compatible with selected family size
    if (values.familySize && values.benefitsPlan) {
      const isPlanValid = planOptions.some(
        ([value]) => value === values.benefitsPlan,
      );
      if (!isPlanValid) {
        setFieldValue('benefitsPlan', '');
      }
    }
  }, [values.familySize, values.benefitsPlan, planOptions, setFieldValue]);

  return (
    <>
      <Typography variant="h6" gutterBottom>
        {isSpouse
          ? t("Spouse's Personal Information")
          : t('Personal Information')}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {isSpouse
          ? t('Review spouse personal details and preferences here.')
          : t('Review your personal details and preferences here.')}
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={isSpouse ? 12 : 6}>
          <Field name="firstName">
            {({ field, meta }: FieldProps) => (
              <TextField
                {...field}
                fullWidth
                size="small"
                label={isSpouse ? t('Spouse First Name') : t('First Name')}
                error={meta.touched && Boolean(meta.error)}
                helperText={meta.touched && meta.error}
                variant="outlined"
                required={!isSpouse}
              />
            )}
          </Field>
        </Grid>
        {!isSpouse && (
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
        )}

        {!isSpouse && (
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
        )}

        {!isSpouse && (
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
        )}

        {!isSpouse && (
          <Grid item xs={12}>
            <Field name="location">
              {({ field, meta }: FieldProps) => (
                <TextField
                  {...field}
                  fullWidth
                  size="small"
                  label={t('Ministry Location')}
                  error={meta.touched && Boolean(meta.error)}
                  helperText={meta.touched && meta.error}
                  variant="outlined"
                />
              )}
            </Field>
          </Grid>
        )}

        {!isSpouse && (
          <Grid item xs={12}>
            <Field name="familySize">
              {({ field, meta }: FieldProps) => (
                <FormControl fullWidth size="small">
                  <InputLabel>{t('Family Size')}</InputLabel>
                  <Select {...field} label={t('Family Size')}>
                    {Object.values(familySizeOptions).map(([value, label]) => (
                      <MenuItem key={label} value={value}>
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
        )}

        {!isSpouse && (
          <Grid item xs={12}>
            <Field name="benefitsPlan">
              {({ field, meta }: FieldProps) => (
                <FormControl fullWidth size="small">
                  <InputLabel>{t('Benefits Plan')}</InputLabel>

                  <Select
                    {...field}
                    label={t('Benefits Plan')}
                    disabled={!values.familySize}
                    endAdornment={
                      <IconButton
                        size="small"
                        onClick={() =>
                          setRightPanelContent(<BenefitsPlanHelperPanel />)
                        }
                        sx={{ mr: 2 }}
                      >
                        <InfoIcon fontSize="small" />
                      </IconButton>
                    }
                  >
                    {Object.values(planOptions).map(([value, label]) => (
                      <MenuItem key={label} value={value}>
                        {label}
                      </MenuItem>
                    ))}
                  </Select>
                  <FormHelperText error={meta.touched && Boolean(meta.error)}>
                    {(meta.touched && meta.error) ||
                      (!values.familySize &&
                        t(
                          'Select Family Size to enable benefits plan dropdown',
                        ))}
                  </FormHelperText>
                </FormControl>
              )}
            </Field>
          </Grid>
        )}

        <Grid item xs={12}>
          <Field name="tenure">
            {({ field, meta }: FieldProps) => (
              <FormControl fullWidth size="small">
                <InputLabel>
                  {isSpouse ? t('Spouse Years on Staff') : t('Years on Staff')}
                </InputLabel>
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
                <InputLabel>{isSpouse ? t('Spouse Age') : t('Age')}</InputLabel>
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

        {!isSpouse && (
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
        )}
      </Grid>
    </>
  );
};
