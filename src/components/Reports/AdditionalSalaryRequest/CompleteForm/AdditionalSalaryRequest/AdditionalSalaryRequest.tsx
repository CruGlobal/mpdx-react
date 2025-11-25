import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  Divider,
  Grid,
  TextField,
  Typography,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { FormikProps } from 'formik';
import { useTranslation } from 'react-i18next';
import { CurrencyAdornment } from 'src/components/Reports/GoalCalculator/Shared/Adornments';
import { useLocale } from 'src/hooks/useLocale';
import { currencyFormat } from 'src/lib/intlFormat';
import { useCompleteFormCategories } from '../../Shared/useCompleteFormCategories';
import { useTotalSalaryRequest } from '../../Shared/useTotalSalaryRequest';
import { CompleteFormValues } from '../CompleteForm';

interface AdditionalSalaryRequestProps {
  formikProps: FormikProps<CompleteFormValues>;
}

export const AdditionalSalaryRequest: React.FC<
  AdditionalSalaryRequestProps
> = ({ formikProps }) => {
  const { t } = useTranslation();
  const locale = useLocale();
  const theme = useTheme();

  const categories = useCompleteFormCategories();

  const { values, handleChange, handleBlur, errors, touched } = formikProps;

  // Calculate total excluding the defaultPercentage boolean
  const total = useTotalSalaryRequest(values);

  return (
    <Card>
      <CardHeader title={t('Additional Salary Request')} />

      <CardContent>
        <Grid container spacing={theme.spacing(2)} alignItems="center">
          <Grid item xs={9}>
            <Typography
              variant="subtitle1"
              fontWeight="bold"
              color={theme.palette.primary.main}
            >
              {t('Category')}
            </Typography>
          </Grid>
          <Grid item xs={3}>
            <Typography
              variant="subtitle1"
              fontWeight="bold"
              color={theme.palette.primary.main}
            >
              {t('Amount')}
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Divider />
          </Grid>

          {categories.map(({ key, label, description }, index) => (
            <React.Fragment key={key}>
              <Grid item xs={9}>
                <Typography>{label}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {description}
                </Typography>
              </Grid>
              <Grid item xs={3}>
                <TextField
                  fullWidth
                  size="small"
                  name={key}
                  type="number"
                  value={values[key]}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched[key] && Boolean(errors[key])}
                  helperText={touched[key] && errors[key]}
                  placeholder={t('Enter amount')}
                  inputProps={{ min: 0, step: 1 }}
                  InputProps={{
                    startAdornment: <CurrencyAdornment />,
                  }}
                />
              </Grid>
              {index < categories.length - 1 && (
                <Grid item xs={12}>
                  <Divider />
                </Grid>
              )}
            </React.Fragment>
          ))}
          <Grid item xs={12}>
            <Divider />
          </Grid>
          <Grid item xs={9}>
            <Typography variant="body1" fontWeight="bold">
              {t('Total Additional Salary Requested')}
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
              {currencyFormat(total, 'USD', locale)}
            </Typography>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};
