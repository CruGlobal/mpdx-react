import React from 'react';
import { Grid, TextField, Typography } from '@mui/material';
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

interface InformationStepPersonalFormProps {
  formikProps: FormikProps<InformationFormValues>;
}

export const InformationStepPersonalForm: React.FC<
  InformationStepPersonalFormProps
> = ({ formikProps }) => {
  const { values, errors, touched, handleChange, handleBlur } = formikProps;

  return (
    <>
      <Typography variant="h6" gutterBottom>
        Personal Information
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Review your personal details and preferences here.
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Field name="location">
            {() => (
              <TextField
                fullWidth
                size="small"
                label="Location"
                name="location"
                value={values.location}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.location && Boolean(errors.location)}
                helperText={touched.location && errors.location}
                variant="outlined"
              />
            )}
          </Field>
        </Grid>

        <Grid item xs={12}>
          <Field name="role">
            {() => (
              <TextField
                fullWidth
                size="small"
                label="Role"
                name="role"
                value={values.role}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.role && Boolean(errors.role)}
                helperText={touched.role && errors.role}
                variant="outlined"
              />
            )}
          </Field>
        </Grid>

        <Grid item xs={12}>
          <Field name="benefits">
            {() => (
              <TextField
                fullWidth
                size="small"
                label="Benefits"
                name="benefits"
                multiline
                rows={4}
                value={values.benefits}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.benefits && Boolean(errors.benefits)}
                helperText={touched.benefits && errors.benefits}
                variant="outlined"
                placeholder="Describe your benefits package..."
              />
            )}
          </Field>
        </Grid>

        <Grid item xs={12}>
          <Field name="tenure">
            {() => (
              <TextField
                fullWidth
                size="small"
                label="Tenure (years)"
                name="tenure"
                type="number"
                value={values.tenure}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.tenure && Boolean(errors.tenure)}
                helperText={touched.tenure && errors.tenure}
                variant="outlined"
                inputProps={{ min: 0, max: 50 }}
              />
            )}
          </Field>
        </Grid>

        <Grid item xs={12}>
          <Field name="age">
            {() => (
              <TextField
                fullWidth
                size="small"
                label="Age"
                name="age"
                type="number"
                value={values.age}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.age && Boolean(errors.age)}
                helperText={touched.age && errors.age}
                variant="outlined"
                inputProps={{ min: 18, max: 100 }}
              />
            )}
          </Field>
        </Grid>

        <Grid item xs={12}>
          <Field name="children">
            {() => (
              <TextField
                fullWidth
                size="small"
                label="Number of Children"
                name="children"
                type="number"
                value={values.children}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.children && Boolean(errors.children)}
                helperText={touched.children && errors.children}
                variant="outlined"
                inputProps={{ min: 0, max: 20 }}
              />
            )}
          </Field>
        </Grid>
      </Grid>
    </>
  );
};
