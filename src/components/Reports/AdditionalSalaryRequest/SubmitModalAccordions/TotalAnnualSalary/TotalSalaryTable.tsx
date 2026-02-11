import { useMemo } from 'react';
import {
  Table,
  TableBody,
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

const StyledDescriptionTableCell = styled(TableCell)(() => ({
  fontWeight: 'normal',
  width: '70%',
}));

const StyledAmountTableCell = styled(TableCell)(() => ({
  fontWeight: 'normal',
  width: '30%',
}));

export const TotalSalaryTable: React.FC = () => {
  const { t } = useTranslation();
  const locale = useLocale();
  const currency = 'USD';

  const { requestData, maxAdditionalAllowableSalary } =
    useAdditionalSalaryRequest();
  const { values } = useFormikContext<CompleteFormValues>();

  const asrValues = requestData?.latestAdditionalSalaryRequest;
  const calculations = asrValues?.calculations;

  const {
    total,
    totalAnnualSalary,
    additionalSalaryReceivedThisYear,
    grossAnnualSalary,
  } = useSalaryCalculations({
    values,
    calculations,
  });

  const summaryItems = useMemo(
    () => [
      {
        id: 'maxAllowable',
        label: t('Maximum Allowable Salary'),
        value: maxAdditionalAllowableSalary,
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
      maxAdditionalAllowableSalary,
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
      </TableHead>
      <TableBody>
        {summaryItems.map(({ id, label, description, value }) => (
          <TableRow key={id}>
            <StyledDescriptionTableCell>
              <Typography variant="body2">{label}</Typography>
              {description && (
                <Typography variant="caption" color="text.secondary">
                  {description}
                </Typography>
              )}
            </StyledDescriptionTableCell>
            <StyledAmountTableCell>
              {currencyFormat(value, currency, locale, {
                showTrailingZeros: true,
              })}
            </StyledAmountTableCell>
          </TableRow>
        ))}
        <TableRow
          sx={{
            '& td, & th': { borderBottom: 'none' },
            backgroundColor: 'rgba(0, 0, 0, 0.04)',
          }}
        >
          <TableCell>
            <Typography variant="body2" fontWeight="bold">
              {t('Total Annual Salary:')}
            </Typography>
          </TableCell>
          <TableCell sx={{ color: 'warning.dark', fontWeight: 'bold' }}>
            {currencyFormat(totalAnnualSalary, currency, locale, {
              showTrailingZeros: true,
            })}
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
};
