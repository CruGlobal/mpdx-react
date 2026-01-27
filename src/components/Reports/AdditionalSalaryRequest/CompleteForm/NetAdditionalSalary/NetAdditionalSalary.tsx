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

export const NetAdditionalSalary: React.FC = () => {
  const { t } = useTranslation();
  const locale = useLocale();
  const { requestData } = useAdditionalSalaryRequest();
  const { values } = useFormikContext<CompleteFormValues>();

  const traditional403bContribution =
    requestData?.additionalSalaryRequest?.traditional403bContribution ?? 0;

  const { netSalary } = useSalaryCalculations({
    traditional403bContribution,
    values,
  });

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
          {currencyFormat(netSalary, 'USD', locale)}
        </TableCell>
      </TableRow>
    </FormCard>
  );
};
