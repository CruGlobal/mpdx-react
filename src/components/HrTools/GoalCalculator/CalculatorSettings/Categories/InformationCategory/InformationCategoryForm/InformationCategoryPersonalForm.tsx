import React, { useEffect, useMemo } from 'react';
import InfoIcon from '@mui/icons-material/Info';
import {
  Autocomplete,
  Grid,
  IconButton,
  MenuItem,
  TextField,
  Typography,
} from '@mui/material';
import { range } from 'lodash';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { useGoalCalculator } from 'src/components/HrTools/GoalCalculator/Shared/GoalCalculatorContext';
import {
  GoalCalculationAge,
  GoalCalculationRole,
  MpdGoalBenefitsConstantPlanEnum,
  MpdGoalBenefitsConstantSizeEnum,
} from 'src/graphql/types.generated';
import { getLocalizedAge } from 'src/lib/functions/getLocalizedAge';
import { getLocalizedRole } from 'src/lib/functions/getLocalizedRole';
import { AutosaveTextField } from '../../Autosave/AutosaveTextField';
import { useSaveField } from '../../Autosave/useSaveField';
import { BenefitsPlanHelperPanel } from '../InformationHelperPanel/BenefitsPlanHelperPanel';

interface InformationCategoryPersonalFormProps {
  schema: yup.Schema;
  isSpouse?: boolean;
}

const MAX_TENURE = 50;
const tenureOptions = range(0, MAX_TENURE + 1, 5).map((value) => ({
  label: value === MAX_TENURE ? `${value}+` : `${value}-${value + 4}`,
  value,
}));

export const InformationCategoryPersonalForm: React.FC<
  InformationCategoryPersonalFormProps
> = ({ schema, isSpouse }) => {
  const { t } = useTranslation();
  const {
    goalCalculationResult: { data },
    isReadOnly,
    setRightPanelContent,
    constants: {
      goalGeographicConstantMap,
      goalBenefitsPlans,
      loading: constantsLoading,
      unavailable: constantsUnavailable,
    },
  } = useGoalCalculator();
  const { geographicLocation, familySize, benefitsPlan } =
    data?.goalCalculation || {};

  const locations = useMemo(
    () => Array.from(goalGeographicConstantMap.keys()),
    [goalGeographicConstantMap],
  );

  const familySizeOptions = useMemo(() => {
    const familySize = new Map<MpdGoalBenefitsConstantSizeEnum, string>();
    goalBenefitsPlans.forEach((benefits) => {
      familySize.set(benefits.size, benefits.sizeDisplayName);
    });

    return Array.from(familySize.entries());
  }, [goalBenefitsPlans]);

  const saveField = useSaveField();

  const planOptions = useMemo(() => {
    const plans = new Map<MpdGoalBenefitsConstantPlanEnum, string>();
    goalBenefitsPlans.forEach((benefits) => {
      // Only include plans that match the selected family size
      if (benefits.size === familySize) {
        plans.set(benefits.plan, benefits.planDisplayName);
      }
    });
    return Array.from(plans.entries());
  }, [goalBenefitsPlans, familySize]);

  useEffect(() => {
    // Read-only goals reject mutations, so don't try to fix an incompatible
    // plan. While the constants are loading (e.g. switching to a new
    // calculation year's constants) or unavailable (no constants are seeded
    // for the year), the plan options are empty, not invalid, so clearing the
    // saved plan would be silent data loss.
    if (isReadOnly || constantsLoading || constantsUnavailable) {
      return;
    }

    // Clear benefits plan if it's not compatible with selected family size
    if (familySize && benefitsPlan) {
      const isPlanValid = planOptions.some(([plan]) => plan === benefitsPlan);
      if (!isPlanValid) {
        saveField({ benefitsPlan: null });
      }
    }
  }, [
    isReadOnly,
    constantsLoading,
    constantsUnavailable,
    familySize,
    benefitsPlan,
    planOptions,
  ]);

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
        <Grid
          size={{
            xs: 12,
            sm: isSpouse ? 12 : 6,
          }}
        >
          <AutosaveTextField
            fieldName={isSpouse ? 'spouseFirstName' : 'firstName'}
            schema={schema}
            label={isSpouse ? t('Spouse First Name') : t('First Name')}
          />
        </Grid>
        {!isSpouse && (
          <Grid
            size={{
              xs: 12,
              sm: 6,
            }}
          >
            <AutosaveTextField
              fieldName="lastName"
              schema={schema}
              label={t('Last Name')}
            />
          </Grid>
        )}

        {!isSpouse && (
          <Grid size={12}>
            <Autocomplete
              options={locations}
              value={geographicLocation ?? null}
              onChange={(_, newValue, reason) => {
                // Emptying the input fires onChange(null, 'clear') while the
                // user may still be typing a new location. Defer that save to
                // blur so mid-edit keystrokes don't mutate and reset the field.
                if (reason === 'clear') {
                  return;
                }
                saveField({ geographicLocation: newValue });
              }}
              disabled={!data || isReadOnly}
              size="small"
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={t('Geographic Location')}
                  helperText={t(
                    'Do you live within 50 miles of one of these major cities?',
                  )}
                  onBlur={(event) => {
                    if (event.target.value === '') {
                      saveField({ geographicLocation: null });
                    }
                  }}
                />
              )}
            />
          </Grid>
        )}

        {!isSpouse && (
          <Grid size={12}>
            <AutosaveTextField
              fieldName="role"
              schema={schema}
              select
              label={t('Role Type')}
            >
              {[GoalCalculationRole.Office, GoalCalculationRole.Field].map(
                (role) => (
                  <MenuItem key={role} value={role}>
                    {getLocalizedRole(t, role)}
                  </MenuItem>
                ),
              )}
            </AutosaveTextField>
          </Grid>
        )}

        {!isSpouse && (
          <Grid size={12}>
            <AutosaveTextField
              fieldName="ministryLocation"
              schema={schema}
              label={t('Ministry Team / Location')}
              helperText={t('For Presenting Your Goal report')}
            />
          </Grid>
        )}

        {!isSpouse && (
          <Grid size={12}>
            <AutosaveTextField
              fieldName="familySize"
              schema={schema}
              select
              label={t('Family Size')}
              helperText={t('For benefits plan')}
            >
              {Object.values(familySizeOptions).map(([value, label]) => (
                <MenuItem key={label} value={value}>
                  {label}
                </MenuItem>
              ))}
            </AutosaveTextField>
          </Grid>
        )}

        {!isSpouse && (
          <Grid size={12}>
            <AutosaveTextField
              fieldName="benefitsPlan"
              schema={schema}
              select
              label={t('Benefits Plan')}
              disabled={!familySize}
              helperText={
                !familySize
                  ? t('Select Family Size to enable benefits plan dropdown')
                  : undefined
              }
              InputProps={{
                endAdornment: (
                  <IconButton
                    size="small"
                    onClick={() =>
                      setRightPanelContent(<BenefitsPlanHelperPanel />)
                    }
                    sx={{ mr: 2 }}
                  >
                    <InfoIcon fontSize="small" />
                  </IconButton>
                ),
              }}
            >
              {Object.values(planOptions).map(([value, label]) => (
                <MenuItem key={label} value={value}>
                  {label}
                </MenuItem>
              ))}
            </AutosaveTextField>
          </Grid>
        )}

        <Grid size={12}>
          <AutosaveTextField
            fieldName={isSpouse ? 'spouseYearsOnStaff' : 'yearsOnStaff'}
            schema={schema}
            select
            label={isSpouse ? t('Spouse Years on Staff') : t('Years on Staff')}
            helperText={t('For new staff reference goal')}
          >
            {tenureOptions.map((tenure) => (
              <MenuItem key={tenure.value} value={tenure.value}>
                {tenure.label}
              </MenuItem>
            ))}
          </AutosaveTextField>
        </Grid>

        <Grid size={12}>
          <AutosaveTextField
            fieldName={isSpouse ? 'spouseAge' : 'age'}
            schema={schema}
            select
            label={isSpouse ? t('Spouse Age') : t('Age')}
            helperText={t('For new staff reference goal')}
          >
            {[
              GoalCalculationAge.UnderThirty,
              GoalCalculationAge.ThirtyToThirtyFour,
              GoalCalculationAge.ThirtyFiveToThirtyNine,
              GoalCalculationAge.OverForty,
            ].map((age) => (
              <MenuItem key={age} value={age}>
                {getLocalizedAge(t, age)}
              </MenuItem>
            ))}
          </AutosaveTextField>
        </Grid>

        {!isSpouse && (
          <Grid size={12}>
            <AutosaveTextField
              fieldName="childrenNamesAges"
              schema={schema}
              label={t("Children's Names and Ages")}
              helperText={t('For informational purposes only')}
            />
          </Grid>
        )}
      </Grid>
    </>
  );
};
