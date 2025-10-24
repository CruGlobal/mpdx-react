import React from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Grid,
  TextField,
  Typography,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Form, Formik } from 'formik';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { CurrencyAdornment } from 'src/components/Reports/GoalCalculator/Shared/Adornments';
import { useLocale } from 'src/hooks/useLocale';
import { currencyFormat } from 'src/lib/intlFormat';
import { useCompleteFormCategories } from './useSalaryRequestFormCategories';

interface CompleteFormValues {
  currentYearSalary: string;
  previousYearSalary: string;
  additionalSalary: string;
  adoption: string;
  contribution403b: string;
  counseling: string;
  healthcareExpenses: string;
  babysitting: string;
  childrenMinistryTrip: string;
  childrenCollege: string;
  movingExpense: string;
  seminary: string;
  housingDownPayment: string;
  autoPurchase: string;
  reimbursableExpenses: string;
}

export const SalaryRequestForm: React.FC = () => {
  const { t } = useTranslation();
  const locale = useLocale();
  const theme = useTheme();

  const categories = useCompleteFormCategories();

  const initialValues: CompleteFormValues = {
    currentYearSalary: '',
    previousYearSalary: '',
    additionalSalary: '',
    adoption: '',
    contribution403b: '',
    counseling: '',
    healthcareExpenses: '',
    babysitting: '',
    childrenMinistryTrip: '',
    childrenCollege: '',
    movingExpense: '',
    seminary: '',
    housingDownPayment: '',
    autoPurchase: '',
    reimbursableExpenses: '',
  };

  const validationSchema = yup.object({
    currentYearSalary: yup
      .number()
      .min(0, t("Current Year's Salary amount must be positive"))
      .required(t("Current Year's Salary field is required")),
    previousYearSalary: yup
      .number()
      .min(0, t("Previous Year's Salary amount must be positive"))
      .required(t("Previous Year's Salary field is required")),
    additionalSalary: yup
      .number()
      .min(0, t('Additional Salary amount must be positive'))
      .required(t('Additional Salary field is required')),
    adoption: yup
      .number()
      .min(0, t('Adoption amount must be positive'))
      // replace with MpdGoalMiscConstants value when possible
      .max(15000, t('Exceeds $15000 limit'))
      .required(t('Adoption field is required')),
    contribution403b: yup
      .number()
      .min(0, t('403(b) Contribution amount must be positive'))
      // Can't be greater than salary (will be pulled from HCM)
      .required(t('403(b) Contribution field is required')),
    counseling: yup
      .number()
      .min(0, t('Counseling amount must be positive'))
      .required(t('Counseling field is required')),
    healthcareExpenses: yup
      .number()
      .min(0, t('Healthcare Expenses amount must be positive'))
      .required(t('Healthcare Expenses field is required')),
    babysitting: yup
      .number()
      .min(0, t('Babysitting amount must be positive'))
      .required(t('Babysitting field is required')),
    childrenMinistryTrip: yup
      .number()
      .min(0, t("Children's Ministry Trip amount must be positive"))
      // Need to pull number of children from HCM and multiply by 21000 for max
      .required(t("Children's Ministry Trip field is required")),
    childrenCollege: yup
      .number()
      .min(0, t("Children's College amount must be positive"))
      .required(t("Children's College field is required")),
    movingExpense: yup
      .number()
      .min(0, t('Moving Expense amount must be positive'))
      .required(t('Moving Expense field is required')),
    seminary: yup
      .number()
      .min(0, t('Seminary amount must be positive'))
      .required(t('Seminary field is required')),
    housingDownPayment: yup
      .number()
      .min(0, t('Housing Down Payment amount must be positive'))
      // replace with MpdGoalMiscConstants value when possible
      .max(50000, t('Exceeds $50000 limit'))
      .required(t('Housing Down Payment field is required')),
    autoPurchase: yup
      .number()
      .min(0, t('Auto Purchase amount must be positive'))
      // Max will eventually be a constant, no determined value yet
      .required(t('Auto Purchase field is required')),
    reimbursableExpenses: yup
      .number()
      .min(0, t('Reimbursable Expenses amount must be positive'))
      .required(t('Reimbursable Expenses field is required')),
  });

  const handleSubmit = () => {
    // TODO
  };

  return (
    <Box sx={{ m: theme.spacing(4) }}>
      <Typography variant="h4" sx={{ mb: theme.spacing(3) }}>
        {t('Complete the Form')}
      </Typography>

      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({ values, handleChange, handleBlur, errors, touched }) => {
          const total = Object.values(values).reduce(
            (sum, val) => sum + Number(val || 0),
            0,
          );

          return (
            <Form>
              <Card>
                <CardHeader title={t('Additional Salary Request')} />

                <CardContent>
                  <Grid
                    container
                    spacing={theme.spacing(2)}
                    alignItems="center"
                  >
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
                    <Grid item xs={3}>
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
            </Form>
          );
        }}
      </Formik>
    </Box>
  );
};
