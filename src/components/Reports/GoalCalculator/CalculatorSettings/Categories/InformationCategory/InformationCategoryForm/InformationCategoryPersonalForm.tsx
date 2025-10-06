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
import { useGoalCalculator } from 'src/components/Reports/GoalCalculator/Shared/GoalCalculatorContext';
import {
  GoalCalculationAge,
  GoalCalculationRole,
  MpdGoalBenefitsConstantPlanEnum,
  MpdGoalBenefitsConstantSizeEnum,
} from 'src/graphql/types.generated';
import { useGoalCalculatorConstants } from 'src/hooks/useGoalCalculatorConstants';
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
    setRightPanelContent,
  } = useGoalCalculator();
  const { goalGeographicConstantMap, goalBenefitsConstantMap } =
    useGoalCalculatorConstants();
  const { geographicLocation, familySize, benefitsPlan } =
    data?.goalCalculation || {};

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

  const saveField = useSaveField();

  const planOptions = useMemo(() => {
    const plans = new Map<MpdGoalBenefitsConstantPlanEnum, string>();
    goalBenefitsConstantMap.forEach((benefits) => {
      // Only include plans that match the selected family size
      if (benefits.size === familySize) {
        plans.set(benefits.plan, benefits.planDisplayName);
      }
    });
    return Array.from(plans.entries());
  }, [goalBenefitsConstantMap, familySize]);

  useEffect(() => {
    // Clear benefits plan if it's not compatible with selected family size
    if (familySize && benefitsPlan) {
      const isPlanValid = planOptions.some(([plan]) => plan === benefitsPlan);
      if (!isPlanValid) {
        saveField({ benefitsPlan: null });
      }
    }
  }, [familySize, benefitsPlan, planOptions]);

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
          <AutosaveTextField
            fieldName={isSpouse ? 'spouseFirstName' : 'firstName'}
            schema={schema}
            label={isSpouse ? t('Spouse First Name') : t('First Name')}
          />
        </Grid>
        {!isSpouse && (
          <Grid item xs={12} sm={6}>
            <AutosaveTextField
              fieldName="lastName"
              schema={schema}
              label={t('Last Name')}
            />
          </Grid>
        )}

        {!isSpouse && (
          <Grid item xs={12}>
            <Autocomplete
              options={locations}
              value={geographicLocation ?? null}
              onChange={(_, newValue) =>
                saveField({ geographicLocation: newValue })
              }
              size="small"
              renderInput={(params) => (
                <TextField {...params} label={t('Geographic Location')} />
              )}
            />
          </Grid>
        )}

        {!isSpouse && (
          <Grid item xs={12}>
            <AutosaveTextField
              fieldName="role"
              schema={schema}
              select
              label={t('Role Type')}
            >
              <MenuItem value={GoalCalculationRole.Office}>
                {t('Office')}
              </MenuItem>
              <MenuItem value={GoalCalculationRole.Field}>
                {t('Field')}
              </MenuItem>
            </AutosaveTextField>
          </Grid>
        )}

        {!isSpouse && (
          <Grid item xs={12}>
            <AutosaveTextField
              fieldName="ministryLocation"
              schema={schema}
              label={t('Ministry Location')}
            />
          </Grid>
        )}

        {!isSpouse && (
          <Grid item xs={12}>
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
          <Grid item xs={12}>
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

        <Grid item xs={12}>
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

        <Grid item xs={12}>
          <AutosaveTextField
            fieldName={isSpouse ? 'spouseAge' : 'age'}
            schema={schema}
            select
            label={isSpouse ? t('Spouse Age') : t('Age')}
            helperText={t('For new staff reference goal')}
          >
            <MenuItem value={GoalCalculationAge.UnderThirty}>
              {t('Under 30')}
            </MenuItem>
            <MenuItem value={GoalCalculationAge.ThirtyToThirtyFour}>
              {t('30-34')}
            </MenuItem>
            <MenuItem value={GoalCalculationAge.ThirtyFiveToThirtyNine}>
              {t('35-39')}
            </MenuItem>
            <MenuItem value={GoalCalculationAge.OverForty}>
              {t('Over 40')}
            </MenuItem>
          </AutosaveTextField>
        </Grid>

        {!isSpouse && (
          <Grid item xs={12}>
            <AutosaveTextField
              fieldName="childrenNamesAges"
              schema={schema}
              label={t("Children's Names and Ages")}
            />
          </Grid>
        )}
      </Grid>
    </>
  );
};
