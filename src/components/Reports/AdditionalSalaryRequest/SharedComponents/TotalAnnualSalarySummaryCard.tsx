import React from 'react';
import {
  CardContent,
  CardHeader,
  Table,
  TableCell,
  TableRow,
  Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useLocale } from 'src/hooks/useLocale';
import { currencyFormat } from 'src/lib/intlFormat';
import { useAdditionalSalaryRequest } from '../Shared/AdditionalSalaryRequestContext';
import { useSalaryCalculations } from '../Shared/useSalaryCalculations';
import { StepCard } from './StepCard';

export const TotalAnnualSalarySummaryCard: React.FC = () => {
  const { t } = useTranslation();
  const locale = useLocale();
  const { requestData } = useAdditionalSalaryRequest();

  const values = requestData?.additionalSalaryRequest;

  const traditional403bContribution =
    requestData?.additionalSalaryRequest?.traditional403bContribution ?? 0;

  const { netSalary } = useSalaryCalculations({
    traditional403bContribution,
    values,
  });

  return (
    <StepCard
      sx={{
        '.MuiTableCell-head.MuiTableCell-root': {
          width: '25%',
        },
      }}
    >
      <CardHeader title={t('Total Annual Salary')} />
      <CardContent>
        <Table>
          <TableRow>
            <TableCell sx={{ width: '70%' }}>
              <Typography variant="body1" fontWeight="bold">
                {t('Net Additional Salary (Before Taxes)')}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t(
                  'Total Additional Salary Requested minus 403(b) Contribution',
                )}
              </Typography>
            </TableCell>
            <TableCell sx={{ width: '30%', fontSize: 16 }}>
              {currencyFormat(netSalary, 'USD', locale)}
            </TableCell>
          </TableRow>
        </Table>
      </CardContent>
    </StepCard>
  );
};
