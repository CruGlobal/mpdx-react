import React from 'react';
import InfoIcon from '@mui/icons-material/Info';
import {
  Grid,
  IconButton,
  MenuItem,
  TextField,
  Typography,
} from '@mui/material';
import { Field, FieldProps } from 'formik';
import { useTranslation } from 'react-i18next';
import { useGoalCalculator } from 'src/components/Reports/GoalCalculator/Shared/GoalCalculatorContext';
import {
  CurrencyAdornment,
  PercentageAdornment,
} from '../../../../Shared/Adornments';
import { Contribution403bHelperPanel } from '../InformationHelperPanel/Contribution403bHelperPanel';

interface InformationStepFinancialFormProps {
  isSpouse?: boolean;
}

export const InformationStepFinancialForm: React.FC<
  InformationStepFinancialFormProps
> = ({ isSpouse }) => {
  const { t } = useTranslation();
  const { setRightPanelContent } = useGoalCalculator();

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
          <Field name="paycheckAmount">
            {({ field, meta }: FieldProps) => (
              <TextField
                {...field}
                fullWidth
                size="small"
                label={
                  isSpouse
                    ? t('Spouse Net Paycheck Amount')
                    : t('Net Paycheck Amount')
                }
                type="number"
                error={meta.touched && Boolean(meta.error)}
                helperText={meta.touched && meta.error}
                variant="outlined"
                inputProps={{ min: 0, step: 0.01 }}
                InputProps={{
                  startAdornment: <CurrencyAdornment />,
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
                label={isSpouse ? t('Spouse Taxes (%)') : t('Taxes (%)')}
                type="number"
                error={meta.touched && Boolean(meta.error)}
                helperText={meta.touched && meta.error}
                variant="outlined"
                inputProps={{ min: 0, max: 100, step: 0.01 }}
                InputProps={{
                  endAdornment: <PercentageAdornment />,
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
                label={
                  isSpouse
                    ? t('Spouse SECA (Social Security) Status')
                    : t('SECA (Social Security) Status')
                }
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
                label={
                  isSpouse
                    ? t('Spouse Roth 403(b) Contributions')
                    : t('Roth 403(b) Contributions')
                }
                type="number"
                error={meta.touched && Boolean(meta.error)}
                helperText={meta.touched && meta.error}
                variant="outlined"
                inputProps={{ min: 0, step: 0.01 }}
                InputProps={{
                  startAdornment: <CurrencyAdornment />,
                  endAdornment: (
                    <IconButton
                      onClick={() =>
                        setRightPanelContent(<Contribution403bHelperPanel />)
                      }
                    >
                      <InfoIcon />
                    </IconButton>
                  ),
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
                label={
                  isSpouse
                    ? t('Spouse Traditional 403(b) Contributions')
                    : t('Traditional 403(b) Contributions')
                }
                type="number"
                error={meta.touched && Boolean(meta.error)}
                helperText={meta.touched && meta.error}
                variant="outlined"
                inputProps={{ min: 0, step: 0.01 }}
                InputProps={{
                  startAdornment: <CurrencyAdornment />,
                  endAdornment: (
                    <IconButton
                      onClick={() =>
                        setRightPanelContent(<Contribution403bHelperPanel />)
                      }
                    >
                      <InfoIcon />
                    </IconButton>
                  ),
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
                label={
                  isSpouse
                    ? t('Spouse MHA Amount Per Paycheck')
                    : t('MHA Amount Per Paycheck')
                }
                type="number"
                error={meta.touched && Boolean(meta.error)}
                helperText={meta.touched && meta.error}
                variant="outlined"
                inputProps={{ min: 0, step: 0.01 }}
                InputProps={{
                  startAdornment: <CurrencyAdornment />,
                }}
              />
            )}
          </Field>
        </Grid>
      </Grid>
    </>
  );
};
