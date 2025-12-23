import {
  CardContent,
  CardHeader,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useSalaryCalculator } from '../SalaryCalculatorContext/SalaryCalculatorContext';
import { StepCard } from '../Shared/StepCard';
import { useFormatters } from './useFormatters';

export const SalaryCapCard: React.FC = () => {
  const { t } = useTranslation();
  const { hcm, calculation } = useSalaryCalculator();
  const { formatCurrency, formatPercentage, formatDecimal } = useFormatters();

  const [self, spouse] = hcm ?? [];
  const calcs = calculation?.calculations;
  const spouseCalcs = calculation?.spouseCalculations;

  const selfName = self && `${self.staffInfo.firstName}`;
  const spouseName = spouse && `${spouse.staffInfo.firstName}`;
  const hasSpouse = !!spouse && !!spouseCalcs;

  if (!calcs) {
    return (
      <StepCard>
        <CardHeader title={t('Salary Cap Calculation')} />
      </StepCard>
    );
  }

  const subtotal5 =
    (calcs.geographicAdjustment ?? 0) + (calcs.tenureAdjustment ?? 0);
  const seca6 = subtotal5 * 0.22;
  const spouseSubtotal5 = spouseCalcs
    ? (spouseCalcs.geographicAdjustment ?? 0) +
      (spouseCalcs.tenureAdjustment ?? 0)
    : undefined;
  const spouseSeca6 = spouseSubtotal5 ? spouseSubtotal5 * 0.22 : undefined;

  return (
    <StepCard>
      <CardHeader title={t('Salary Cap Calculation')} />
      <CardContent>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell scope="col">{t('Category')}</TableCell>
              <TableCell align="right" scope="col">
                {selfName}
              </TableCell>
              {hasSpouse && (
                <TableCell align="right" scope="col">
                  {spouseName}
                </TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell scope="row">1. {t('Annual Base')}</TableCell>
              <TableCell align="right">
                {formatCurrency(calcs.annualBase)}
              </TableCell>
              {hasSpouse && (
                <TableCell align="right">
                  {formatCurrency(spouseCalcs?.annualBase)}
                </TableCell>
              )}
            </TableRow>
            <TableRow>
              <TableCell scope="row">2. {t('Additional Salary')}</TableCell>
              <TableCell align="right">
                {formatCurrency(calcs.additionalSalary)}
              </TableCell>
              {hasSpouse && (
                <TableCell align="right">
                  {formatCurrency(spouseCalcs?.additionalSalary)}
                </TableCell>
              )}
            </TableRow>
            <TableRow>
              <TableCell scope="row">
                <div>3. {t('Geographic Adjustment')}</div>
                <Typography
                  variant="body2"
                  sx={{
                    color: 'text.secondary',
                    fontSize: '0.85rem',
                    mt: 0.5,
                  }}
                >
                  {t('City: {{city}}', {
                    city: calculation.location ?? t('None of these'),
                  })}
                  <br />
                  {t('Line 2 x Geographic Cost of Living Factor')}
                </Typography>
              </TableCell>
              <TableCell align="right">
                {formatCurrency(calcs.geographicAdjustment)}
              </TableCell>
              {hasSpouse && (
                <TableCell align="right">
                  {formatCurrency(spouseCalcs?.geographicAdjustment)}
                </TableCell>
              )}
            </TableRow>
            <TableRow>
              <TableCell scope="row">4. {t('Tenure')}</TableCell>
              <TableCell align="right">
                {formatCurrency(calcs.tenureAdjustment)}
              </TableCell>
              {hasSpouse && (
                <TableCell align="right">
                  {formatCurrency(spouseCalcs?.tenureAdjustment)}
                </TableCell>
              )}
            </TableRow>
            <TableRow>
              <TableCell scope="row">
                <div>5. {t('Subtotal')}</div>
                <Typography
                  variant="body2"
                  sx={{
                    color: 'text.secondary',
                    fontSize: '0.85rem',
                    mt: 0.5,
                  }}
                >
                  {t('Line 3 + Line 4')}
                </Typography>
              </TableCell>
              <TableCell align="right">
                {formatCurrency(calcs.oldSalaryCap)}
              </TableCell>
              {hasSpouse && (
                <TableCell align="right">
                  {formatCurrency(spouseCalcs.oldSalaryCap)}
                </TableCell>
              )}
            </TableRow>
            <TableRow>
              <TableCell scope="row">
                <div>6. {t('SECA')}</div>
                <Typography
                  variant="body2"
                  sx={{
                    color: 'text.secondary',
                    fontSize: '0.85rem',
                    mt: 0.5,
                  }}
                >
                  {t('(If applicable) Line 5 x {{seca}}', {
                    seca: formatDecimal(calcs.secaEstimatedFraction),
                  })}
                  <br />
                  {t('Includes tax on the social security')}
                </Typography>
              </TableCell>
              <TableCell align="right">
                {formatCurrency(calcs.oldSecaAmount)}
              </TableCell>
              {hasSpouse && (
                <TableCell align="right">
                  {formatCurrency(spouseCalcs.oldSecaAmount)}
                </TableCell>
              )}
            </TableRow>
            <TableRow>
              <TableCell scope="row">
                <div>7. {t('Subtotal')}</div>
                <Typography
                  variant="body2"
                  sx={{
                    color: 'text.secondary',
                    fontSize: '0.85rem',
                    mt: 0.5,
                  }}
                >
                  {t('Line 5 + Line 6')}
                </Typography>
              </TableCell>
              <TableCell align="right">
                {formatCurrency(subtotal5 + seca6)}
              </TableCell>
              {hasSpouse && (
                <TableCell align="right">
                  {formatCurrency(
                    spouseSubtotal5 && spouseSeca6
                      ? spouseSubtotal5 + spouseSeca6
                      : undefined,
                  )}
                </TableCell>
              )}
            </TableRow>
            <TableRow>
              <TableCell scope="row">8. {t('403(b) Contribution')}</TableCell>
              <TableCell align="right">-</TableCell>
              {hasSpouse && <TableCell align="right">-</TableCell>}
            </TableRow>
            <TableRow>
              <TableCell scope="row">
                8a. {t('403(b) Contribution Percentage')}
              </TableCell>
              <TableCell align="right">
                {calcs.contributing403bFraction
                  ? formatPercentage(calcs.contributing403bFraction * 100)
                  : '-'}
              </TableCell>
              {hasSpouse && (
                <TableCell align="right">
                  {spouseCalcs?.contributing403bFraction
                    ? formatPercentage(
                        spouseCalcs.contributing403bFraction * 100,
                      )
                    : '-'}
                </TableCell>
              )}
            </TableRow>
            <TableRow>
              <TableCell scope="row">
                8b. {t('1.00 Minus 403(b) Percentage')}
              </TableCell>
              <TableCell align="right">
                {formatPercentage(calcs.non403bFraction)}
              </TableCell>
              {hasSpouse && (
                <TableCell align="right">
                  {formatPercentage(spouseCalcs.non403bFraction)}
                </TableCell>
              )}
            </TableRow>
            <TableRow>
              <TableCell scope="row" colSpan={hasSpouse ? 3 : 2}>
                <div>9. {t('Maximum Allowable Salary (CAP)')}</div>
                <Typography
                  variant="body2"
                  sx={{
                    color: 'text.secondary',
                    fontSize: '0.85rem',
                    mt: 0.5,
                  }}
                >
                  {t('Line 7 × Line 8b')}
                  <br />
                  {t(
                    'For a couple, the combined CAPs cannot exceed {{familyCap}}, with neither individual exceeding {{individualCap}}.',
                    {
                      familyCap: formatCurrency(calcs.familyCap),
                      individualCap: formatCurrency(calcs.individualCap),
                    },
                  )}
                </Typography>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell scope="row">9a. {t('CAP')}</TableCell>
              <TableCell align="right">
                {formatCurrency(calcs.calculatedCap)}
              </TableCell>
              {hasSpouse && (
                <TableCell align="right">
                  {formatCurrency(spouseCalcs?.calculatedCap)}
                </TableCell>
              )}
            </TableRow>
            <TableRow>
              <TableCell scope="row">9b. {t('Minimum')}</TableCell>
              <TableCell align="right">TBD</TableCell>
              {hasSpouse && <TableCell align="right">TBD</TableCell>}
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </StepCard>
  );
};
