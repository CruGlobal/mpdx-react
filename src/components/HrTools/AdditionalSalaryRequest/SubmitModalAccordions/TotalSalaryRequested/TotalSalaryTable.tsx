import { useMemo } from 'react';
import InfoIcon from '@mui/icons-material/Info';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
  styled,
} from '@mui/material';
import { useFormikContext } from 'formik';
import { DateTime } from 'luxon';
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

const InfoTooltipIcon = styled(InfoIcon)(({ theme }) => ({
  marginLeft: theme.spacing(0.5),
  verticalAlign: 'middle',
  cursor: 'pointer',
  color: theme.palette.mpdxGrayDark.main,
  fontSize: '1rem',
}));

export const TotalSalaryTable: React.FC = () => {
  const { t } = useTranslation();
  const locale = useLocale();
  const currency = 'USD';

  const { calculations } = useAdditionalSalaryRequest();
  const { values } = useFormikContext<CompleteFormValues>();

  const individualCap = calculations?.currentSalaryCap ?? 0;
  const outstandingSalaryRequest = calculations?.outstandingSalaryRequest;
  const salaryRequestTooltip = t(
    'Includes your pending Salary Calculation Request',
  );
  const backpayExplanation = t('Does not include backpay for {{year}}.', {
    year: DateTime.local().year,
  });

  const {
    nonBackpayTotal,
    requestedAnnualSalary,
    additionalSalaryReceivedThisYear,
    grossAnnualSalary,
  } = useSalaryCalculations({
    values,
  });

  const summaryItems = useMemo(
    () => [
      {
        id: 'maxAllowable',
        label: t('Maximum Allowable Salary'),
        value: individualCap,
      },
      {
        id: 'grossAnnual',
        label: t('Gross Annual Salary'),
        tooltip: outstandingSalaryRequest ? salaryRequestTooltip : undefined,
        value: grossAnnualSalary,
      },
      {
        id: 'additionalReceived',
        label: t('Additional Salary Previously Requested This Year'),
        description: backpayExplanation,
        value: additionalSalaryReceivedThisYear,
      },
      {
        id: 'additionalRequested',
        label: t('Additional Salary on This Request'),
        description: backpayExplanation,
        value: nonBackpayTotal,
      },
    ],
    [
      t,
      individualCap,
      grossAnnualSalary,
      additionalSalaryReceivedThisYear,
      nonBackpayTotal,
      outstandingSalaryRequest,
      salaryRequestTooltip,
      backpayExplanation,
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
        {summaryItems.map(({ id, label, description, tooltip, value }) => (
          <TableRow key={id}>
            <StyledDescriptionTableCell>
              <Typography variant="body2">
                {label}
                {tooltip && (
                  <Tooltip title={tooltip}>
                    <InfoTooltipIcon />
                  </Tooltip>
                )}
              </Typography>
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
              {t('Total Salary Requested:')}
              {outstandingSalaryRequest && (
                <Tooltip title={salaryRequestTooltip}>
                  <InfoTooltipIcon />
                </Tooltip>
              )}
            </Typography>
          </TableCell>
          <TableCell sx={{ color: 'warning.dark', fontWeight: 'bold' }}>
            {currencyFormat(requestedAnnualSalary, currency, locale, {
              showTrailingZeros: true,
            })}
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
};
