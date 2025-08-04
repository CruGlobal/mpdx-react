import React from 'react';
import InfoIcon from '@mui/icons-material/Info';
import {
  Box,
  Grid,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { styled } from '@mui/system';
import { Field, FieldProps, FormikProps } from 'formik';
import { useTranslation } from 'react-i18next';
import { useGoalCalculator } from 'src/components/Reports/GoalCalculator/Shared/GoalCalculatorContext';

const StyledHelperPanelBox = styled(Box)({
  padding: '16px',
});

const StyledNoticeTypography = styled(Typography)(({ theme }) => ({
  marginTop: theme.spacing(2),
  color: theme.palette.error.main,
  fontStyle: 'italic',
}));

const Contribution403bHelperPanel = () => {
  const { t } = useTranslation();
  return (
    <StyledHelperPanelBox>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>
                {t('403(b) / IRA Suggested Contribution Levels')}
              </TableCell>
              <TableCell align="right">{t('In SECA')}</TableCell>
              <TableCell align="right">{t('Out of SECA')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>{t('New Staff Goal')}</TableCell>
              <TableCell align="right">5%</TableCell>
              <TableCell align="right">8%</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>{t('Desired Goal 1-2 yrs')}</TableCell>
              <TableCell align="right">10%</TableCell>
              <TableCell align="right">12%</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>{t('Desired Goal 3-5 yrs')}</TableCell>
              <TableCell align="right">15%</TableCell>
              <TableCell align="right">18%</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      <StyledNoticeTypography variant="body2">
        {t(
          '*If you opted out of SECA, you should save more than this for retirement.',
        )}
      </StyledNoticeTypography>
    </StyledHelperPanelBox>
  );
};
const StyledFinancialForm = styled('div')({
  '.prefix': {
    marginRight: 8,
  },
  '.suffix': {
    marginLeft: 8,
  },
});

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
> = () => {
  const { t } = useTranslation();
  const { setRightPanelContent } = useGoalCalculator();

  return (
    <StyledFinancialForm>
      <Typography variant="h6" gutterBottom>
        {t('Financial Information')}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {t('Review your financial details and settings here.')}
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Field name="monthlyIncome">
            {({ field, meta }: FieldProps) => (
              <TextField
                {...field}
                fullWidth
                size="small"
                label={t('Monthly Income')}
                type="number"
                error={meta.touched && Boolean(meta.error)}
                helperText={meta.touched && meta.error}
                variant="outlined"
                inputProps={{ min: 0, step: 0.01 }}
                InputProps={{
                  startAdornment: <span className="prefix">$</span>,
                }}
              />
            )}
          </Field>
        </Grid>

        <Grid item xs={12}>
          <Field name="monthlyExpenses">
            {({ field, meta }: FieldProps) => (
              <TextField
                {...field}
                fullWidth
                size="small"
                label={t('Monthly Expenses')}
                type="number"
                error={meta.touched && Boolean(meta.error)}
                helperText={meta.touched && meta.error}
                variant="outlined"
                inputProps={{ min: 0, step: 0.01 }}
                InputProps={{
                  startAdornment: <span className="prefix">$</span>,
                }}
              />
            )}
          </Field>
        </Grid>

        <Grid item xs={12}>
          <Field name="targetAmount">
            {({ field, meta }: FieldProps) => (
              <TextField
                {...field}
                fullWidth
                size="small"
                label={t('Target Amount')}
                type="number"
                error={meta.touched && Boolean(meta.error)}
                helperText={meta.touched && meta.error}
                variant="outlined"
                inputProps={{ min: 0, step: 0.01 }}
                InputProps={{
                  startAdornment: <span className="prefix">$</span>,
                }}
              />
            )}
          </Field>
        </Grid>

        <Grid item xs={12}>
          <Field name="monthlySalary">
            {({ field, meta }: FieldProps) => (
              <TextField
                {...field}
                fullWidth
                size="small"
                label={t('Monthly Salary')}
                type="number"
                error={meta.touched && Boolean(meta.error)}
                helperText={meta.touched && meta.error}
                variant="outlined"
                inputProps={{ min: 0, step: 0.01 }}
                InputProps={{
                  startAdornment: <span className="prefix">$</span>,
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
                label={t('Taxes (%)')}
                type="number"
                error={meta.touched && Boolean(meta.error)}
                helperText={meta.touched && meta.error}
                variant="outlined"
                inputProps={{ min: 0, max: 100, step: 0.01 }}
                InputProps={{
                  endAdornment: <span className="suffix">%</span>,
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
                label={t('SECA Status')}
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
          <Field name="contribution403b">
            {({ field, meta }: FieldProps) => (
              <TextField
                {...field}
                fullWidth
                size="small"
                label={t('403(b) Contributions')}
                type="number"
                error={meta.touched && Boolean(meta.error)}
                helperText={meta.touched && meta.error}
                variant="outlined"
                inputProps={{ min: 0, step: 0.01 }}
                InputProps={{
                  startAdornment: <span className="prefix">$</span>,
                  endAdornment: (
                    <InfoIcon
                      onClick={() =>
                        setRightPanelContent(<Contribution403bHelperPanel />)
                      }
                    />
                  ),
                }}
              />
            )}
          </Field>
        </Grid>

        <Grid item xs={12}>
          <Field name="mhaAmountPerMonth">
            {({ field, meta }: FieldProps) => (
              <TextField
                {...field}
                fullWidth
                size="small"
                label={t('MHA Amount Per Month')}
                type="number"
                error={meta.touched && Boolean(meta.error)}
                helperText={meta.touched && meta.error}
                variant="outlined"
                inputProps={{ min: 0, step: 0.01 }}
                InputProps={{
                  startAdornment: <span className="prefix">$</span>,
                }}
              />
            )}
          </Field>
        </Grid>

        <Grid item xs={12}>
          <Field name="solidMonthlySupportDeveloped">
            {({ field, meta }: FieldProps) => (
              <TextField
                {...field}
                fullWidth
                size="small"
                label={t('Solid Monthly Support Developed')}
                type="number"
                error={meta.touched && Boolean(meta.error)}
                helperText={meta.touched && meta.error}
                variant="outlined"
                inputProps={{ min: 0, step: 0.01 }}
                InputProps={{
                  startAdornment: <span className="prefix">$</span>,
                }}
              />
            )}
          </Field>
        </Grid>
      </Grid>
    </StyledFinancialForm>
  );
};
