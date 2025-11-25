import React from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Checkbox,
  Divider,
  FormControlLabel,
  Grid,
  Typography,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Field, FormikProps } from 'formik';
import { useTranslation } from 'react-i18next';
import { useLocale } from 'src/hooks/useLocale';
import { currencyFormat } from 'src/lib/intlFormat';
import { CompleteFormValues } from '../CompleteForm';

interface DeductionProps {
  formikProps: FormikProps<CompleteFormValues>;
}

export const Deduction: React.FC<DeductionProps> = ({ formikProps }) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const locale = useLocale();

  const { values } = formikProps;

  // Calculate 12% of total additional salary if checkbox is checked
  const calculatedDeduction = values.defaultPercentage
    ? Object.entries(values).reduce((sum, [key, val]) => {
        if (key === 'defaultPercentage') {
          return sum;
        }
        return sum + Number(val || 0);
      }, 0) * 0.12
    : 0;

  // Get the contribution403b value from the form
  const contribution403b = Number(values.contribution403b || 0);

  // Total deduction is the sum of calculated deduction and contribution403b
  const totalDeduction = calculatedDeduction + contribution403b;

  return (
    <Card>
      <CardHeader title={t('403(b) Deduction')} />

      <CardContent sx={{ p: theme.spacing(3, 2) }}>
        <Grid container spacing={theme.spacing(2)} alignItems="center">
          <Grid item xs={12}>
            <Grid container spacing={2} alignItems="flex-start">
              <Grid item xs={9}>
                <FormControlLabel
                  sx={{ alignItems: 'flex-start', ml: 0 }}
                  control={
                    <Field
                      type="checkbox"
                      name="defaultPercentage"
                      as={Checkbox}
                      sx={{ mt: -0.5 }}
                      inputProps={{
                        'aria-label': t(
                          'Use default Percentage for 403(b) deduction',
                        ),
                      }}
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body1">
                        {t(
                          'Check this box if you would like 12% of the amount requested above deducted from this Additional Salary Request.',
                        )}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mt: 0.5 }}
                      >
                        {t(
                          'This is your regular 403(b) percentage contribution as selected on your latest Salary Calculation Form.',
                        )}
                      </Typography>
                    </Box>
                  }
                />
              </Grid>
              <Grid
                item
                xs={3}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Typography
                  variant="body1"
                  align="right"
                  aria-label="Calculated deduction amount"
                >
                  {currencyFormat(calculatedDeduction, 'USD', locale)}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Divider />
              </Grid>
              <Grid item xs={9}>
                <Typography variant="body1">
                  {t('403(b) Contribution Requested as Additional Salary')}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t(
                    'This is the sum of the Roth and Traditional amount you entered in the request above.',
                  )}
                </Typography>
              </Grid>
              <Grid
                item
                xs={3}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Typography variant="body1" align="right">
                  {currencyFormat(contribution403b, 'USD', locale)}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Divider />
              </Grid>
              <Grid item xs={9}>
                <Typography variant="body1" fontWeight="bold">
                  {t('Total 403(b) Deduction')}
                </Typography>
              </Grid>
              <Grid
                item
                xs={3}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Typography
                  variant="body1"
                  fontWeight="bold"
                  aria-label="Total requested amount"
                >
                  {currencyFormat(totalDeduction, 'USD', locale)}
                </Typography>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};
