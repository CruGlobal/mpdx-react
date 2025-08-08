import React, { useState } from 'react';
import {
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Grid,
  InputAdornment,
  TextField,
  Typography,
} from '@mui/material';
import { Field, FieldProps, Formik, FormikProps } from 'formik';
import { useTranslation } from 'react-i18next';
import { useGoalCalculator } from '../Shared/GoalCalculatorContext';

export const CategoryOverview: React.FC = () => {
  const { t } = useTranslation();

  // State for direct input mode
  const [isDirectInputMode, setIsDirectInputMode] = useState(false);
  const [hasManualInput, setHasManualInput] = useState(false);

  // Mock data - replace with actual values
  const leftToAllocatePercentage = 23.5;
  const { hideCategoryId, setHideCategoryId, currentStep } =
    useGoalCalculator();
  const stepId = currentStep?.id ?? null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const initialValues = {
    budgetedAmount: 85000,
  };

  const handleDirectInputClick = () => {
    if (isDirectInputMode) {
      // Save mode - exit edit mode, mark as manually inputted, and hide categories
      setIsDirectInputMode(false);
      setHasManualInput(true);
      setHideCategoryId(stepId);
    } else if (hasManualInput) {
      // Manual Input mode - switch back to Direct Input and show categories
      setHasManualInput(false);
      setHideCategoryId(null);
      setIsDirectInputMode(false);
    } else {
      // Direct Input mode - enter edit mode
      setIsDirectInputMode(true);
    }
  };

  const handleCancelClick = (formik: FormikProps<typeof initialValues>) => {
    formik.resetForm();
    setIsDirectInputMode(false);
  };

  return (
    <Formik
      initialValues={initialValues}
      onSubmit={() => {
        setIsDirectInputMode(false);
      }}
    >
      {(formik) => (
        <Grid container spacing={3}>
          <Grid item xs={12} md={hideCategoryId ? 12 : 6}>
            <Card
              sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}
            >
              <CardHeader
                title={t('Budgeted')}
                sx={{ borderBottom: 'none', pb: 0 }}
              />
              <CardContent sx={{ flexGrow: 1, p: 2 }}>
                {isDirectInputMode ? (
                  <Field name="budgetedAmount">
                    {({ field, meta }: FieldProps) => (
                      <TextField
                        {...field}
                        type="number"
                        variant="outlined"
                        size="small"
                        fullWidth
                        error={meta.touched && Boolean(meta.error)}
                        helperText={meta.touched && meta.error}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">$</InputAdornment>
                          ),
                        }}
                        sx={{
                          '& .MuiInputBase-input': {
                            fontSize: 14,
                            fontWeight: 'normal',
                            color: 'text.primary',
                            textAlign: 'left',
                          },
                        }}
                      />
                    )}
                  </Field>
                ) : (
                  <Typography
                    variant="h3"
                    component="div"
                    sx={{
                      color: 'primary.main',
                      fontWeight: 'bold',
                    }}
                  >
                    {formatCurrency(formik.values.budgetedAmount)}
                  </Typography>
                )}
              </CardContent>

              <CardActions sx={{ justifyContent: 'flex-start' }}>
                <Button
                  size="medium"
                  variant="text"
                  onClick={() => handleDirectInputClick()}
                  sx={{ fontWeight: 'bold', pl: 1, pr: 1, pb: 0, pt: 0, ml: 1 }}
                >
                  {isDirectInputMode
                    ? t('Save')
                    : hasManualInput
                    ? t('Manual Input')
                    : t('Direct Input')}
                </Button>
                {isDirectInputMode && (
                  <Button
                    size="medium"
                    variant="text"
                    onClick={() => handleCancelClick(formik)}
                    sx={{
                      fontWeight: 'bold',
                      pl: 1,
                      pr: 1,
                      pb: 0,
                      pt: 0,
                      ml: 1,
                    }}
                  >
                    {t('Cancel')}
                  </Button>
                )}
              </CardActions>
            </Card>
          </Grid>

          {!hideCategoryId && (
            <Grid item xs={12} md={6}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <CardHeader
                  title={t('Left to Allocate')}
                  sx={{ borderBottom: 'none', pb: 0 }}
                />
                <CardContent sx={{ flexGrow: 1, p: 2 }}>
                  <Typography
                    variant="h3"
                    component="div"
                    sx={{
                      color: 'primary.main',
                      fontWeight: 'bold',
                    }}
                  >
                    {leftToAllocatePercentage}%
                  </Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: 'flex-start' }}>
                  <Button
                    size="medium"
                    variant="text"
                    sx={{
                      fontWeight: 'bold',
                      pl: 1,
                      pr: 1,
                      pb: 0,
                      pt: 0,
                      ml: 1,
                    }}
                  >
                    {t('Switch to Amount')}
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          )}
        </Grid>
      )}
    </Formik>
  );
};
