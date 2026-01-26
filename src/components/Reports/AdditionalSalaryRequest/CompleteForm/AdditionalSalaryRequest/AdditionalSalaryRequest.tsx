import React from 'react';
import { TableCell, TableRow, Typography } from '@mui/material';
import { useFormikContext } from 'formik';
import { useTranslation } from 'react-i18next';
import { useAdditionalSalaryRequest } from 'src/components/Reports/AdditionalSalaryRequest/Shared/AdditionalSalaryRequestContext';
import { CurrencyAdornment } from 'src/components/Reports/GoalCalculator/Shared/Adornments';
import { FormCard } from 'src/components/Reports/Shared/CalculationReports/FormCard/FormCard';
import { PageEnum } from 'src/components/Reports/Shared/CalculationReports/Shared/sharedTypes';
import { useLocale } from 'src/hooks/useLocale';
import { currencyFormat } from 'src/lib/intlFormat';
import { CompleteFormValues } from '../../AdditionalSalaryRequest';
import { AutosaveCustomTextField } from '../../Shared/AutoSave/AutosaveCustomTextField';
import { useCompleteFormCategories } from '../../Shared/useCompleteFormCategories';
import { useSalaryCalculations } from '../../Shared/useSalaryCalculations';

export const AdditionalSalaryRequest: React.FC = () => {
  const { t } = useTranslation();
  const locale = useLocale();

  const { pageType, requestData } = useAdditionalSalaryRequest();
  const categories = useCompleteFormCategories();

  const formikContext = useFormikContext<CompleteFormValues>();
  const { values } = formikContext;

  const traditional403bContribution =
    requestData?.additionalSalaryRequest?.traditional403bContribution ?? 0;
  const { total } = useSalaryCalculations(traditional403bContribution);

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
            }}
          >
            {pageType === PageEnum.View ? (
              <Typography>
                {currencyFormat(values[key] || 0, 'USD', locale, {
                  showTrailingZeros: true,
                })}
              </Typography>
            ) : (
              <AutosaveCustomTextField
                fullWidth
                size="small"
                fieldName={key as keyof CompleteFormValues}
                placeholder={t('Enter amount')}
                InputProps={{
                  startAdornment: <CurrencyAdornment />,
                }}
              />
            )}
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
