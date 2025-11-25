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
import { Field, Form, Formik } from 'formik';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { useLocale } from 'src/hooks/useLocale';
import { currencyFormat } from 'src/lib/intlFormat';

interface DeductionFormValues {
  defaultPercentage: boolean;
}

const initialValues: DeductionFormValues = {
  defaultPercentage: false,
};

const validationSchema = yup.object({
  defaultPercentage: yup.boolean(),
});

export const Deduction: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const locale = useLocale();

  const handleSubmit = () => {
    // TODO
  };

  return (
    <Card>
      <CardHeader title={t('403(b) Deduction')} />

      <CardContent sx={{ p: theme.spacing(3, 2) }}>
        <Grid container spacing={theme.spacing(2)} alignItems="center">
          <Grid item xs={12}>
            <Formik
              initialValues={initialValues}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
            >
              <Form>
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
                      {currencyFormat(0, 'USD', locale)}
                    </Typography>
                  </Grid>
                </Grid>
              </Form>
            </Formik>
          </Grid>
        </Grid>
      </CardContent>

      <Divider />

      <Box
        sx={{
          px: 2,
          py: 2,
        }}
      >
        <Grid container spacing={theme.spacing(2)} alignItems="center">
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
              {currencyFormat(0, 'USD', locale)}
            </Typography>
          </Grid>
        </Grid>
      </Box>
    </Card>
  );
};
