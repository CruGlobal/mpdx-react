import React from 'react';
import { TableCell, TableRow, Typography } from '@mui/material';
import { useFormikContext } from 'formik';
import { useTranslation } from 'react-i18next';
import { FormCard } from 'src/components/Reports/Shared/CalculationReports/FormCard/FormCard';
import { useLocale } from 'src/hooks/useLocale';
import { currencyFormat } from 'src/lib/intlFormat';
import { CompleteFormValues } from '../../AdditionalSalaryRequest';
import { useSalaryCalculations } from '../../Shared/useSalaryCalculations';
import { ElectionTypeQuestion } from './ElectionTypeQuestion';

export const Deduction: React.FC = () => {
  const { t } = useTranslation();
  const locale = useLocale();
  const { values: formValues } = useFormikContext<CompleteFormValues>();

  const { totalDeduction } = useSalaryCalculations({ values: formValues });

  return (
    <FormCard title={t('403(b) Deduction')} hideHeaders>
      <ElectionTypeQuestion />
      <TableRow>
        <TableCell sx={{ width: '70%' }}>
          <Typography variant="body1" fontWeight="bold">
            {t('Total 403(b) Deduction')}
          </Typography>
        </TableCell>
        <TableCell
          sx={{ width: '30%', fontSize: 16, fontWeight: 'bold' }}
          aria-label={t('Total requested amount')}
        >
          {currencyFormat(totalDeduction, 'USD', locale, {
            showTrailingZeros: true,
          })}
        </TableCell>
      </TableRow>
    </FormCard>
  );
};
