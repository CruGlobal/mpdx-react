import React from 'react';
import { TableCell, TableRow, Typography } from '@mui/material';
import { useFormikContext } from 'formik';
import { useTranslation } from 'react-i18next';
import { FormCard } from 'src/components/Reports/Shared/CalculationReports/FormCard/FormCard';
import { useLocale } from 'src/hooks/useLocale';
import { currencyFormat } from 'src/lib/intlFormat';
import { CompleteFormValues } from '../../AdditionalSalaryRequest';
import { useAdditionalSalaryRequest } from '../../Shared/AdditionalSalaryRequestContext';
import { useSalaryCalculations } from '../../Shared/useSalaryCalculations';
import { DeductionCheckboxRow } from './DeductionCheckboxRow';

export const Deduction: React.FC = () => {
  const { t } = useTranslation();
  const locale = useLocale();
  const { traditional403bPercentage, roth403bPercentage } =
    useAdditionalSalaryRequest();
  const { values: formValues } = useFormikContext<CompleteFormValues>();

  const {
    calculatedTraditionalDeduction,
    calculatedRothDeduction,
    contribution403b,
    totalDeduction,
  } = useSalaryCalculations({ values: formValues });

  return (
    <FormCard title={t('403(b) Deduction')} hideHeaders>
      <DeductionCheckboxRow
        fieldName="deductTaxDeferredPercent"
        percentage={traditional403bPercentage}
        calculatedDeduction={calculatedTraditionalDeduction}
      />
      <DeductionCheckboxRow
        fieldName="deductRothPercent"
        percentage={roth403bPercentage}
        calculatedDeduction={calculatedRothDeduction}
      />
      <TableRow>
        <TableCell sx={{ width: '70%' }}>
          <Typography variant="body1">
            {t('403(b) Contribution Requested as Additional Salary')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t('This is the amount you requested above.')}
          </Typography>
        </TableCell>
        <TableCell sx={{ width: '30%', fontSize: 16 }}>
          {currencyFormat(contribution403b, 'USD', locale)}
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell sx={{ width: '70%' }}>
          <Typography variant="body1" fontWeight="bold">
            {t('Total 403(b) Deduction')}
          </Typography>
        </TableCell>
        <TableCell
          sx={{ width: '30%', fontSize: 16, fontWeight: 'bold' }}
          aria-label="Total requested amount"
        >
          {currencyFormat(totalDeduction, 'USD', locale)}
        </TableCell>
      </TableRow>
    </FormCard>
  );
};
