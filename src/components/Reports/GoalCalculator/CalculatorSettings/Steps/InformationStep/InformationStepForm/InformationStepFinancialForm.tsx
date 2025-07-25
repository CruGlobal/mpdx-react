import React from 'react';
import { Grid, MenuItem, TextField, Typography } from '@mui/material';
import { Field, FormikProps } from 'formik';

interface InformationFormValues {
  // Financial form fields
  monthlyIncome: number;
  monthlyExpenses: number;
  targetAmount: number;
  monthlySalary: number;
  taxes: number;
  secaStatus: string;
  contribution403b: number;
  mhaAmountPerMonth: number;
  solidMonthlySupportDeveloped: number;

  // Personal form fields
  location: string;
  role: string;
  benefits: string;
  tenure: number;
  age: number;
  children: number;
}

interface InformationStepFinancialFormProps {
  formikProps: FormikProps<InformationFormValues>;
}

export const InformationStepFinancialForm: React.FC<
  InformationStepFinancialFormProps
> = ({ formikProps }) => {
  const { values, errors, touched, handleChange, handleBlur } = formikProps;

  return (
    <>
      <Typography variant="h6" gutterBottom>
        Financial Information
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Review your financial details and settings here.
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Field name="monthlyIncome">
            {() => (
              <TextField
                fullWidth
                size="small"
                label="Monthly Income"
                name="monthlyIncome"
                type="number"
                value={values.monthlyIncome}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.monthlyIncome && Boolean(errors.monthlyIncome)}
                helperText={touched.monthlyIncome && errors.monthlyIncome}
                variant="outlined"
                inputProps={{ min: 0, step: 0.01 }}
                InputProps={{
                  startAdornment: <span style={{ marginRight: 8 }}>$</span>,
                }}
              />
            )}
          </Field>
        </Grid>

        <Grid item xs={12}>
          <Field name="monthlyExpenses">
            {() => (
              <TextField
                fullWidth
                size="small"
                label="Monthly Expenses"
                name="monthlyExpenses"
                type="number"
                value={values.monthlyExpenses}
                onChange={handleChange}
                onBlur={handleBlur}
                error={
                  touched.monthlyExpenses && Boolean(errors.monthlyExpenses)
                }
                helperText={touched.monthlyExpenses && errors.monthlyExpenses}
                variant="outlined"
                inputProps={{ min: 0, step: 0.01 }}
                InputProps={{
                  startAdornment: <span style={{ marginRight: 8 }}>$</span>,
                }}
              />
            )}
          </Field>
        </Grid>

        <Grid item xs={12}>
          <Field name="targetAmount">
            {() => (
              <TextField
                fullWidth
                size="small"
                label="Target Amount"
                name="targetAmount"
                type="number"
                value={values.targetAmount}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.targetAmount && Boolean(errors.targetAmount)}
                helperText={touched.targetAmount && errors.targetAmount}
                variant="outlined"
                inputProps={{ min: 0, step: 0.01 }}
                InputProps={{
                  startAdornment: <span style={{ marginRight: 8 }}>$</span>,
                }}
              />
            )}
          </Field>
        </Grid>

        <Grid item xs={12}>
          <Field name="monthlySalary">
            {() => (
              <TextField
                fullWidth
                size="small"
                label="Monthly Salary"
                name="monthlySalary"
                type="number"
                value={values.monthlySalary}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.monthlySalary && Boolean(errors.monthlySalary)}
                helperText={touched.monthlySalary && errors.monthlySalary}
                variant="outlined"
                inputProps={{ min: 0, step: 0.01 }}
                InputProps={{
                  startAdornment: <span style={{ marginRight: 8 }}>$</span>,
                }}
              />
            )}
          </Field>
        </Grid>

        <Grid item xs={12}>
          <Field name="taxes">
            {() => (
              <TextField
                fullWidth
                size="small"
                label="Taxes (%)"
                name="taxes"
                type="number"
                value={values.taxes}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.taxes && Boolean(errors.taxes)}
                helperText={touched.taxes && errors.taxes}
                variant="outlined"
                inputProps={{ min: 0, max: 100, step: 0.01 }}
                InputProps={{
                  endAdornment: <span style={{ marginLeft: 8 }}>%</span>,
                }}
              />
            )}
          </Field>
        </Grid>

        <Grid item xs={12}>
          <Field name="secaStatus">
            {() => (
              <TextField
                fullWidth
                size="small"
                select
                label="SECA Status"
                name="secaStatus"
                value={values.secaStatus}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.secaStatus && Boolean(errors.secaStatus)}
                helperText={touched.secaStatus && errors.secaStatus}
                variant="outlined"
              >
                <MenuItem value="">Select SECA Status</MenuItem>
                <MenuItem value="exempt">Exempt</MenuItem>
                <MenuItem value="non-exempt">Non-Exempt</MenuItem>
              </TextField>
            )}
          </Field>
        </Grid>

        <Grid item xs={12}>
          <Field name="contribution403b">
            {() => (
              <TextField
                fullWidth
                size="small"
                label="403(b) Contributions"
                name="contribution403b"
                type="number"
                value={values.contribution403b}
                onChange={handleChange}
                onBlur={handleBlur}
                error={
                  touched.contribution403b && Boolean(errors.contribution403b)
                }
                helperText={touched.contribution403b && errors.contribution403b}
                variant="outlined"
                inputProps={{ min: 0, step: 0.01 }}
                InputProps={{
                  startAdornment: <span style={{ marginRight: 8 }}>$</span>,
                }}
              />
            )}
          </Field>
        </Grid>

        <Grid item xs={12}>
          <Field name="mhaAmountPerMonth">
            {() => (
              <TextField
                fullWidth
                size="small"
                label="MHA Amount Per Month"
                name="mhaAmountPerMonth"
                type="number"
                value={values.mhaAmountPerMonth}
                onChange={handleChange}
                onBlur={handleBlur}
                error={
                  touched.mhaAmountPerMonth && Boolean(errors.mhaAmountPerMonth)
                }
                helperText={
                  touched.mhaAmountPerMonth && errors.mhaAmountPerMonth
                }
                variant="outlined"
                inputProps={{ min: 0, step: 0.01 }}
                InputProps={{
                  startAdornment: <span style={{ marginRight: 8 }}>$</span>,
                }}
              />
            )}
          </Field>
        </Grid>

        <Grid item xs={12}>
          <Field name="solidMonthlySupportDeveloped">
            {() => (
              <TextField
                fullWidth
                size="small"
                label="Solid Monthly Support Developed"
                name="solidMonthlySupportDeveloped"
                type="number"
                value={values.solidMonthlySupportDeveloped}
                onChange={handleChange}
                onBlur={handleBlur}
                error={
                  touched.solidMonthlySupportDeveloped &&
                  Boolean(errors.solidMonthlySupportDeveloped)
                }
                helperText={
                  touched.solidMonthlySupportDeveloped &&
                  errors.solidMonthlySupportDeveloped
                }
                variant="outlined"
                inputProps={{ min: 0, step: 0.01 }}
                InputProps={{
                  startAdornment: <span style={{ marginRight: 8 }}>$</span>,
                }}
              />
            )}
          </Field>
        </Grid>
      </Grid>
    </>
  );
};
