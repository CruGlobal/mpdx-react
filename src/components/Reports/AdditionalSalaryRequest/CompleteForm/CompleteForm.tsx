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
import { AccountInfoCard } from '../Shared/AccountInfoCard';
import { useAdditionalSalaryRequest } from '../Shared/AdditionalSalaryRequestContext';
import { useCompleteFormCategories } from '../Shared/useCompleteFormCategories';
import { AdditionalSalaryRequestSection } from '../SharedComponents/AdditionalSalaryRequestSection';
import {
  BackButton,
  CancelButton,
  SubmitButton,
} from '../SharedComponents/NavButtons';

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

export const CompleteForm: React.FC = () => {
  const { t } = useTranslation();
  const locale = useLocale();
  const theme = useTheme();
  const { selectedSection } = useAdditionalSalaryRequest();

  const categories = useCompleteFormCategories();

  const name = 'Doc, John';
  const accountNumber = '00123456';
  const primaryAccountBalance = 20307.58;
  const remainingAllowableSalary = 17500.0;

  const initialValues: CompleteFormValues = {
    currentYearSalary: '0',
    previousYearSalary: '0',
    additionalSalary: '0',
    adoption: '0',
    contribution403b: '0',
    counseling: '0',
    healthcareExpenses: '0',
    babysitting: '0',
    childrenMinistryTrip: '0',
    childrenCollege: '0',
    movingExpense: '0',
    seminary: '0',
    housingDownPayment: '0',
    autoPurchase: '0',
    reimbursableExpenses: '0',
  };

  const createCurrencyValidation = (fieldName: string, max?: number) => {
    let schema = yup
      .number()
      .min(0, t('{{field}} amount must be positive', { field: fieldName }))
      .required(t('{{field}} field is required', { field: fieldName }));
    if (max) {
      schema = schema.max(
        max,
        t('Exceeds ${{amount}} limit', { amount: max.toLocaleString() }),
      );
    }
    return schema;
  };

  const validationSchema = yup.object({
    currentYearSalary: createCurrencyValidation("Current Year's Salary"),
    previousYearSalary: createCurrencyValidation("Previous Year's Salary"),
    additionalSalary: createCurrencyValidation('Additional Salary'),
    adoption: createCurrencyValidation('Adoption', 15000), // replace with MpdGoalMiscConstants value when possible
    contribution403b: createCurrencyValidation('403(b) Contribution'), // Can't be greater than salary (will be pulled from HCM)
    counseling: createCurrencyValidation('Counseling'),
    healthcareExpenses: createCurrencyValidation('Healthcare Expenses'),
    babysitting: createCurrencyValidation('Babysitting'),
    childrenMinistryTrip: createCurrencyValidation("Children's Ministry Trip"), // Need to pull number of children from HCM and multiply by 21000 for max
    childrenCollege: createCurrencyValidation("Children's College"),
    movingExpense: createCurrencyValidation('Moving Expense'),
    seminary: createCurrencyValidation('Seminary'),
    housingDownPayment: createCurrencyValidation('Housing Down Payment', 50000), // replace with MpdGoalMiscConstants value when possible
    autoPurchase: createCurrencyValidation('Auto Purchase'), // Max will eventually be a constant, no determined value yet
    reimbursableExpenses: createCurrencyValidation('Reimbursable Expenses'),
  });

  const handleSubmit = () => {
    // TODO
  };

  return (
    <AdditionalSalaryRequestSection title={selectedSection.title}>
      <AccountInfoCard
        name={name}
        accountNumber={accountNumber}
        primaryAccountBalance={primaryAccountBalance}
        remainingAllowableSalary={remainingAllowableSalary}
      />
      <Typography variant="body1" paragraph>
        {t(
          'Please enter the desired dollar amounts for the appropriate categories and review totals before submitting. Your Net Additional Salary calculated below represents the amount you will receive (before taxes) in additional salary and equals the amount you are requesting minus any amount being contributed to your 403(b).',
        )}
      </Typography>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ values, handleChange, handleBlur, errors, touched }) => {
          const total = Object.values(values).reduce(
            (sum, val) => sum + Number(val || 0),
            0,
          );

          return (
            <>
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
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  mt: theme.spacing(4),
                }}
              >
                <CancelButton />
                <Box sx={{ display: 'flex', gap: theme.spacing(2) }}>
                  <BackButton />
                  <SubmitButton handleClick={handleSubmit} />
                </Box>
              </Box>
            </>
          );
        }}
      </Formik>
    </AdditionalSalaryRequestSection>
  );
};
