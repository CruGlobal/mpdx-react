import React from 'react';
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
import { range } from 'lodash';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { useGoalCalculator } from 'src/components/Reports/GoalCalculator/Shared/GoalCalculatorContext';
import {
  GoalCalculationAge,
  GoalCalculationRole,
} from 'src/graphql/types.generated';
import { AutosaveTextField } from '../../Autosave/AutosaveTextField';
import { BenefitsPlanHelperPanel } from '../InformationHelperPanel/BenefitsPlanHelperPanel';
import { BenefitsPlan } from './enums';
import { locations } from './geographicAdjustments';
import { familySizeOptions } from './mockData';

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
  const { setRightPanelContent } = useGoalCalculator();

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
            fullWidth
            size="small"
            label={isSpouse ? t('Spouse First Name') : t('First Name')}
            variant="outlined"
            required={!isSpouse}
          />
        </Grid>
        {!isSpouse && (
          <Grid item xs={12} sm={6}>
            <AutosaveTextField
              fieldName="lastName"
              schema={schema}
              fullWidth
              size="small"
              label={t('Last Name')}
              variant="outlined"
              required
            />
          </Grid>
        )}

        {!isSpouse && (
          <Grid item xs={12}>
            <Autocomplete
              options={locations}
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
              fullWidth
              size="small"
              select
              label={t('Role Type')}
              variant="outlined"
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
              fullWidth
              size="small"
              label={t('Ministry Location')}
              variant="outlined"
            />
          </Grid>
        )}

        {!isSpouse && (
          <Grid item xs={12}>
            <FormControl fullWidth size="small">
              <InputLabel>{t('Family Size')}</InputLabel>
              <Select name="familySize" label={t('Family Size')}>
                {Object.values(familySizeOptions).map((label) => (
                  <MenuItem key={label} value={label}>
                    {label}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>{t('For benefits plan')}</FormHelperText>
            </FormControl>
          </Grid>
        )}

        {!isSpouse && (
          <Grid item xs={12}>
            <FormControl fullWidth size="small">
              <InputLabel>{t('Benefits Plan')}</InputLabel>
              <Select
                name="benefits"
                label={t('Benefits Plan')}
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
                <MenuItem value={BenefitsPlan.Select}>{t('Select')}</MenuItem>
                <MenuItem value={BenefitsPlan.Plus}>{t('Plus')}</MenuItem>
                <MenuItem value={BenefitsPlan.Base}>{t('Base')}</MenuItem>
                <MenuItem value={BenefitsPlan.Minimum}>{t('Minimum')}</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        )}

        <Grid item xs={12}>
          <AutosaveTextField
            fieldName={isSpouse ? 'spouseYearsOnStaff' : 'yearsOnStaff'}
            schema={schema}
            fullWidth
            size="small"
            select
            label={isSpouse ? t('Spouse Years on Staff') : t('Years on Staff')}
            helperText={t('For new staff reference goal')}
            variant="outlined"
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
            fullWidth
            size="small"
            select
            label={isSpouse ? t('Spouse Age') : t('Age')}
            helperText={t('For new staff reference goal')}
            variant="outlined"
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
              fullWidth
              size="small"
              label={t("Children's Names and Ages")}
              variant="outlined"
            />
          </Grid>
        )}
      </Grid>
    </>
  );
};
