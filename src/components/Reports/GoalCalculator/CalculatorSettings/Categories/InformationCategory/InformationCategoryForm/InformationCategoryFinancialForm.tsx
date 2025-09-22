import React from 'react';
import InfoIcon from '@mui/icons-material/Info';
import {
  Grid,
  IconButton,
  MenuItem,
  TextField,
  Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { useGoalCalculator } from 'src/components/Reports/GoalCalculator/Shared/GoalCalculatorContext';
import {
  CurrencyAdornment,
  PercentageAdornment,
} from '../../../../Shared/Adornments';
import { AutosaveTextField } from '../../Autosave/AutosaveTextField';
import { useSaveField } from '../../Autosave/useSaveField';
import { Contribution403bHelperPanel } from '../InformationHelperPanel/Contribution403bHelperPanel';

interface InformationCategoryFinancialFormProps {
  schema: yup.Schema;
  isSpouse?: boolean;
}

export const InformationCategoryFinancialForm: React.FC<
  InformationCategoryFinancialFormProps
> = ({ schema, isSpouse }) => {
  const { t } = useTranslation();
  const {
    setRightPanelContent,
    goalCalculationResult: { data },
  } = useGoalCalculator();

  const saveField = useSaveField();
  const secaField = isSpouse ? 'spouseSecaExempt' : 'secaExempt';

  return (
    <>
      <Typography variant="h6" gutterBottom>
        {isSpouse
          ? t("Spouse's Financial Information")
          : t('Financial Information')}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {isSpouse
          ? t('Review spouse financial details and settings here.')
          : t('Review your financial details and settings here.')}
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <AutosaveTextField
            fieldName={
              isSpouse ? 'spouseNetPaycheckAmount' : 'netPaycheckAmount'
            }
            schema={schema}
            fullWidth
            size="small"
            label={
              isSpouse
                ? t('Spouse Net Paycheck Amount')
                : t('Net Paycheck Amount')
            }
            type="number"
            variant="outlined"
            inputProps={{ min: 0, step: 0.01 }}
            InputProps={{
              startAdornment: <CurrencyAdornment />,
            }}
          />
        </Grid>

        <Grid item xs={12}>
          <AutosaveTextField
            fieldName={isSpouse ? 'spouseTaxesPercentage' : 'taxesPercentage'}
            schema={schema}
            fullWidth
            size="small"
            label={isSpouse ? t('Spouse Taxes') : t('Taxes')}
            type="number"
            variant="outlined"
            inputProps={{ min: 0, max: 100, step: 1 }}
            InputProps={{
              endAdornment: <PercentageAdornment />,
            }}
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            value={data?.goalCalculation[secaField]?.toString()}
            onChange={(event) => {
              saveField({ [secaField]: event.target.value === 'true' });
            }}
            fullWidth
            size="small"
            select
            label={
              isSpouse
                ? t('Spouse SECA (Social Security) Status')
                : t('SECA (Social Security) Status')
            }
            variant="outlined"
          >
            <MenuItem value="false">{t('Non-Exempt')}</MenuItem>
            <MenuItem value="true">{t('Exempt')}</MenuItem>
          </TextField>
        </Grid>

        <Grid item xs={12}>
          <AutosaveTextField
            fieldName={
              isSpouse
                ? 'spouseRothContributionPercentage'
                : 'rothContributionPercentage'
            }
            schema={schema}
            fullWidth
            size="small"
            label={
              isSpouse
                ? t('Spouse Roth 403(b) Contributions')
                : t('Roth 403(b) Contributions')
            }
            type="number"
            variant="outlined"
            inputProps={{ min: 0, max: 100, step: 1 }}
            InputProps={{
              endAdornment: (
                <>
                  <PercentageAdornment />
                  <IconButton
                    onClick={() =>
                      setRightPanelContent(<Contribution403bHelperPanel />)
                    }
                  >
                    <InfoIcon />
                  </IconButton>
                </>
              ),
            }}
          />
        </Grid>

        <Grid item xs={12}>
          <AutosaveTextField
            fieldName={
              isSpouse
                ? 'spouseTraditionalContributionPercentage'
                : 'traditionalContributionPercentage'
            }
            schema={schema}
            fullWidth
            size="small"
            label={
              isSpouse
                ? t('Spouse Traditional 403(b) Contributions')
                : t('Traditional 403(b) Contributions')
            }
            type="number"
            variant="outlined"
            inputProps={{ min: 0, max: 100, step: 1 }}
            InputProps={{
              endAdornment: (
                <>
                  <PercentageAdornment />
                  <IconButton
                    onClick={() =>
                      setRightPanelContent(<Contribution403bHelperPanel />)
                    }
                  >
                    <InfoIcon />
                  </IconButton>
                </>
              ),
            }}
          />
        </Grid>

        <Grid item xs={12}>
          <AutosaveTextField
            fieldName={isSpouse ? 'spouseMhaAmount' : 'mhaAmount'}
            schema={schema}
            fullWidth
            size="small"
            label={
              isSpouse
                ? t('Spouse MHA Amount Per Paycheck')
                : t('MHA Amount Per Paycheck')
            }
            type="number"
            variant="outlined"
            inputProps={{ min: 0, step: 1 }}
            InputProps={{
              startAdornment: <CurrencyAdornment />,
            }}
          />
        </Grid>
      </Grid>
    </>
  );
};
