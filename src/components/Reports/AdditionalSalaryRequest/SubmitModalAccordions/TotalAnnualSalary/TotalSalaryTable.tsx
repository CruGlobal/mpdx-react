import { useMemo } from 'react';
import {
  Table,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  styled,
} from '@mui/material';
import { useFormikContext } from 'formik';
import { useTranslation } from 'react-i18next';
import { useLocale } from 'src/hooks/useLocale';
import { currencyFormat } from 'src/lib/intlFormat';
import { CompleteFormValues } from '../../AdditionalSalaryRequest';
import { useAdditionalSalaryRequest } from '../../Shared/AdditionalSalaryRequestContext';
import { useSalaryCalculations } from '../../Shared/useSalaryCalculations';

const StyledTableCell = styled(TableCell)(() => {
  return {
    fontWeight: 'normal',
  };
});

export const TotalSalaryTable: React.FC = () => {
  const { t } = useTranslation();
  const locale = useLocale();
  const currency = 'USD';

  const { requestData, user } = useAdditionalSalaryRequest();
  const { values } = useFormikContext<CompleteFormValues>();

  const asrValues = requestData?.latestAdditionalSalaryRequest;
  const calculations = asrValues?.calculations;

  const grossAnnualSalary = user?.currentSalary?.grossSalaryAmount ?? 0;

  const {
    total,
    totalAnnualSalary,
    maxAllowableSalary,
    additionalSalaryReceivedThisYear,
  } = useSalaryCalculations({
    values,
    calculations,
    grossSalaryAmount: grossAnnualSalary,
  });

  const summaryItems = useMemo(
    () => [
      {
        id: 'maxAllowable',
        label: t('Maximum Allowable Salary'),
        value: maxAllowableSalary,
      },
      {
        id: 'grossAnnual',
        label: t('Gross Annual Salary'),
        value: grossAnnualSalary,
      },
      {
        id: 'additionalReceived',
        label: t('Additional Salary Received This Year'),
        description: t('Does not include payments received for backpay.'),
        value: additionalSalaryReceivedThisYear,
      },
      {
        id: 'additionalRequested',
        label: t('Additional Salary on this Request'),
        description: t('Does not include requests made for backpay.'),
        value: total,
      },
    ],
    [
      t,
      maxAllowableSalary,
      grossAnnualSalary,
      additionalSalaryReceivedThisYear,
      total,
    ],
  );

  return (
    <Table sx={{ mt: 2 }}>
      <TableHead>
        <TableRow>
          <TableCell sx={{ width: '70%', fontWeight: 'normal' }}>
            {t('Description')}
          </TableCell>
          <TableCell sx={{ width: '30%', fontWeight: 'normal' }}>
            {t('Amount')}
          </TableCell>
        </TableRow>
        {summaryItems.map(({ id, label, description, value }) => (
          <TableRow key={id}>
            <StyledTableCell>
              <Typography variant="body2">{label}</Typography>
              {description && (
                <Typography variant="caption">{description}</Typography>
              )}
            </StyledTableCell>
            <StyledTableCell>
              {currencyFormat(value, currency, locale, {
                showTrailingZeros: true,
              })}
            </StyledTableCell>
          </TableRow>
        ))}
        <TableRow
          sx={{
            '& td, & th': { borderBottom: 'none' },
            backgroundColor: 'rgba(0, 0, 0, 0.04)',
          }}
        >
          <TableCell>{t('Total Annual Salary:')}</TableCell>
          <TableCell sx={{ color: 'warning.dark' }}>
            {currencyFormat(totalAnnualSalary, currency, locale, {
              showTrailingZeros: true,
            })}
          </TableCell>
        </TableRow>
      </TableHead>
    </Table>
  );
};
