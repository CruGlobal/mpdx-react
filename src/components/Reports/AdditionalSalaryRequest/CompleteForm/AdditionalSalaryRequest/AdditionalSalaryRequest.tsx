import React from 'react';
import { TableCell, TableRow, TextField, Typography } from '@mui/material';
import { useFormikContext } from 'formik';
import { useTranslation } from 'react-i18next';
import { CurrencyAdornment } from 'src/components/Reports/GoalCalculator/Shared/Adornments';
import { FormCard } from 'src/components/Reports/Shared/CalculationReports/FormCard/FormCard';
import { useLocale } from 'src/hooks/useLocale';
import { currencyFormat } from 'src/lib/intlFormat';
import { CompleteFormValues } from '../../AdditionalSalaryRequest';
import { useCompleteFormCategories } from '../../Shared/useCompleteFormCategories';
import { useTotalSalaryRequest } from '../../Shared/useTotalSalaryRequest';

export const AdditionalSalaryRequest: React.FC = () => {
  const { t } = useTranslation();
  const locale = useLocale();

  const categories = useCompleteFormCategories();

  const { values, handleChange, handleBlur, errors, touched } =
    useFormikContext<CompleteFormValues>();

  // Calculate total excluding the defaultPercentage boolean
  const total = useTotalSalaryRequest(values);

  return (
    <FormCard title={t('Additional Salary Request')}>
      {categories.map(({ key, label, description }) => (
        <TableRow key={key}>
          <TableCell sx={{ width: '70%' }}>
            <Typography>{label}</Typography>
            <Typography variant="body2" color="text.secondary">
              {description}
            </Typography>
          </TableCell>
          <TableCell
            sx={{
              width: '30%',
              color: 'text.secondary',
              border: touched[key] && errors[key] ? '2px solid red' : '',
            }}
          >
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
          </TableCell>
        </TableRow>
      ))}
      <TableRow>
        <TableCell sx={{ width: '70%' }}>
          <Typography variant="body1" fontWeight="bold">
            {t('Total Additional Salary Requested')}
          </Typography>
        </TableCell>
        <TableCell
          sx={{ width: '30%', fontSize: 16, fontWeight: 'bold' }}
          data-testid="total-amount"
        >
          {currencyFormat(total, 'USD', locale)}
        </TableCell>
      </TableRow>
    </FormCard>
  );
};
