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
import { useTranslation } from 'react-i18next';
import { useGoalCalculator } from 'src/components/Reports/GoalCalculator/Shared/GoalCalculatorContext';
import { BenefitsPlanHelperPanel } from '../InformationHelperPanel/BenefitsPlanHelperPanel';
import { BenefitsPlan, Role } from './enums';
import { locations } from './geographicAdjustments';
import { ageOptions, familySizeOptions, tenureOptions } from './mockData';

interface InformationCategoryPersonalFormProps {
  isSpouse?: boolean;
}

export const InformationCategoryPersonalForm: React.FC<
  InformationCategoryPersonalFormProps
> = ({ isSpouse }) => {
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
          <TextField
            fullWidth
            size="small"
            label={isSpouse ? t('Spouse First Name') : t('First Name')}
            variant="outlined"
            required={!isSpouse}
          />
        </Grid>
        {!isSpouse && (
          <Grid item xs={12} sm={6}>
            <TextField
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
            <FormControl fullWidth size="small">
              <InputLabel>{t('Role Type')}</InputLabel>
              <Select label={t('Role Type')}>
                <MenuItem value={Role.Office}>{t('Office')}</MenuItem>
                <MenuItem value={Role.Field}>{t('Field')}</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        )}

        {!isSpouse && (
          <Grid item xs={12}>
            <TextField
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
              <Select label={t('Family Size')}>
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
          <FormControl fullWidth size="small">
            <InputLabel>
              {isSpouse ? t('Spouse Years on Staff') : t('Years on Staff')}
            </InputLabel>
            <Select
              label={
                isSpouse ? t('Spouse Years on Staff') : t('Years on Staff')
              }
            >
              {tenureOptions.map((tenure) => (
                <MenuItem key={tenure} value={tenure}>
                  {t(tenure)}
                </MenuItem>
              ))}
            </Select>
            <FormHelperText>{t('For new staff reference goal')}</FormHelperText>
          </FormControl>
        </Grid>

        <Grid item xs={12}>
          <FormControl fullWidth size="small">
            <InputLabel>{isSpouse ? t('Spouse Age') : t('Age')}</InputLabel>
            <Select label={isSpouse ? t('Spouse Age') : t('Age')}>
              {ageOptions.map((age) => (
                <MenuItem key={age} value={age}>
                  {t(age)}
                </MenuItem>
              ))}
            </Select>
            <FormHelperText>{t('For new staff reference goal')}</FormHelperText>
          </FormControl>
        </Grid>

        {!isSpouse && (
          <Grid item xs={12}>
            <TextField
              fullWidth
              size="small"
              label={t("Children's Names and Ages")}
              variant="outlined"
              helperText={t('For informational purposes only')}
            />
          </Grid>
        )}
      </Grid>
    </>
  );
};
