import React, { useMemo } from 'react';
import { TableCell, TableRow, Typography } from '@mui/material';
import { useFormikContext } from 'formik';
import { useTranslation } from 'react-i18next';
import { FormCard } from 'src/components/Reports/Shared/CalculationReports/FormCard/FormCard';
import { useLocale } from 'src/hooks/useLocale';
import { currencyFormat } from 'src/lib/intlFormat';
import { CompleteFormValues } from '../../AdditionalSalaryRequest';
import { calculateDeductions } from '../../Shared/calculateDeductions';
import { useTotalSalaryRequest } from '../../Shared/useTotalSalaryRequest';

export const NetAdditionalSalary: React.FC = () => {
  const { t } = useTranslation();
  const locale = useLocale();

  const { values } = useFormikContext<CompleteFormValues>();

  const total = useTotalSalaryRequest(values);
  const { totalDeduction } = useMemo(
    () => calculateDeductions(values, total),
    [values.defaultPercentage, values.contribution403b, total],
  );

  return (
    <FormCard title={t('Net Additional Salary')} hideHeaders={true}>
      <TableRow>
        <TableCell sx={{ width: '70%' }}>
          <Typography variant="body1" fontWeight="bold">
            {t('Net Additional Salary (Before Taxes)')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t('Total Additional Salary Requested minus 403(b) Contribution')}
          </Typography>
        </TableCell>
        <TableCell sx={{ width: '30%', fontSize: 16 }}>
          {currencyFormat(total - totalDeduction, 'USD', locale)}
        </TableCell>
      </TableRow>
    </FormCard>
  );
};
