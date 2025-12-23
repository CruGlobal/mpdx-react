import {
  CardContent,
  CardHeader,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useSalaryCalculator } from '../SalaryCalculatorContext/SalaryCalculatorContext';
import { StepCard } from '../Shared/StepCard';
import { SummaryTable } from './SummaryTable';
import { useFormatters } from './useFormatters';

export const SalaryCapCard: React.FC = () => {
  const { t } = useTranslation();
  const { hcmUser, hcmSpouse, calculation } = useSalaryCalculator();
  const { formatCurrency, formatPercentage, formatDecimal } = useFormatters();

  const calcs = calculation?.calculations;
  const spouseCalcs = calculation?.spouseCalculations;

  const hasSpouse = !!hcmSpouse && !!spouseCalcs;

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
        <SummaryTable>
          <TableHead>
            <TableRow>
              <TableCell scope="col">{t('Category')}</TableCell>
              <TableCell scope="col">{hcmUser?.staffInfo.firstName}</TableCell>
              {hasSpouse && (
                <TableCell scope="col">
                  {hcmSpouse?.staffInfo.firstName}
                </TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell scope="row">1. {t('Annual Base')}</TableCell>
              <TableCell>{formatCurrency(calcs.annualBase)}</TableCell>
              {hasSpouse && (
                <TableCell>{formatCurrency(spouseCalcs?.annualBase)}</TableCell>
              )}
            </TableRow>
            <TableRow>
              <TableCell scope="row">2. {t('Additional Salary')}</TableCell>
              <TableCell>{formatCurrency(calcs.additionalSalary)}</TableCell>
              {hasSpouse && (
                <TableCell>
                  {formatCurrency(spouseCalcs?.additionalSalary)}
                </TableCell>
              )}
            </TableRow>
            <TableRow>
              <TableCell scope="row">
                3. {t('Geographic Adjustment')}
                <span className="explanation">
                  {t('City: {{city}}', {
                    city: calculation.location ?? t('None of these'),
                  })}
                  <br />
                  {t('Line 2 x Geographic Cost of Living Factor')}
                </span>
              </TableCell>
              <TableCell>
                {formatCurrency(calcs.geographicAdjustment)}
              </TableCell>
              {hasSpouse && (
                <TableCell>
                  {formatCurrency(spouseCalcs?.geographicAdjustment)}
                </TableCell>
              )}
            </TableRow>
            <TableRow>
              <TableCell scope="row">4. {t('Tenure')}</TableCell>
              <TableCell>{formatCurrency(calcs.tenureAdjustment)}</TableCell>
              {hasSpouse && (
                <TableCell>
                  {formatCurrency(spouseCalcs?.tenureAdjustment)}
                </TableCell>
              )}
            </TableRow>
            <TableRow>
              <TableCell scope="row">
                5. {t('Subtotal')}
                <span className="explanation">{t('Line 3 + Line 4')}</span>
              </TableCell>
              <TableCell>{formatCurrency(calcs.oldSalaryCap)}</TableCell>
              {hasSpouse && (
                <TableCell>
                  {formatCurrency(spouseCalcs.oldSalaryCap)}
                </TableCell>
              )}
            </TableRow>
            <TableRow>
              <TableCell scope="row">
                6. {t('SECA')}
                <span className="explanation">
                  {t('(If applicable) Line 5 x {{seca}}', {
                    seca: formatDecimal(calcs.secaEstimatedFraction),
                  })}
                  <br />
                  {t('Includes tax on the social security')}
                </span>
              </TableCell>
              <TableCell>{formatCurrency(calcs.oldSecaAmount)}</TableCell>
              {hasSpouse && (
                <TableCell>
                  {formatCurrency(spouseCalcs.oldSecaAmount)}
                </TableCell>
              )}
            </TableRow>
            <TableRow>
              <TableCell scope="row">
                7. {t('Subtotal')}
                <span className="explanation">{t('Line 5 + Line 6')}</span>
              </TableCell>
              <TableCell>{formatCurrency(subtotal5 + seca6)}</TableCell>
              {hasSpouse && (
                <TableCell>
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
              <TableCell>-</TableCell>
              {hasSpouse && <TableCell align="right">-</TableCell>}
            </TableRow>
            <TableRow>
              <TableCell scope="row" className="sub-item">
                a. {t('403(b) Contribution Percentage')}
              </TableCell>
              <TableCell>
                {calcs.contributing403bFraction
                  ? formatPercentage(calcs.contributing403bFraction * 100)
                  : '-'}
              </TableCell>
              {hasSpouse && (
                <TableCell>
                  {spouseCalcs?.contributing403bFraction
                    ? formatPercentage(
                        spouseCalcs.contributing403bFraction * 100,
                      )
                    : '-'}
                </TableCell>
              )}
            </TableRow>
            <TableRow>
              <TableCell scope="row" className="sub-item">
                b. {t('1.00 Minus 403(b) Percentage')}
              </TableCell>
              <TableCell>{formatPercentage(calcs.non403bFraction)}</TableCell>
              {hasSpouse && (
                <TableCell>
                  {formatPercentage(spouseCalcs.non403bFraction)}
                </TableCell>
              )}
            </TableRow>
            <TableRow>
              <TableCell scope="row" colSpan={hasSpouse ? 3 : 2}>
                9. {t('Maximum Allowable Salary (CAP)')}
                <span className="explanation">
                  {t('Line 7 × Line 8b')}
                  <br />
                  {t(
                    'For a couple, the combined CAPs cannot exceed {{familyCap}}, with neither individual exceeding {{individualCap}}.',
                    {
                      familyCap: formatCurrency(calcs.familyCap),
                      individualCap: formatCurrency(calcs.individualCap),
                    },
                  )}
                </span>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell scope="row" className="sub-item">
                a. {t('CAP')}
              </TableCell>
              <TableCell>{formatCurrency(calcs.calculatedCap)}</TableCell>
              {hasSpouse && (
                <TableCell>
                  {formatCurrency(spouseCalcs?.calculatedCap)}
                </TableCell>
              )}
            </TableRow>
            <TableRow>
              <TableCell scope="row" className="sub-item">
                b. {t('Minimum')}
              </TableCell>
              <TableCell>TBD</TableCell>
              {hasSpouse && <TableCell align="right">TBD</TableCell>}
            </TableRow>
          </TableBody>
        </SummaryTable>
      </CardContent>
    </StepCard>
  );
};
